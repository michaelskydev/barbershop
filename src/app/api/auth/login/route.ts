import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    const body = await request.json()
    const { username, password } = body

    const admin = await prisma.admin.findUnique({
        where: { username }
    })

    // In real app, compare hashed password
    if (admin && admin.password === password) {
        // Set a simple cookie
        (await cookies()).set('admin_session', 'true', { httpOnly: true })
        return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
}
