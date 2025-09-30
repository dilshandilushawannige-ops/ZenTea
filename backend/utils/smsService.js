// backend/utils/smsService.js
import https from 'https';

const logPrefix = '[sms]';

const normalizeRecipient = (to) => {
  const trimmed = String(to || '').trim();
  if (!trimmed) return '';
  if (/^\+94\d{9}$/.test(trimmed)) return trimmed;
  if (/^0\d{9}$/.test(trimmed)) return `+94${trimmed.slice(1)}`;
  return trimmed.startsWith('+') ? trimmed : `+${trimmed}`;
};

const sendViaVonage = (to, body) => {
  const apiKey = (process.env.VONAGE_API_KEY || '').trim();
  const apiSecret = (process.env.VONAGE_API_SECRET || '').trim();
  const from = (process.env.VONAGE_FROM || '').trim();
  if (!apiKey || !apiSecret || !from) {
    console.warn(`${logPrefix} skipped: missing Vonage credentials`);
    return Promise.resolve(false);
  }

  const payload = new URLSearchParams({
    api_key: apiKey,
    api_secret: apiSecret,
    to,
    from,
    text: body,
  }).toString();

  const options = {
    hostname: 'rest.nexmo.com',
    path: '/sms/json',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.messages?.[0]?.status === '0') {
            console.info(`${logPrefix} sent via Vonage to ${to}`);
            return resolve(true);
          }
          console.warn(`${logPrefix} Vonage error`, parsed);
        } catch (err) {
          console.warn(`${logPrefix} Vonage parse error`, err.message, data);
        }
        resolve(false);
      });
    });

    req.on('error', (err) => {
      console.warn(`${logPrefix} Vonage HTTP error`, err.message);
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

export const sendSMS = async (to, message) => {
  const recipient = normalizeRecipient(to);
  if (!recipient) {
    console.warn(`${logPrefix} skipped: invalid recipient`);
    return false;
  }

  const provider = (process.env.SMS_PROVIDER || 'vonage').toLowerCase();
  switch (provider) {
    case 'vonage':
      return sendViaVonage(recipient, message);
    // keep Twilio path if you ever turn it back on:
    // case 'twilio': return sendViaTwilio(recipient, message);
    default:
      console.warn(`${logPrefix} skipped: unsupported provider ${provider}`);
      return false;
  }
};
