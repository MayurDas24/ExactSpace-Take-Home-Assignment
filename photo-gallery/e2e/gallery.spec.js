import { test, expect } from "@playwright/test";

const photo = (id) => ({
  id: String(id),
  author: `Photographer ${id}`,
  width: 1200,
  height: 800,
  download_url: `https://picsum.photos/id/${id}/1200/800`,
});
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="533"><rect width="800" height="533" fill="#d2d8c8"/><path d="M0 450 260 90 550 533H0" fill="#627664"/><path d="m300 533 240-360 260 360" fill="#899b80"/></svg>';

test("infinite scroll, likes, failure/retry, empty end, accessible preview and mobile layout", async ({
  page,
}) => {
  const errors = [];
  const requests = [];
  let failSecond = true;
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("https://picsum.photos/id/**", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: svg }),
  );
  await page.route("https://picsum.photos/v2/list?*", (route) => {
    const number = Number(
      new URL(route.request().url()).searchParams.get("page"),
    );
    requests.push(number);
    if (number === 2 && failSecond) {
      failSecond = false;
      return route.fulfill({ status: 503, body: "" });
    }
    return route.fulfill({
      json:
        number === 1
          ? [1, 2, 3, 4, 5, 6].map(photo)
          : number === 2
            ? [photo(6), photo(7), photo(8)]
            : [],
    });
  });
  await page.goto("/");
  await expect(page.getByRole("article")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Like photo by Photographer 1. 0 likes" })
    .click();
  await page
    .getByRole("button", { name: "Like photo by Photographer 1. 1 likes" })
    .click();
  await page
    .getByRole("button", {
      name: "Enlarge photograph by Photographer 1",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Enlarge photograph by Photographer 1",
      exact: true,
    }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: /Discover more/ })
    .scrollIntoViewIfNeeded();
  await expect(page.getByRole("alert")).toContainText("503");
  await page.getByRole("button", { name: /Try again/ }).click();
  await expect(page.getByRole("article")).toHaveCount(8);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(
    page.getByText("You’ve seen the whole collection."),
  ).toBeVisible();
  expect(requests).toEqual([1, 2, 2, 3]);
  await expect(
    page.getByRole("button", { name: "Like photo by Photographer 1. 2 likes" }),
  ).toBeAttached();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", {
      name: "Enlarge photograph by Photographer 1",
      exact: true,
    })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Close photo preview" }).click();
  expect(errors).toEqual([]);
});

test("empty feed and broken images have usable fallback states", async ({
  page,
}) => {
  await page.route("https://picsum.photos/v2/list?*", (route) =>
    route.fulfill({ json: [] }),
  );
  await page.goto("/");
  await expect(page.getByText("A quiet moment.")).toBeVisible();
  await page.unroute("https://picsum.photos/v2/list?*");
  await page.route("https://picsum.photos/v2/list?*", (route) =>
    route.fulfill({ json: [photo(1)] }),
  );
  await page.route("https://picsum.photos/id/**", (route) => route.abort());
  await page.reload();
  await expect(page.getByText("Image unavailable")).toBeVisible();
  await page.unroute("https://picsum.photos/id/**");
  await page.route("https://picsum.photos/id/**", (route) =>
    route.fulfill({ contentType: "image/svg+xml", body: svg }),
  );
  await page.getByRole("button", { name: "Retry image" }).click();
  await expect(
    page.getByRole("img", { name: "Photograph by Photographer 1" }),
  ).toBeVisible();
});
