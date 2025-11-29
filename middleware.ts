import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = (req.nextauth.token as any)?.role;
    const url = req.nextUrl.pathname;
    if (url.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (url.startsWith("/dashboard") && !role) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
