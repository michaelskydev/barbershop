import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        const body = await request.json();
        const { name, color, imageUrl } = body;

        const updateData: { name?: string; color?: string; imageUrl?: string | null } = {};
        if (name !== undefined) updateData.name = name;
        if (color !== undefined) updateData.color = color;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

        const barber = await prisma.barber.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(barber);
    } catch (error) {
        console.error('Failed to update barber:', error);
        return NextResponse.json({ error: 'Failed to update barber' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr)

        await prisma.barber.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete barber' }, { status: 500 })
    }
}
