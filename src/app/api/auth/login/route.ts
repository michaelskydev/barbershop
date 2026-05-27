import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { signToken } from '@/lib/auth';
import { verifyPassword } from '@/lib/hash';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const admin = await prisma.admin.findUnique({
            where: { username }
        });

        // Cryptographically verify the password (supporting both hashed and legacy plain text)
        if (admin && verifyPassword(password, admin.password)) {
            // Generate a secure, cryptographically signed token
            const token = await signToken({ username });

            // Set the secure session cookie
            const cookieStore = await cookies();
            cookieStore.set('admin_session', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                sameSite: 'strict'
            });

            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
