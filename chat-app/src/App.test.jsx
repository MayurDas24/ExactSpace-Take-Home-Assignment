import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";
import {
  createMessage,
  MAX_LENGTH,
  readMessages,
  STORAGE_KEY,
  USERS,
} from "./chat.js";

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("conversation", () => {
  it("rejects blank messages, sends with a random allowed author, and increments each message independently", async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, "random").mockReturnValue(0.41);
    render(<App />);
    const input = screen.getByRole("textbox", { name: "Message to the team" });
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    await user.type(input, "   ");
    expect(screen.getByRole("button", { name: "Send message" })).toBeDisabled();
    await user.clear(input);
    await user.type(input, "Hello team!");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    const first = screen.getByTestId("message");
    expect(within(first).getByText("Carol")).toBeInTheDocument();
    await user.click(within(first).getByRole("button", { name: /0 likes/ }));
    await user.click(within(first).getByRole("button", { name: /1 likes/ }));
    expect(
      within(first).getByRole("button", { name: /2 likes/ }),
    ).toBeInTheDocument();
    await user.type(input, "A second thought{Enter}");
    expect(screen.getAllByTestId("message")).toHaveLength(2);
    expect(
      within(screen.getAllByTestId("message")[1]).getByRole("button", {
        name: /0 likes/,
      }),
    ).toBeInTheDocument();
  });

  it("supports multiline input and does not send while an IME is composing", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole("textbox");
    await user.type(input, "Line one{Shift>}{Enter}{/Shift}Line two");
    expect(input).toHaveValue("Line one\nLine two");
    expect(screen.queryByTestId("message")).not.toBeInTheDocument();
    fireEvent.keyDown(input, { key: "Enter", isComposing: true });
    expect(screen.queryByTestId("message")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("message")).toHaveTextContent(
      "Line one Line two",
    );
  });

  it("inserts emojis and mentions, including typed @ with keyboard selection", async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = screen.getByRole("textbox");
    await user.click(screen.getByRole("button", { name: "Choose emoji" }));
    await user.click(screen.getByRole("button", { name: "Wave" }));
    expect(input).toHaveValue("👋");
    await user.type(input, " @Ca");
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("👋 @Carol ");
    await user.click(
      screen.getByRole("button", { name: "Mention a teammate" }),
    );
    await user.click(screen.getByRole("button", { name: "Mention Bob" }));
    expect(input).toHaveValue("👋 @Carol @Bob ");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText("@Carol").tagName).toBe("MARK");
    expect(screen.getByText("@Bob").tagName).toBe("MARK");
  });

  it("restores saved messages and likes on remount", async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await user.type(screen.getByRole("textbox"), "Remember this{Enter}");
    await user.click(screen.getByRole("button", { name: /Like message/ }));
    view.unmount();
    render(<App />);
    expect(screen.getByText("Remember this")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /1 likes/ })).toBeInTheDocument();
  });

  it("recovers from corrupted storage and keeps working if saving fails", async () => {
    localStorage.setItem(STORAGE_KEY, "{invalid");
    render(<App />);
    expect(
      screen.getByText(/saved conversation could not be loaded/),
    ).toBeInTheDocument();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Quota exceeded");
    });
    const user = userEvent.setup();
    await user.type(screen.getByRole("textbox"), "Still here{Enter}");
    expect(screen.getByText("Still here")).toBeInTheDocument();
    expect(screen.getByText(/could not be saved/)).toBeInTheDocument();
  });
});

describe("message validation", () => {
  it("enforces the length limit, trims input and maps the complete username range", () => {
    expect(createMessage(" \n ")).toBeNull();
    expect(createMessage("x".repeat(MAX_LENGTH + 1))).toBeNull();
    expect(createMessage("x".repeat(MAX_LENGTH)).text).toHaveLength(MAX_LENGTH);
    expect(createMessage("  hello  ").text).toBe("hello");
    USERS.forEach((name, index) =>
      expect(
        createMessage("hello", () => (index + 0.5) / USERS.length).author,
      ).toBe(name),
    );
  });
  it("rejects malformed saved records and duplicate ids", () => {
    const message = createMessage("hello");
    for (const data of [
      {},
      [{ ...message, author: "Unknown" }],
      [{ ...message, likes: -1 }],
      [{ ...message, createdAt: "yesterday" }],
      [message, message],
    ]) {
      expect(
        readMessages({ getItem: () => JSON.stringify(data) }).warning,
      ).not.toBe("");
    }
  });
});
