import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  const isAuthenticated = !!token;

  // List of paths that require authentication
  const authRequiredPaths = ["/dashboard", "/settings", "/invoices", "/suppliers"];
  
  // Check if the current path requires authentication
  const isAuthRequired = authRequiredPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  // Redirect unauthenticated users from protected routes to the login page
  if (isAuthRequired && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
}; 