import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Ubah format nomor ke "62xxxxxxxxxx" 
function toE16462(phone) {
  if (!phone) return null;
  let s = String(phone).trim();
  if (s.startsWith('whatsapp:+')) s = s.slice('whatsapp:+'.length);
  s = s.replace(/[^\d+]/g, '');
  if (s.startsWith('+62')) s = '62' + s.slice(3);
  else if (s.startsWith('0')) s = '62' + s.slice(1);
  else if (!s.startsWith('62')) s = '62' + s;
  return s;
}

// Format Twilio WA: "whatsapp:+62xxxx"
function toWa(phone) {
  const e164 = toE16462(phone);
  return e164 ? `whatsapp:+${e164}` : null;
}

function buildFromParams(base = {}) {
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    return { messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, ...base };
  }
  if (process.env.TWILIO_WHATSAPP_FROM) {
    return { from: process.env.TWILIO_WHATSAPP_FROM, ...base };
  }
  throw new Error('TWILIO_MESSAGING_SERVICE_SID atau TWILIO_WHATSAPP_FROM belum diset');
}

function logTwilioError(err) {
  console.error('❌ Twilio WA error:', {
    status: err?.status,
    code: err?.code,
    message: err?.message,
    moreInfo: err?.moreInfo,
  });
}

// === low level ===
export async function sendTemplateMessage(to, contentSid, variables = {}, extra = {}) {
  const toNumber = to?.startsWith('whatsapp:') ? to : toWa(to);
  if (!toNumber) throw new Error('phone is required');
  if (!contentSid) throw new Error('contentSid is required');

  const payload = buildFromParams({
    to: toNumber,
    contentSid,
    contentVariables: JSON.stringify(variables),
    ...extra,
  });

  try {
    const res = await client.messages.create(payload);
    console.log('✅ Twilio template sent:', { to: toNumber, sid: res.sid });
    return res;
  } catch (err) {
    logTwilioError(err);
    throw err;
  }
}

export async function sendTextMessage(to, body, extra = {}) {
  const toNumber = to?.startsWith('whatsapp:') ? to : toWa(to);
  if (!toNumber) throw new Error('phone is required');
  if (!body) throw new Error('Text body is required');

  const payload = buildFromParams({ to: toNumber, body, ...extra });

  try {
    const res = await client.messages.create(payload);
    console.log('✅ Twilio text sent:', { to: toNumber, sid: res.sid });
    return res;
  } catch (err) {
    logTwilioError(err);
    throw err;
  }
}

// === high level (yang dipakai login) ===
export async function sendMFACode({ phone, code, expiresIn = 5, appName }) {
  const name = appName || process.env.STORE_NAME || 'PrisJ App';
  const contentSid = process.env.TWILIO_CONTENT_SID_MFA; // optional

  if (contentSid) {
    // sesuaikan key variabel dengan template-mu
    return sendTemplateMessage(phone, contentSid, {
      app_name: name,
      code: String(code),
      expires_minutes: String(expiresIn),
    });
  }

  // fallback text
  const body =
    `Kode OTP ${name}: *${code}*\n` +
    `Berlaku ${expiresIn} menit. Jangan bagikan ke siapa pun.`;
  return sendTextMessage(phone, body);
}

export function normalizePhone62(phone) {
  return toE16462(phone);
}

export async function sendWhatsAppTemplate(to, templateSID, params = {}) {
    return sendTemplateMessage(to, templateSID, params);
  }
  
  // === high-level untuk PENDING & PAID ===
  export async function sendPendingPaymentTemplate({
    phone,
    customer_name,
    order_id,
    amount,
    order_date,
    payment_link,
    notes,
  }) {
    const sid = process.env.TWILIO_CONTENT_SID_PENDING;
    if (!sid) throw new Error('TWILIO_CONTENT_SID_PENDING is not set');
    return sendWhatsAppTemplate(phone, sid, {
      customer_name,
      order_id,
      amount,
      order_date,
      payment_link,
      notes,
    });
  }
  
  export async function sendPaidPaymentTemplate({
    phone,
    customer_name,
    order_id,
    amount,
    paid_at,
  }) {
    const sid = process.env.TWILIO_CONTENT_SID_PAID;
    if (!sid) throw new Error('TWILIO_CONTENT_SID_PAID is not set');
    return sendWhatsAppTemplate(phone, sid, {
      customer_name,
      order_id,
      amount,
      paid_at,
    });
  }
  
