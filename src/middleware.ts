import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const role = token.role as string;
    const status = token.status as string;

    // Admin routes
    if (path.startsWith("/admin")) {
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // User routes
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/matches") ||
      path.startsWith("/ranking") ||
      path.startsWith("/results") ||
      path.startsWith("/history") ||
      path.startsWith("/stats") ||
      path.startsWith("/prizes") ||
      path.startsWith("/profile") ||
      path.startsWith("/special")
    ) {
      if (status === "PENDING") {
        return NextResponse.redirect(new URL("/pending", req.url));
      }
      if (status === "REJECTED") {
        return NextResponse.redirect(new URL("/rejected", req.url));
      }
      return NextResponse.next();
    }

    // Pending/rejected pages
    if (path === "/pending") {
      if (status === "APPROVED") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      if (status === "REJECTED") {
        return NextResponse.redirect(new URL("/rejected", req.url));
      }
    }

    if (path === "/rejected") {
      if (status === "APPROVED") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
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
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/ranking/:path*",
    "/results/:path*",
    "/history/:path*",
    "/stats/:path*",
    "/prizes/:path*",
    "/profile/:path*",
    "/special/:path*",
    "/pending",
    "/rejected",
    "/admin/:path*",
  ],
};
