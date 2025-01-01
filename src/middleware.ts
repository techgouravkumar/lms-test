import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/sign-up"];

// Middleware to check if the user is authenticated and redirect them to the login page if not
export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow access to all API routes
	if (pathname.startsWith("/api")) {
		return NextResponse.next(); // Allow access to all API routes
	}

	const token = request.cookies.get("token")?.value;
	// Redirect to login if no token is found and the user is not on the login page
	if (!token && !PUBLIC_ROUTES.includes(pathname)) {
		return NextResponse.redirect(new URL("/login", request.url));
	}

	// Redirect authenticated users from the root path to the dashboard
	if (pathname === "/" && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
	}

	// Allow the request to continue if none of the above conditions are met
	return NextResponse.next();
}

// Configuration for the middleware to match specific paths
export const config = {
	matcher: [
		// Skip Next.js internals and all static files, unless found in search params
		"/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
		// Always run for API routes
		"/(api|trpc)(.*)",
	],
};
