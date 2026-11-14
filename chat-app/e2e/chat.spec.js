import { test, expect } from "@playwright/test";

test("complete chat workflow, persistence, keyboard and mobile layout", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  const input = page.getByRole("textbox", { name: "Message to the team" });
  await expect(
    page.getByRole("heading", { name: "Better, together." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send message" }),
  ).toBeDisabled();
  await input.fill("Hello team");
  await page.getByRole("button", { name: "Choose emoji" }).click();
  await page.getByRole("button", { name: "Wave", exact: true }).click();
  await input.press("End");
  await input.pressSequentially(" @Ca");
  await input.press("Enter");
  await expect(input).toHaveValue(/@Carol /);
  await input.press("Enter");
  const message = page.getByTestId("message");
  await expect(message).toHaveCount(1);
  await expect(message).toContainText("@Carol");
  await message.getByRole("button", { name: /0 likes/ }).click();
  await message.getByRole("button", { name: /1 likes/ }).click();
  await expect(message.getByRole("button", { name: /2 likes/ })).toBeVisible();
  await page.reload();
  await expect(page.getByTestId("message")).toContainText("@Carol");
  await expect(page.getByRole("button", { name: /2 likes/ })).toBeVisible();
  await page.screenshot({
    path: "../docs/screenshots/chat-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await input.fill("A mobile message with a new line");
  await input.press("Shift+Enter");
  await input.pressSequentially("And a second line.");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByTestId("message")).toHaveCount(2);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "../docs/screenshots/chat-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});

test("long content remains contained and text is rendered safely", async ({
  page,
}) => {
  await page.goto("/");
  await page.setViewportSize({ width: 320, height: 700 });
  const input = page.getByRole("textbox");
  await input.fill('<script>alert("unsafe")</script>' + "x".repeat(1800));
  await input.press("Enter");
  await expect(page.getByTestId("message")).toContainText("<script>");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(input).toHaveAttribute("maxlength", "2000");
});
