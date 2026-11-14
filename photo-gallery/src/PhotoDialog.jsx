import { useEffect, useRef } from "react";
import PhotoImage from "./PhotoImage.jsx";

export default function PhotoDialog({ photo, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      previousFocus?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className="photo-dialog"
      aria-labelledby="preview-title"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-content">
        <header>
          <div>
            <p>IN FOCUS</p>
            <h2 id="preview-title">Photography by {photo.author}</h2>
          </div>
          <button onClick={onClose} aria-label="Close photo preview">
            ×
          </button>
        </header>
        <div className="large-image">
          <PhotoImage photo={photo} large />
        </div>
        <footer>
          <span>
            {photo.width.toLocaleString()} × {photo.height.toLocaleString()}{" "}
            original resolution
          </span>
          <a
            href={photo.download_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open original <span aria-hidden="true">↗</span>
          </a>
        </footer>
      </div>
    </dialog>
  );
}
