export function parseExpiry(str: string) {
  const match = str.match(/^(\d+)([smhd])$/); // s=seconds, m=minutes, h=hours, d=days
  if (!match) throw new Error("Invalid expiry format");

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return value * multipliers[unit];
}

const maxAge = parseExpiry("7d"); // 604800000 ms
