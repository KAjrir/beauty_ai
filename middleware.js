import { NextResponse } from 'next/server'
import { auth } from "@/auth"

export const config = {
  runtime: 'nodejs', // defaults to 'edge'
};

// export { auth as middleware } from "@/auth"

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith("/chat")) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  // return NextResponse.json({req, nexturl: req.nextUrl})
  return NextResponse.next();
})