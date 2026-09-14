import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

/**
 * แจ้งเตือนทีมขายผ่าน Telegram Bot — ไม่ block งานหลักเมื่อส่งไม่สำเร็จ
 * ตั้งค่า TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID ใน .env เพื่อเปิดใช้งาน
 * (คุยกับ @BotFather เพื่อสร้างบอทและขอ token, ใช้ getUpdates หรือ @userinfobot
 *  เพื่อหา chat_id ของกลุ่ม/ผู้ใช้ที่จะรับข้อความ)
 */
export async function sendTelegramMessage(text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    logger.warn('ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN/TELEGRAM_CHAT_ID — ข้ามการแจ้งเตือน');
    return false;
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      logger.error({ status: res.status, body }, 'ส่งข้อความ Telegram ไม่สำเร็จ');
      return false;
    }
    return true;
  } catch (err) {
    logger.error({ err }, 'เชื่อมต่อ Telegram API ไม่สำเร็จ');
    return false;
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function newLeadMessage(lead: {
  refNo: string; name: string; phone: string; intent: string; source: string;
  propertySnapshot?: { title?: { th?: string }; code?: string; [key: string]: unknown } | null;
}) {
  const propertyLine = lead.propertySnapshot
    ? `\n🏠 ${escapeHtml(lead.propertySnapshot.title?.th ?? '')} (${escapeHtml(lead.propertySnapshot.code ?? '')})`
    : '';
  return (
    `🔔 <b>ลีดใหม่ ${escapeHtml(lead.refNo)}</b>\n` +
    `👤 ${escapeHtml(lead.name)}\n` +
    `📞 ${escapeHtml(lead.phone)}\n` +
    `🎯 ${escapeHtml(lead.intent)} · ${escapeHtml(lead.source)}` +
    propertyLine +
    `\n\n<a href="${env.ADMIN_BASE_URL}/leads">เปิดดูในหลังบ้าน</a>`
  );
}
