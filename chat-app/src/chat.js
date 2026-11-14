export const USERS = ["Alan", "Bob", "Carol", "Dean", "Elin"];
export const MAX_LENGTH = 2000;
export const STORAGE_KEY = "common.messages.v1";

export function createMessage(text, random = Math.random) {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > MAX_LENGTH) return null;
  return {
    id: crypto.randomUUID(),
    author: USERS[Math.floor(random() * USERS.length)],
    text: trimmed,
    likes: 0,
    createdAt: new Date().toISOString(),
  };
}

export function readMessages(storage) {
  try {
    const value = storage.getItem(STORAGE_KEY);
    if (!value) return { messages: [], warning: "" };
    const parsed = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      !parsed.every(
        (m) =>
          m &&
          typeof m.id === "string" &&
          USERS.includes(m.author) &&
          typeof m.text === "string" &&
          m.text.trim().length > 0 &&
          m.text.length <= MAX_LENGTH &&
          Number.isSafeInteger(m.likes) &&
          m.likes >= 0 &&
          typeof m.createdAt === "string" &&
          Number.isFinite(Date.parse(m.createdAt)),
      ) ||
      new Set(parsed.map((m) => m.id)).size !== parsed.length
    )
      throw new Error("Invalid saved conversation");
    return { messages: parsed, warning: "" };
  } catch {
    return {
      messages: [],
      warning:
        "Your saved conversation could not be loaded. You can start a new one here.",
    };
  }
}
