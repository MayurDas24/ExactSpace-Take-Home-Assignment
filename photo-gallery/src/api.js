export const API_URL = "https://picsum.photos/v2/list";

function isPhoto(photo) {
  if (
    !photo ||
    typeof photo.id !== "string" ||
    !photo.id ||
    typeof photo.author !== "string" ||
    !photo.author.trim() ||
    !Number.isFinite(photo.width) ||
    photo.width <= 0 ||
    !Number.isFinite(photo.height) ||
    photo.height <= 0 ||
    typeof photo.download_url !== "string"
  )
    return false;
  try {
    const url = new URL(photo.download_url);
    return (
      url.protocol === "https:" &&
      url.hostname === "picsum.photos" &&
      /^\/id\/[^/]+\/\d+\/\d+\/?$/.test(url.pathname)
    );
  } catch {
    return false;
  }
}

export async function fetchPhotos(page, signal) {
  const response = await fetch(`${API_URL}?page=${page}`, { signal });
  if (!response.ok)
    throw new Error(
      `The photo service returned ${response.status}. Please try again.`,
    );
  const data = await response.json();
  if (!Array.isArray(data) || !data.every(isPhoto))
    throw new Error(
      "The photo service returned unexpected data. Please try again.",
    );
  return data;
}

// Resize the supplied download_url through Picsum, retaining the original aspect ratio.
export function imageUrl(photo, width = 800) {
  const targetWidth = Math.min(width, photo.width);
  const targetHeight = Math.max(
    1,
    Math.round((targetWidth * photo.height) / photo.width),
  );
  const url = new URL(photo.download_url);
  url.pathname = url.pathname.replace(
    /\/\d+\/\d+\/?$/,
    `/${targetWidth}/${targetHeight}`,
  );
  return url.href;
}
