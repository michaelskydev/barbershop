import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
    try {
        const cookieStore = await cookies();
        
        // Delete the secure admin session cookie
        cookieStore.delete('admin_session');
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({ error: 'Failed to log out cleanly' }, { status: 500 });
    }
}
