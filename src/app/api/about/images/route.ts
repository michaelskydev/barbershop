import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const images = await prisma.aboutImage.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(images);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url, title, subtitle, order } = body;

        const image = await prisma.aboutImage.create({
            data: { url, title, subtitle, order: order || 0 }
        });

        return NextResponse.json(image);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
