import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/jwt";

// Paths that don't require authentication
const publicPaths = ["/api/auth/login", "/api/setup", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // APIs protection
  if (pathname.startsWith("/api/")) {
    let token = "";
    const authHeader = request.headers.get("authorization");
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else {
      const tokenCookie = request.cookies.get("token")?.value;
      if (tokenCookie) {
        token = tokenCookie;
      }
    }

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Role-based protection for APIs
    const role = decoded.role;

    if (pathname.startsWith("/api/superadmin") && role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }
    
    if (pathname.startsWith("/api/admins") && role !== "superadmin") {
      return NextResponse.json({ error: "Forbidden: Super Admin only" }, { status: 403 });
    }

    if (pathname.startsWith("/api/users") && (role !== "admin" && role !== "superadmin")) {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    // Adding user info to headers for the next steps
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user", JSON.stringify(decoded));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Next.js frontend route protection can be added here
  // Instead of protecting pure API, protect frontend pages
  const tokenCookie = request.cookies.get("token")?.value;
  if (!tokenCookie) {
    if (pathname !== "/") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next(); // Home page is accessible or redirects
  }

  const decoded = await verifyToken(tokenCookie);
  if (!decoded) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Dashboard role protection
  const role = decoded.role;
  if (pathname.startsWith("/dashboard/superadmin") && role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if (pathname.startsWith("/dashboard/user") && role !== "user") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/dashboard/:path*"],
};
