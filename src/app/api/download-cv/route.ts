import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: NextRequest) {
  try {
    const profile = await prisma.profile.findFirst({
      select: { cvUrl: true },
    });

    const cvUrl = profile?.cvUrl;

    // Case 1: Data URL (Base64 PDF or Doc)
    if (cvUrl && cvUrl.startsWith('data:')) {
      const parts = cvUrl.split(';base64,');
      const mimeType = parts[0].replace('data:', '') || 'application/pdf';
      const base64Data = parts[1];

      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            'Content-Type': mimeType,
            'Content-Disposition': 'attachment; filename="CV_Nadia_Deari_Hanifah.pdf"',
            'Content-Length': buffer.length.toString(),
          },
        });
      }
    }

    // Case 2: Server Disk File Path (/uploads/...)
    if (cvUrl && cvUrl.startsWith('/uploads/')) {
      try {
        const filePath = join(process.cwd(), 'public', cvUrl);
        const fileBuffer = await readFile(filePath);
        const filename = cvUrl.split('/').pop() || 'CV_Nadia_Deari_Hanifah.pdf';
        
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        });
      } catch (fsErr) {
        console.warn('Local disk file not found, trying fallback...', fsErr);
      }
    }

    // Case 3: External URL (http://... or https://...)
    if (cvUrl && (cvUrl.startsWith('http://') || cvUrl.startsWith('https://'))) {
      try {
        const fetchRes = await fetch(cvUrl);
        if (fetchRes.ok) {
          const arrayBuffer = await fetchRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          return new NextResponse(buffer, {
            status: 200,
            headers: {
              'Content-Type': fetchRes.headers.get('content-type') || 'application/pdf',
              'Content-Disposition': 'attachment; filename="CV_Nadia_Deari_Hanifah.pdf"',
              'Content-Length': buffer.length.toString(),
            },
          });
        }
      } catch (fetchErr) {
        console.warn('Remote CV fetch failed:', fetchErr);
      }
    }

    // Case 4: Fallback to public static cv.pdf if present
    try {
      const defaultCvPath = join(process.cwd(), 'public', 'cv.pdf');
      const fileBuffer = await readFile(defaultCvPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="CV_Nadia_Deari_Hanifah.pdf"',
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch {
      // No fallback PDF file found
    }

    return new NextResponse('File CV belum diunggah. Silakan unggah CV terlebih dahulu melalui halaman admin.', {
      status: 404,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error: any) {
    console.error('Download CV API Error:', error);
    return new NextResponse('Gagal mengunduh file CV.', { status: 500 });
  }
}
