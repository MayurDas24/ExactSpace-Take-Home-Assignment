import { useEffect, useRef, useState } from "react";
import PhotoCard from "./PhotoCard.jsx";
import PhotoDialog from "./PhotoDialog.jsx";
import usePhotoFeed from "./usePhotoFeed.js";

export default function App() {
  const { photos, status, error, loadMore } = usePhotoFeed();
  const [likes, setLikes] = useState({});
  const [preview, setPreview] = useState(null);
  const sentinel = useRef(null);

  useEffect(() => {
    if (status !== "ready" || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMore();
      },
      { rootMargin: "300px" },
    );
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loadMore, status, photos.length]);

  function like(id) {
    setLikes((current) => ({ ...current, [id]: (current[id] || 0) + 1 }));
  }

  return (
    <>
      <a className="skip-link" href="#photographs">
        Skip to photographs
      </a>
      <header className="site-header">
        <a href="/" className="brand" aria-label="Luma home">
          <span className="brand-symbol" aria-hidden="true">
            ✳
          </span>{" "}
          luma<span className="brand-period">.</span>
        </a>
        <span className="header-note">A PHOTO JOURNAL</span>
        <a className="explore-link" href="#photographs">
          Explore the collection <span aria-hidden="true">↘</span>
        </a>
      </header>
      <main>
        <section className="intro" aria-labelledby="gallery-title">
          <div className="intro-copy">
            <p className="eyebrow">
              <span /> THE WORLD, THROUGH DIFFERENT EYES
            </p>
            <h1 id="gallery-title">
              A little <em>perspective.</em>
            </h1>
            <p className="intro-description">
              Ordinary moments. Extraordinary ways of seeing.
              <br />A never-ending collection of photographs and the people
              behind them.
            </p>
          </div>
          <div className="intro-aside">
            <span className="orbit" aria-hidden="true">
              ◎
            </span>
            <p>
              Pause.
              <br />
              Look a little closer.
            </p>
            <span className="aside-line" />
          </div>
        </section>
        <section
          className="collection"
          id="photographs"
          aria-label="Photo gallery"
        >
          <div className="collection-heading">
            <div>
              <span className="section-index">01 /</span>
              <h2>The collection</h2>
              <span className="collection-tag">ONE FRAME AT A TIME</span>
            </div>
            <span className="photo-count">
              {photos.length}{" "}
              {photos.length === 1 ? "photograph" : "photographs"} discovered
            </span>
          </div>
          <div className="photo-list">
            {photos.map((photo, index) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={index}
                likes={likes[photo.id] || 0}
                onLike={like}
                onOpen={setPreview}
              />
            ))}
          </div>
          {status === "loading" && !photos.length && (
            <div className="skeleton-list" aria-hidden="true">
              {[0, 1, 2].map((id) => (
                <div key={id} className="skeleton-row">
                  <span />
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              ))}
            </div>
          )}
          <div ref={sentinel} className="feed-status">
            {status === "loading" && (
              <p role="status">
                <span className="spinner" /> Finding a new perspective…
              </p>
            )}
            {status === "ready" && (
              <>
                <button className="load-more" onClick={loadMore}>
                  Discover more <span aria-hidden="true">↓</span>
                </button>
                <p>Keep scrolling. There’s more to see.</p>
              </>
            )}
            {status === "error" && (
              <div role="alert" className="error-state">
                <h3>A brief pause in the journey.</h3>
                <p>{error}</p>
                <button className="load-more" onClick={loadMore}>
                  Try again <span aria-hidden="true">↻</span>
                </button>
              </div>
            )}
            {status === "end" && (
              <div role="status" className="end-state">
                <span aria-hidden="true">✳</span>
                <h3>
                  {photos.length
                    ? "You’ve seen the whole collection."
                    : "A quiet moment."}
                </h3>
                <p>
                  {photos.length
                    ? "Every frame, a different point of view. Thanks for looking closer."
                    : "There are no photographs to show right now."}
                </p>
                {!!photos.length && (
                  <a href="#gallery-title">Back to the beginning ↑</a>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <span>
          luma. <span>A little wonder, every day.</span>
        </span>
        <a
          href="https://picsum.photos"
          target="_blank"
          rel="noopener noreferrer"
        >
          Photography via Lorem Picsum ↗
        </a>
      </footer>
      {preview && (
        <PhotoDialog photo={preview} onClose={() => setPreview(null)} />
      )}
      <p className="sr-only" role="status">
        {photos.length ? `${photos.length} photographs loaded.` : ""}
      </p>
    </>
  );
}
