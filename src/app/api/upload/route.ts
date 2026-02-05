import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadsDir = join(process.cwd(), 'public', 'uploads');

        // Ensure uploads directory exists
        try {
            await mkdir(uploadsDir, { recursive: true });
        } catch (err) {
            // Ignore if directory already exists
        }

        const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const path = join(uploadsDir, filename);

        await writeFile(path, buffer);
        console.log(`Uploaded file to ${path}`);

        return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
