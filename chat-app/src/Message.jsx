import { USERS } from "./chat.js";
import Icon from "./Icon.jsx";

function MessageText({ text }) {
  return text
    .split(/(@(?:Alan|Bob|Carol|Dean|Elin)\b)/g)
    .map((part, index) =>
      /^@(Alan|Bob|Carol|Dean|Elin)$/.test(part) ? (
        <mark key={index}>{part}</mark>
      ) : (
        part
      ),
    );
}

export default function Message({ message, onLike }) {
  return (
    <li className="message" data-testid="message">
      <span
        className={`avatar color-${USERS.indexOf(message.author)}`}
        aria-hidden="true"
      >
        {message.author[0]}
      </span>
      <div className="message-body">
        <div className="message-meta">
          <strong>{message.author}</strong>
          <time
            dateTime={message.createdAt}
            title={new Date(message.createdAt).toLocaleString()}
          >
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </div>
        <div className="message-content">
          <p>
            <MessageText text={message.text} />
          </p>
          <button
            className={`like-button ${message.likes ? "has-likes" : ""}`}
            onClick={() => onLike(message.id)}
            aria-label={`Like message by ${message.author}. ${message.likes} likes`}
          >
            <Icon name="like" />
            <span>{message.likes}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
