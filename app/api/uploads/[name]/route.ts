import { photoStorageKind, readLocalPhoto } from "@/lib/photos";

// Serves listing photos stored on disk during local development.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const bytes =
    photoStorageKind() === "file" ? await readLocalPhoto(name) : null;
  if (!bytes) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(bytes), {
    headers: {
      "Content-Type": name.endsWith(".webp") ? "image/webp" : "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
