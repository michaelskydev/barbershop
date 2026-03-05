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
        const { status, startDate, barberId } = body;

        const updateData: any = {};
        if (status !== undefined) updateData.status = status;
        if (startDate !== undefined) updateData.startDate = startDate;
        if (barberId !== undefined) updateData.barberId = parseInt(barberId);

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData
        });

        return NextResponse.json(appointment);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params;
        const id = parseInt(idStr);
        await prisma.appointment.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }
}
