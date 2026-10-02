// Receives the booking form and forwards it to Telegram.
// Requires env vars TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (set in Netlify site settings).

const escapeHtml = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  let data;
  try {
    data = await req.json();
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // Honeypot: bots fill hidden fields; pretend success so they don't retry
  if (data.website) return new Response('OK');

  const name = clip(data.name, 100);
  const phone = clip(data.phone, 25);
  const idea = clip(data.idea, 1000);
  const services = Array.isArray(data.services) ? data.services.map((s) => clip(s, 20)).slice(0, 3) : [];

  if (!name || phone.replace(/\D/g, '').length < 10) {
    return new Response('Invalid', { status: 422 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return new Response('Not configured', { status: 500 });

  const text = [
    '<b>✦ Новая заявка с сайта</b>',
    `<b>Имя:</b> ${escapeHtml(name)}`,
    `<b>Телефон:</b> ${escapeHtml(phone)}`,
    `<b>Хочет:</b> ${escapeHtml(services.join(', ') || '—')}`,
    idea ? `<b>Идея:</b> ${escapeHtml(idea)}` : null,
  ].filter(Boolean).join('\n');

  const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
  });

  return tg.ok ? new Response('OK') : new Response('Telegram error', { status: 502 });
};

export const config = { path: '/api/lead' };
