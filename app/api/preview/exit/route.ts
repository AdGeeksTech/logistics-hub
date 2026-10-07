import { draftMode } from "next/headers";
import { NextResponse } from "next/server";

// Leaves preview mode and returns to the page the visitor was on.
export async function POST(request: Request) {
  (await draftMode()).disable();
  const url = new URL(request.url);
  const referer = request.headers.get("referer");
  const back =
    referer && new URL(referer).origin === url.origin ? referer : "/";
  return NextResponse.redirect(new URL(back, url), 303);
}
