import { useRef, useState } from "react";
import { MAX_LENGTH, USERS } from "./chat.js";
import Icon from "./Icon.jsx";

const EMOJIS = [
  ["👋", "Wave"],
  ["😊", "Smile"],
  ["🎉", "Celebrate"],
  ["💡", "Idea"],
  ["❤️", "Heart"],
  ["👍", "Thumbs up"],
  ["🚀", "Rocket"],
  ["🙌", "Hooray"],
];

export default function Composer({ onSend, draft, setDraft, inputRef }) {
  const [picker, setPicker] = useState(null);
  const [mention, setMention] = useState(null);
  const [activeUser, setActiveUser] = useState(0);
  const selection = useRef({ start: draft.length, end: draft.length });
  const suggestions = USERS.filter(
    (user) =>
      !mention || user.toLowerCase().startsWith(mention.query.toLowerCase()),
  );

  function updateSelection() {
    const input = inputRef.current;
    selection.current = {
      start: input.selectionStart,
      end: input.selectionEnd,
    };
  }
  function detectMention(value, caret) {
    const match = value.slice(0, caret).match(/(?:^|\s)@([a-z]*)$/i);
    setMention(
      match
        ? { start: caret - match[1].length - 1, end: caret, query: match[1] }
        : null,
    );
    setActiveUser(0);
  }
  function insert(text, range = selection.current) {
    const next = draft.slice(0, range.start) + text + draft.slice(range.end);
    if (next.length > MAX_LENGTH) return;
    setDraft(next);
    setPicker(null);
    setMention(null);
    const caret = range.start + text.length;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(caret, caret);
      selection.current = { start: caret, end: caret };
    });
  }
  function chooseUser(user) {
    insert(`@${user} `, mention || selection.current);
  }
  function send(event) {
    event.preventDefault();
    if (onSend(draft)) {
      setDraft("");
      setMention(null);
      setPicker(null);
      selection.current = { start: 0, end: 0 };
      inputRef.current?.focus();
    }
  }
  function onKeyDown(event) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      setMention(null);
      setPicker(null);
    }
    if (
      mention &&
      suggestions.length &&
      ["ArrowDown", "ArrowUp", "Enter"].includes(event.key)
    ) {
      event.preventDefault();
      if (event.key === "Enter") chooseUser(suggestions[activeUser]);
      else
        setActiveUser(
          (value) =>
            (value +
              (event.key === "ArrowDown" ? 1 : -1) +
              suggestions.length) %
            suggestions.length,
        );
    } else if (event.key === "Enter" && !event.shiftKey) send(event);
  }

  return (
    <form
      className="composer"
      onSubmit={send}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPicker(null);
          setMention(null);
        }
      }}
    >
      {(picker || mention) && (
        <div
          className="picker"
          aria-label={
            picker === "emoji" ? "Choose an emoji" : "Mention a teammate"
          }
        >
          <div className="picker-heading">
            {picker === "emoji" ? "A little expression" : "Mention a teammate"}
            <button
              type="button"
              onClick={() => {
                setPicker(null);
                setMention(null);
                inputRef.current?.focus();
              }}
              aria-label="Close picker"
            >
              ×
            </button>
          </div>
          {picker === "emoji" ? (
            <div className="emoji-grid">
              {EMOJIS.map(([emoji, name]) => (
                <button
                  type="button"
                  key={name}
                  aria-label={name}
                  onClick={() => insert(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          ) : (
            <div className="mention-list">
              {suggestions.length ? (
                suggestions.map((user, index) => (
                  <button
                    type="button"
                    className={
                      mention && index === activeUser ? "selected" : ""
                    }
                    key={user}
                    aria-label={`Mention ${user}`}
                    onClick={() => chooseUser(user)}
                  >
                    <span
                      className={`avatar small color-${USERS.indexOf(user)}`}
                      aria-hidden="true"
                    >
                      {user[0]}
                    </span>
                    {user}
                    <span className="mention-hint">@{user.toLowerCase()}</span>
                  </button>
                ))
              ) : (
                <p>No matching teammates.</p>
              )}
            </div>
          )}
        </div>
      )}
      <div className="input-shell">
        <label className="sr-only" htmlFor="message">
          Message to the team
        </label>
        <textarea
          id="message"
          ref={inputRef}
          value={draft}
          maxLength={MAX_LENGTH}
          placeholder="Share a thought with the team…"
          rows={2}
          onSelect={updateSelection}
          onClick={(event) =>
            detectMention(draft, event.currentTarget.selectionStart)
          }
          onChange={(event) => {
            setDraft(event.target.value);
            updateSelection();
            detectMention(event.target.value, event.target.selectionStart);
            setPicker(null);
          }}
          onKeyDown={onKeyDown}
          aria-describedby="composer-help"
        />
        <div className="composer-toolbar">
          <div className="tools">
            <button
              type="button"
              className="tool-button"
              aria-label="Choose emoji"
              aria-expanded={picker === "emoji"}
              onClick={() => {
                setMention(null);
                setPicker(picker === "emoji" ? null : "emoji");
              }}
            >
              <Icon name="smile" />
            </button>
            <button
              type="button"
              className="tool-button mention-tool"
              aria-label="Mention a teammate"
              aria-expanded={picker === "mention" || !!mention}
              onClick={() => {
                setMention(null);
                setPicker(picker === "mention" ? null : "mention");
              }}
            >
              @
            </button>
            <span
              className="character-count"
              aria-label={`${draft.length} of ${MAX_LENGTH} characters`}
            >
              {draft.length} / {MAX_LENGTH.toLocaleString()}
            </span>
          </div>
          <button
            className="send-button"
            type="submit"
            disabled={!draft.trim()}
          >
            <span>Send message</span>
            <Icon name="send" width="17" height="17" />
          </button>
        </div>
      </div>
      <p className="composer-help" id="composer-help">
        <span>
          <kbd>Enter</kbd> to send · <kbd>Shift + Enter</kbd> for a new line
        </span>
        <span>Everyone has a voice.</span>
      </p>
    </form>
  );
}
