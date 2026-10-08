import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  photoStorageKind,
  photoTypes,
  savePhoto,
  type PhotoType,
} from "@/lib/photos";

// Receives one photo at a time, already resized in the browser, so each
// request stays well under the hosting platform's 4.5 MB body limit.
const maxBytes = 4 * 1024 * 1024;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!(await isAdmin()))
    return NextResponse.json(
      { error: "Sign in again to upload photos." },
      { status: 401 },
    );
  if (!photoStorageKind())
    return NextResponse.json(
      { error: "Photo storage is not connected yet." },
      { status: 503 },
    );
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Upload failed. Try again." },
      { status: 400 },
    );
  }
  const file = form.get("file");
  const folder = form.get("folder") === "site" ? "site" : "cars";
  const width = Number(form.get("width"));
  const height = Number(form.get("height"));
  if (
    !(file instanceof File) ||
    !(file.type in photoTypes) ||
    file.size > maxBytes ||
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1
  )
    return NextResponse.json(
      { error: "Use a JPG, PNG or WebP photo." },
      { status: 400 },
    );
  const bytes = Buffer.from(await file.arrayBuffer());
  const isWebp =
    bytes.toString("latin1", 0, 4) === "RIFF" &&
    bytes.toString("latin1", 8, 12) === "WEBP";
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.type === "image/webp" ? !isWebp : !isJpeg)
    return NextResponse.json(
      { error: "Use a JPG, PNG or WebP photo." },
      { status: 400 },
    );
  try {
    const url = await savePhoto(bytes, file.type as PhotoType, folder);
    return NextResponse.json({ url, width, height });
  } catch (error) {
    console.error("Photo upload failed", error);
    return NextResponse.json(
      { error: "Upload failed. Try again." },
      { status: 502 },
    );
  }
}
