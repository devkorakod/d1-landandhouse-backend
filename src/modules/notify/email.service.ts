import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

/**
 * แจ้งเตือนทีมขายผ่านอีเมล — ไม่ block งานหลักเมื่อส่งไม่สำเร็จ
 * ตั้งค่า SMTP_HOST/SMTP_USER/SMTP_PASS ใน .env เพื่อเปิดใช้งาน
 */
export async function sendNotifyEmail(to: string, subject: string, html: string): Promise<boolean> {
  const t = getTransporter();
  if (!t || !to) {
    logger.warn('ยังไม่ได้ตั้งค่า SMTP หรือไม่มีอีเมลปลายทาง — ข้ามการแจ้งเตือนอีเมล');
    return false;
  }

  try {
    await t.sendMail({ from: env.SMTP_FROM, to, subject, html });
    return true;
  } catch (err) {
    logger.error({ err }, 'ส่งอีเมลแจ้งเตือนไม่สำเร็จ');
    return false;
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function newLeadEmail(lead: {
  refNo: string; name: string; phone: string; intent: string; source: string;
  propertySnapshot?: { title?: { th?: string }; code?: string; [key: string]: unknown } | null;
}) {
  const propertyLine = lead.propertySnapshot
    ? `<p>🏠 ${escapeHtml(lead.propertySnapshot.title?.th ?? '')} (${escapeHtml(lead.propertySnapshot.code ?? '')})</p>`
    : '';
  return {
    subject: `🔔 ลีดใหม่ ${lead.refNo}`,
    html:
      `<h2>ลีดใหม่ ${escapeHtml(lead.refNo)}</h2>` +
      `<p>👤 ${escapeHtml(lead.name)}</p>` +
      `<p>📞 ${escapeHtml(lead.phone)}</p>` +
      `<p>🎯 ${escapeHtml(lead.intent)} · ${escapeHtml(lead.source)}</p>` +
      propertyLine +
      `<p><a href="${env.ADMIN_BASE_URL}/leads">เปิดดูในหลังบ้าน</a></p>`,
  };
}
