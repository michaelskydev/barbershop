import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { hashPassword } from '@/lib/hash';

export async function POST(request: Request) {
    try {
        // Authenticate admin session
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get('admin_session')?.value;
        const payload = sessionToken ? await verifyToken(sessionToken) : null;
        
        if (!payload || !payload.username) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { newPassword } = body;

        if (!newPassword || newPassword.trim().length < 4) {
            return NextResponse.json({ error: 'Password must be at least 4 characters long' }, { status: 400 });
        }

        // Hash the new password
        const hashedPassword = hashPassword(newPassword);

        // Update the password in database
        await prisma.admin.update({
            where: { username: payload.username },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
