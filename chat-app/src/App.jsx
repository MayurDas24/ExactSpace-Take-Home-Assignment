import { useEffect, useRef, useState } from "react";
import { createMessage, readMessages, STORAGE_KEY, USERS } from "./chat.js";
import Composer from "./Composer.jsx";
import Icon from "./Icon.jsx";
import Message from "./Message.jsx";

export default function App() {
  const [initial] = useState(() => {
    try {
      return readMessages(window.localStorage);
    } catch {
      return {
        messages: [],
        warning:
          "Browser storage is unavailable. Messages will last for this visit.",
      };
    }
  });
  const [messages, setMessages] = useState(initial.messages);
  const [warning, setWarning] = useState(initial.warning);
  const [draft, setDraft] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const inputRef = useRef(null);
  const threadRef = useRef(null);
  const scrollOnSend = useRef(false);
  const changed = useRef(false);

  useEffect(() => {
    if (!changed.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      setWarning(
        "Messages could not be saved in this browser. They are available for this visit.",
      );
    }
  }, [messages]);

  useEffect(() => {
    if (scrollOnSend.current && threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
      scrollOnSend.current = false;
    }
  }, [messages.length]);

  function send(text) {
    const message = createMessage(text);
    if (!message) return false;
    changed.current = true;
    scrollOnSend.current = true;
    setMessages((current) => [...current, message]);
    setAnnouncement(`Message sent as ${message.author}.`);
    return true;
  }
  function like(id) {
    changed.current = true;
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              likes: Math.min(Number.MAX_SAFE_INTEGER, message.likes + 1),
            }
          : message,
      ),
    );
  }
  function starter(text) {
    setDraft(text);
    inputRef.current?.focus();
  }

  return (
    <>
      <header className="site-header">
        <a href="/" className="brand" aria-label="Common home">
          <span className="brand-icon">
            <Icon name="chat" />
          </span>
          common<span className="brand-dot">.</span>
        </a>
        <span className="header-caption">A space to connect</span>
        <span className="local-badge">
          <span /> Local conversation
        </span>
      </header>
      <main className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">GOOD PEOPLE. GREAT CONVERSATIONS.</p>
            <h1>
              Better, together<span>.</span>
            </h1>
            <p>A thought, a question, a small win. There’s room for it here.</p>
          </div>
          <div className="member-stack" aria-label="Five teammates">
            {USERS.map((user, index) => (
              <span title={user} key={user} className={`avatar color-${index}`}>
                {user[0]}
              </span>
            ))}
            <span className="member-count">5 teammates</span>
          </div>
        </div>
        <section className="chat-panel" aria-label="Team conversation">
          <header className="channel-header">
            <span className="channel-symbol">#</span>
            <div>
              <h2>Introductions</h2>
              <p>The start of something good.</p>
            </div>
            <span className="message-total">
              {messages.length} {messages.length === 1 ? "message" : "messages"}
            </span>
          </header>
          <div
            className="thread"
            ref={threadRef}
            tabIndex={0}
            role="region"
            aria-label="Message thread"
          >
            <div className="date-divider">
              <span>THE CONVERSATION STARTS HERE</span>
            </div>
            {!messages.length ? (
              <div className="empty-state">
                <span className="welcome-icon">
                  <Icon name="chat" width="34" height="34" />
                </span>
                <p className="welcome-eyebrow">YOUR SHARED SPACE</p>
                <h3>Say something. Start something.</h3>
                <p>
                  Introduce yourself, share an idea, or simply say hello.
                  <br />
                  Every good conversation starts with one message.
                </p>
                <div className="starter-actions">
                  <button onClick={() => starter("Hey team! 👋")}>
                    👋 Say hello
                  </button>
                  <button onClick={() => starter("I have an idea… 💡")}>
                    💡 Share an idea
                  </button>
                </div>
              </div>
            ) : (
              <ol className="message-list">
                {messages.map((message) => (
                  <Message key={message.id} message={message} onLike={like} />
                ))}
              </ol>
            )}
          </div>
          {warning && (
            <p className="storage-warning" role="status">
              {warning}
            </p>
          )}
          <Composer
            onSend={send}
            draft={draft}
            setDraft={setDraft}
            inputRef={inputRef}
          />
        </section>
        <footer className="workspace-footer">
          <span>
            <span className="footer-dot" /> Made for the moments between the
            meetings.
          </span>
          <span>Names are randomly assigned · Saved on this browser</span>
        </footer>
      </main>
      <p className="sr-only" role="status">
        {announcement}
      </p>
    </>
  );
}
