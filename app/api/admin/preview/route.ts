import { draftMode } from "next/headers";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// Opens a public page in preview mode, showing unpublished texts and draft
// listings. Only signed-in admins can turn preview on.
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!(await isAdmin()))
    return NextResponse.redirect(new URL("/admin/login", url), 303);
  const path = url.searchParams.get("path") || "/";
  (await draftMode()).enable();
  return NextResponse.redirect(
    new URL(/^\/(?![/\\])[^\s\\]*$/.test(path) ? path : "/", url),
    303,
  );
}
