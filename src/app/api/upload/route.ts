import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { verifyJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  // Verify Admin Session
  const sessionCookie = request.cookies.get('nadia_session')?.value;
  const verifiedToken = sessionCookie ? await verifyJWT(sessionCookie) : null;
  if (!verifiedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a safe, unique filename
    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}_${sanitizedOriginalName}`;
    
    // Target directory inside Next.js public folder
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Ensure directory exists
    await mkdir(uploadDir, { recursive: true });
    
    // Write file to disk
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // File URL accessible from public web
    const fileUrl = `/uploads/${filename}`;
    
    return NextResponse.json({ 
      url: fileUrl, 
      filename: file.name,
      size: file.size
    });
  } catch (error: any) {
    console.error('Image upload endpoint error:', error);
    return NextResponse.json({ error: error.message || 'File upload failed' }, { status: 500 });
  }
}
