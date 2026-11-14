import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPhotos } from "./api.js";

export default function usePhotoFeed() {
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const nextPage = useRef(1);
  const inFlight = useRef(null);
  const ended = useRef(false);

  const loadMore = useCallback(async () => {
    if (inFlight.current || ended.current) return;
    const controller = new AbortController();
    inFlight.current = controller;
    setStatus("loading");
    setError("");
    const timeout = setTimeout(() => controller.abort("timeout"), 15000);
    try {
      const batch = await fetchPhotos(nextPage.current, controller.signal);
      if (controller.signal.aborted) return;
      if (!batch.length) {
        ended.current = true;
        setStatus("end");
      } else {
        setPhotos((previous) => {
          const ids = new Set(previous.map((photo) => photo.id));
          return [
            ...previous,
            ...batch.filter((photo) => {
              if (ids.has(photo.id)) return false;
              ids.add(photo.id);
              return true;
            }),
          ];
        });
        nextPage.current += 1;
        setStatus("ready");
      }
    } catch (failure) {
      if (controller.signal.aborted && controller.signal.reason !== "timeout")
        return;
      setError(
        controller.signal.reason === "timeout"
          ? "The photo service is taking too long. Please try again."
          : failure instanceof TypeError
            ? "We couldn’t reach the photo service. Check your connection and try again."
            : failure.message ||
              "Photos could not be loaded. Please try again.",
      );
      setStatus("error");
    } finally {
      clearTimeout(timeout);
      if (inFlight.current === controller) inFlight.current = null;
    }
  }, []);

  useEffect(() => {
    loadMore();
    return () => {
      inFlight.current?.abort();
      inFlight.current = null;
    };
  }, [loadMore]);

  return { photos, status, error, loadMore };
}
