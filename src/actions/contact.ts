'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentAdmin } from './auth';

/**
 * Submit a contact form message from visitors.
 * Saves to DB and sends automated email via Resend / Webhook if configured.
 */
export async function sendContactMessage(data: {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}) {
  try {
    if (!data.name || !data.email || !data.message) {
      return { success: false, error: 'Silakan isi Nama, Email, dan Pesan.' };
    }

    const targetEmail = 'nadyadearihanifah@gmail.com';

    // 1. Save message into PostgreSQL database
    const saved = await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject?.trim() || null,
        message: data.message.trim(),
      },
    });

    // 2. Automated email dispatch via Resend API (if RESEND_API_KEY is configured in .env)
    if (process.env.RESEND_API_KEY) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Portfolio Contact <onboarding@resend.dev>',
            to: [targetEmail],
            reply_to: data.email.trim(),
            subject: data.subject?.trim() || `Pesan Baru Portofolio dari ${data.name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff;">
                <h2 style="color: #7c3aed; margin-top: 0;">📩 Pesan Baru dari Web Portofolio</h2>
                <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Nama Pengirim:</strong> ${data.name}</p>
                  <p style="margin: 5px 0;"><strong>Email Pengirim:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                  <p style="margin: 5px 0;"><strong>Subjek:</strong> ${data.subject || '-'}</p>
                  <p style="margin: 5px 0;"><strong>Waktu:</strong> ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })} WIB</p>
                </div>
                <h3 style="color: #374151;">Isi Pesan:</h3>
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #1f2937;">
                  ${data.message}
                </div>
                <div style="margin-top: 25px; pt: 15px; border-top: 1px solid #eee; text-align: center; color: #6b7280; font-size: 12px;">
                  Pesan ini dikirim otomatis melalui sistem CMS Portofolio Nadia Deari Hanifah.
                </div>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.warn('Resend email dispatch error:', emailErr);
      }
    }

    return { success: true, data: JSON.parse(JSON.stringify(saved)) };
  } catch (error: any) {
    console.error('Error saving contact message:', error);
    return { success: false, error: 'Gagal menyimpan pesan. Silakan coba lagi.' };
  }
}

/**
 * Fetch all contact messages (for Admin Panel)
 */
export async function getContactMessages() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: JSON.parse(JSON.stringify(messages)) };
  } catch (error: any) {
    console.error('Error fetching contact messages:', error);
    return { success: false, error: error.message || 'Failed to fetch messages.' };
  }
}

/**
 * Mark a contact message as read
 */
export async function markContactMessageAsRead(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Delete a contact message
 */
export async function deleteContactMessage(id: string) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return { success: false, error: 'Unauthorized.' };
  }

  try {
    await prisma.contactMessage.delete({
      where: { id },
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
