import { useState } from "react";
import { imageUrl } from "./api.js";

export default function PhotoImage({ photo, large = false, eager = false }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  if (failed)
    return (
      <span className="image-fallback">
        <span aria-hidden="true">▧</span>
        <span>Image unavailable</span>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            setAttempt((value) => value + 1);
            setFailed(false);
          }}
        >
          Retry image
        </button>
      </span>
    );
  return (
    <img
      key={attempt}
      src={imageUrl(photo, large ? 1600 : 800)}
      alt={`Photograph by ${photo.author}`}
      width={photo.width}
      height={photo.height}
      loading={eager || large ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
