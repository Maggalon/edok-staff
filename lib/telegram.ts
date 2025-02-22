import crypto from 'crypto';

export function verifyTelegramWebAppData(initData: string): boolean {
  const searchParams = new URLSearchParams(decodeURIComponent(initData));
  const hash = searchParams.get('hash');
  searchParams.delete('hash');

  const params = Array.from(searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(process.env.NEXT_PUBLIC_BOT_TOKEN!)
    .digest();

  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(params)
    .digest('hex');

  return hmac === hash;
}