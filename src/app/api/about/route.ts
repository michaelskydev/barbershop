import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const aboutInfo = await prisma.aboutInfo.findUnique({
            where: { id: 1 }
        });
        return NextResponse.json(aboutInfo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { story, address, hours, mapsUrl } = body;

        const aboutInfo = await prisma.aboutInfo.upsert({
            where: { id: 1 },
            update: { story, address, hours, mapsUrl },
            create: { id: 1, story, address, hours, mapsUrl }
        });

        return NextResponse.json(aboutInfo);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
