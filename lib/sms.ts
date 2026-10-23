/**
 * Characters an SMS carries at the cheaper GSM rate. Anything else (Amharic, emoji,
 * curly quotes, long dashes) makes the whole message Unicode: 70 characters per SMS
 * instead of 160.
 */
const GSM = /^[A-Za-z0-9 \r\n@£$¥èéùìòÇØøÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ!"#¤%&'()*+,\-./:;<=>?¡ÄÖÑÜ§¿äöñüà^{}\\[~\]|€]*$/;

/** How many SMS a message costs per recipient. */
export function smsCount(text: string): { chars: number; parts: number; unicode: boolean } {
  const unicode = !GSM.test(text);
  const chars = [...text].length;
  const [one, many] = unicode ? [70, 67] : [160, 153];
  return { chars, parts: chars <= one ? 1 : Math.ceil(chars / many), unicode };
}
