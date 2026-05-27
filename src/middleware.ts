import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Retrieve token from cookies
    const sessionCookie = request.cookies.get('admin_session')?.value;
    
    // Verify the token cryptographically
    const admin = sessionCookie ? await verifyToken(sessionCookie) : null;

    // 1. Pages Routing
    if (pathname.startsWith('/admin')) {
        // If visiting the login page
        if (pathname === '/admin/login') {
            if (admin) {
                // If already logged in, redirect to dashboard
                return NextResponse.redirect(new URL('/admin', request.url));
            }
            return NextResponse.next();
        }

        // If visiting any other admin page and not logged in, redirect to login
        if (!admin) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
        
        return NextResponse.next();
    }

    // 2. API Routes Protection
    if (pathname.startsWith('/api')) {
        // Allow public authentication endpoints
        if (pathname === '/api/auth/login' || pathname === '/api/auth/logout') {
            return NextResponse.next();
        }

        let requiresAuth = false;

        // Appointments API: 
        // - GET (lists all appointments) -> Admin only
        // - PATCH/DELETE (update status, reschedule, delete) -> Admin only
        // - POST (public customer booking) -> Public
        if (pathname.startsWith('/api/appointments')) {
            if (method === 'GET' || method === 'PATCH' || method === 'DELETE') {
                requiresAuth = true;
            }
        }

        // Barbers API:
        // - GET (view barbers for booking) -> Public
        // - POST/PUT/PATCH/DELETE (manage barbers/schedules) -> Admin only
        else if (pathname.startsWith('/api/barbers')) {
            if (method !== 'GET') {
                requiresAuth = true;
            }
        }

        // Services API:
        // - GET (view services for booking) -> Public
        // - POST/PUT/PATCH/DELETE (manage services offered) -> Admin only
        else if (pathname.startsWith('/api/services')) {
            if (method !== 'GET') {
                requiresAuth = true;
            }
        }

        // About Info / Carousel Images API:
        // - GET (view shop details/carousel on front page) -> Public
        // - POST/PUT/PATCH/DELETE (edit story, manage/upload images) -> Admin only
        else if (pathname.startsWith('/api/about')) {
            if (method !== 'GET') {
                requiresAuth = true;
            }
        }

        // Image upload endpoint: POST (upload new images to server) -> Admin only
        else if (pathname.startsWith('/api/upload')) {
            requiresAuth = true;
        }

        // Block unauthorized requests to admin-only API endpoints
        if (requiresAuth && !admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

// Optimization: Apply middleware only to admin-related pages and APIs
export const config = {
    matcher: [
        '/admin/:path*',
        '/api/appointments/:path*',
        '/api/barbers/:path*',
        '/api/services/:path*',
        '/api/about/:path*',
        '/api/upload/:path*',
    ],
};
