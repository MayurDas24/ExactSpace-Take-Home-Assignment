import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import PhotoImage from "./PhotoImage.jsx";

export default function PhotoCard({ photo, index, likes, onLike, onOpen }) {
  return (
    <article
      className="photo-card"
      aria-label={`Photo ${index + 1} by ${photo.author}`}
    >
      <div className="photo-frame">
        <PhotoImage photo={photo} eager={index < 2} />
        <button
          className="expand-photo"
          onClick={() => onOpen(photo)}
          aria-label={`Enlarge photograph by ${photo.author}`}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
          </svg>
        </button>
        <span className="photo-number" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="photo-details">
        <p className="photo-label">BEHIND THE LENS</p>
        <h2>{photo.author}</h2>
        <p className="photo-credit">Photography by {photo.author}</p>
        <div className="photo-actions">
          <button
            className={`like-button ${likes ? "liked" : ""}`}
            aria-label={`Like photo by ${photo.author}. ${likes} likes`}
            onClick={() => onLike(photo.id)}
          >
            <FontAwesomeIcon icon={faThumbsUp} />
            <span>{likes}</span>
          </button>
          <span className="appreciation">
            {likes
              ? "A little appreciation goes a long way."
              : "A moment worth appreciating."}
          </span>
        </div>
      </div>
    </article>
  );
}
