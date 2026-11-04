/**
 * How many SMS a text costs. Phones and Ethio Telecom carry one SMS of up to 160
 * plain (GSM) characters; longer texts are split into parts of 153. A single
 * character outside that alphabet (Amharic, emoji, curly quotes, long dashes) makes
 * the whole message Unicode: 70 characters in one SMS, 67 per part when split.
 * Each part is charged as one SMS.
 */
export const SMS_LIMITS = { gsm: 160, gsmPart: 153, unicode: 70, unicodePart: 67 };

const GSM_BASIC = new Set(
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà",
);
/** These fit in GSM but take two character slots each. */
const GSM_EXTENDED = new Set('^{}\\[~]|€');

export interface SmsLength {
  /** Character slots used */
  chars: number;
  /** SMS charged per recipient */
  parts: number;
  unicode: boolean;
  /** Most characters that still fit in one SMS for this text's alphabet */
  limit: number;
}

export function smsCount(text: string): SmsLength {
  const chars = [...text];
  const unicode = chars.some((c) => !GSM_BASIC.has(c) && !GSM_EXTENDED.has(c));
  const used = unicode ? chars.length : chars.reduce((n, c) => n + (GSM_EXTENDED.has(c) ? 2 : 1), 0);
  const [limit, part] = unicode
    ? [SMS_LIMITS.unicode, SMS_LIMITS.unicodePart]
    : [SMS_LIMITS.gsm, SMS_LIMITS.gsmPart];
  return { chars: used, parts: used <= limit ? 1 : Math.ceil(used / part), unicode, limit };
}

/** One line under a message box: the count, and a warning once it is more than one SMS. */
export function smsLengthNote(text: string): { text: string; warn: boolean } {
  const l = smsCount(text);
  const kind = l.unicode ? 'Amharic/emoji' : 'English';
  if (l.parts <= 1) return { text: `${l.chars}/${l.limit} characters (${kind}): 1 SMS`, warn: false };
  return {
    text:
      `${l.chars} characters: over the ${l.limit}-character limit for one ${kind} SMS, ` +
      `so it will be sent as ${l.parts} SMS per person and cost ${l.parts}x.` +
      (l.unicode ? ' Removing all Amharic and emoji raises the limit to 160.' : ''),
    warn: true,
  };
}
