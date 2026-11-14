import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import App from "./App.jsx";
import { fetchPhotos, imageUrl } from "./api.js";

const photo = (id, author = `Artist ${id}`) => ({
  id,
  author,
  width: 1200,
  height: 800,
  download_url: `https://picsum.photos/id/${id}/1200/800`,
});
const ok = (data) => ({ ok: true, json: async () => data });
let intersections;
beforeEach(() => {
  intersections = [];
  vi.stubGlobal("fetch", vi.fn());
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback) {
        intersections.push(callback);
      }
      observe() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("gallery feed", () => {
  it("loads sequential pages, appends unique photos, keeps likes, and stops on an empty page", async () => {
    fetch
      .mockResolvedValueOnce(ok([photo("1"), photo("2")]))
      .mockResolvedValueOnce(ok([photo("2"), photo("3")]))
      .mockResolvedValueOnce(ok([]));
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByText("Finding a new perspective…")).toBeInTheDocument();
    await screen.findByRole("article", { name: "Photo 1 by Artist 1" });
    await user.click(
      screen.getByRole("button", { name: "Like photo by Artist 1. 0 likes" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Like photo by Artist 1. 1 likes" }),
    );
    expect(
      screen.getByRole("button", { name: "Like photo by Artist 2. 0 likes" }),
    ).toBeInTheDocument();
    act(() => intersections.at(-1)([{ isIntersecting: true }]));
    await screen.findByRole("article", { name: "Photo 3 by Artist 3" });
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(
      screen.getByRole("button", { name: "Like photo by Artist 1. 2 likes" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Discover more/ }));
    await screen.findByText("You’ve seen the whole collection.");
    expect(fetch.mock.calls.map(([url]) => url)).toEqual(
      [1, 2, 3].map((page) => `https://picsum.photos/v2/list?page=${page}`),
    );
    expect(
      screen.queryByRole("button", { name: /Discover more/ }),
    ).not.toBeInTheDocument();
  });

  it("serializes repeated observer callbacks and retries the failed page without losing photos", async () => {
    let resolvePage;
    fetch
      .mockResolvedValueOnce(ok([photo("1")]))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolvePage = resolve;
          }),
      )
      .mockResolvedValueOnce(ok([photo("2")]));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("article");
    act(() => {
      intersections.at(-1)([{ isIntersecting: true }]);
      intersections.at(-1)([{ isIntersecting: true }]);
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    await act(async () => resolvePage({ ok: false, status: 503 }));
    expect(screen.getByRole("alert")).toHaveTextContent("503");
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    await screen.findByRole("article", { name: "Photo 2 by Artist 2" });
    expect(fetch.mock.calls[1][0]).toEqual(fetch.mock.calls[2][0]);
  });

  it("handles empty first pages and does not fetch more", async () => {
    fetch.mockResolvedValueOnce(ok([]));
    render(<App />);
    await screen.findByText("A quiet moment.");
    expect(screen.queryByRole("article")).not.toBeInTheDocument();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("recovers from network failure and offers a working image retry", async () => {
    fetch
      .mockRejectedValueOnce(new TypeError("Network error"))
      .mockResolvedValueOnce(ok([photo("1")]));
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText(/couldn’t reach the photo service/);
    await user.click(screen.getByRole("button", { name: /Try again/ }));
    const img = await screen.findByRole("img", {
      name: "Photograph by Artist 1",
    });
    fireEvent.error(img);
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Retry image" }));
    expect(
      screen.getByRole("img", { name: "Photograph by Artist 1" }),
    ).toBeInTheDocument();
  });

  it("supports manual pagination when IntersectionObserver is unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    delete window.IntersectionObserver;
    fetch.mockResolvedValueOnce(ok([photo("1")])).mockResolvedValueOnce(ok([]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /Discover more/ }),
    );
    await screen.findByText("You’ve seen the whole collection.");
  });

  it("aborts its outstanding request on unmount", async () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    const view = render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const signal = fetch.mock.calls[0][1].signal;
    view.unmount();
    expect(signal.aborted).toBe(true);
  });

  it("times out a stalled request and allows retrying the same page", async () => {
    vi.useFakeTimers();
    fetch
      .mockImplementationOnce(
        (_url, { signal }) =>
          new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      )
      .mockResolvedValueOnce(ok([photo("1")]));
    render(<App />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(screen.getByRole("alert")).toHaveTextContent("taking too long");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    });
    expect(screen.getByRole("article")).toBeInTheDocument();
    expect(fetch.mock.calls[0][0]).toEqual(fetch.mock.calls[1][0]);
  });

  it("handles StrictMode effect replay without accepting stale responses", async () => {
    let resolveStale;
    fetch
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveStale = resolve;
          }),
      )
      .mockResolvedValueOnce(ok([photo("2")]));
    render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
    await screen.findByRole("article", { name: "Photo 1 by Artist 2" });
    await act(async () => resolveStale(ok([photo("1")])));
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(
      screen.queryByRole("article", { name: /Artist 1/ }),
    ).not.toBeInTheDocument();
  });

  it("continues past a page containing only duplicate photos", async () => {
    fetch
      .mockResolvedValueOnce(ok([photo("1")]))
      .mockResolvedValueOnce(ok([photo("1")]))
      .mockResolvedValueOnce(ok([photo("2")]));
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      await screen.findByRole("button", { name: /Discover more/ }),
    );
    expect(screen.getAllByRole("article")).toHaveLength(1);
    await user.click(
      await screen.findByRole("button", { name: /Discover more/ }),
    );
    await screen.findByRole("article", { name: "Photo 2 by Artist 2" });
    expect(fetch.mock.calls[2][0]).toContain("page=3");
  });
});

describe("API boundary", () => {
  it("rejects non-array and unsafe or incomplete photo records", async () => {
    for (const data of [
      {},
      [photo("1"), {}],
      [{ ...photo("1"), download_url: "javascript:alert(1)" }],
      [{ ...photo("1"), download_url: "https://other.example/id/1/1200/800" }],
    ]) {
      fetch.mockResolvedValueOnce(ok(data));
      await expect(fetchPhotos(1)).rejects.toThrow("unexpected data");
    }
  });
  it("derives appropriately sized images from download_url without enlarging originals", () => {
    expect(imageUrl(photo("1"))).toBe("https://picsum.photos/id/1/800/533");
    expect(imageUrl(photo("1"), 1600)).toBe(photo("1").download_url);
  });
});
