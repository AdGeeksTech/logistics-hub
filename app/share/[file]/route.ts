import sharp from "sharp";
import { readLocalPhoto } from "@/lib/photos";
import { getPublishedSharePhoto, shareFileName } from "@/lib/site-photos";

// The link-preview image chosen in the admin, cropped to 1200 × 630 the
// same way the admin preview shows it, as a JPEG every app can read. Only
// the current photo's file name answers, and copies are cached for an
// hour, so a replaced or removed photo stops being served soon after.
// Outside /api/ so robots.txt does not hide it from preview crawlers.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const photo = await getPublishedSharePhoto();
  if (!photo || file !== shareFileName(photo))
    return new Response("Not found", { status: 404 });
  try {
    const local = /^\/api\/uploads\/(.+)$/.exec(photo.url);
    const source = local
      ? await readLocalPhoto(local[1])
      : Buffer.from(await (await fetch(photo.url)).arrayBuffer());
    if (!source?.length) throw new Error("Photo missing");
    const image = sharp(source);
    const { width = 0, height = 0 } = await image.metadata();
    // The largest 1200:630 area, placed like CSS object-position.
    const cropWidth = Math.min(width, Math.round((height * 1200) / 630));
    const cropHeight = Math.min(height, Math.round((width * 630) / 1200));
    const jpeg = await image
      .extract({
        left: Math.round(((width - cropWidth) * photo.focusX) / 100),
        top: Math.round(((height - cropHeight) * photo.focusY) / 100),
        width: cropWidth,
        height: cropHeight,
      })
      .resize(1200, 630)
      .jpeg({ quality: 84, mozjpeg: true })
      .toBuffer();
    return new Response(new Uint8Array(jpeg), {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Could not make the link preview image", error);
    return new Response("Not available", { status: 502 });
  }
}
