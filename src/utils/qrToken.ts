/** Trích JWT token từ nội dung QR (cdweb://qr?token=... hoặc JWT thuần). */
export function parseQrTokenFromScan(raw: string): string | null {
  const text = raw.trim();
  if (!text) return null;

  if (text.startsWith("cdweb://")) {
    try {
      const normalized = text.replace(/^cdweb:\/\//, "https://cdweb.local/");
      const url = new URL(normalized);
      const token = url.searchParams.get("token");
      if (token) return token;
    } catch {
      /* fall through */
    }
  }

  const tokenMatch = text.match(/[?&]token=([^&\s]+)/);
  if (tokenMatch?.[1]) {
    try {
      return decodeURIComponent(tokenMatch[1]);
    } catch {
      return tokenMatch[1];
    }
  }

  if (text.split(".").length === 3) {
    return text;
  }

  return null;
}
