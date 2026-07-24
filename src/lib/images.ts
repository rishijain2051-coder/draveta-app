/**
 * Normalize a pasted image link into a direct, hot-linkable URL.
 *
 * Google Drive "share" links point at a viewer page, not the image itself, so
 * they can't be used as an <img src>. We convert them to Drive's direct
 * thumbnail endpoint. The Drive file must be shared as "Anyone with the link".
 *
 * Any non-Drive URL (Unsplash, jsDelivr, a CDN, etc.) is returned unchanged.
 */
export function toDirectImageUrl(input: string | null | undefined): string {
  const url = (input ?? "").trim();
  if (!url || !url.includes("drive.google.com")) return url;

  // Pull the file id out of the common Drive URL shapes:
  //   https://drive.google.com/file/d/<ID>/view?usp=sharing
  //   https://drive.google.com/open?id=<ID>
  //   https://drive.google.com/uc?export=view&id=<ID>
  //   https://drive.google.com/thumbnail?id=<ID>
  const match =
    url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (match?.[1]) {
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w2000`;
  }
  return url;
}
