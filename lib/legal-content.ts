/**
 * Terms and Refund Policy shown on the website and accepted before paying online.
 *
 * TODO: the gym must review this wording (ideally with legal advice) before taking real
 * payments. It describes how online joining and renewal work in the system; gym rules such as
 * freezes or transfers are left to the front desk until the gym writes them here.
 * SantimPay's agreement requires the refund policy to be published and accepted (§8, §9),
 * refunds to go back through SantimPay, never in cash (§9b), and prices to be the same
 * for everyone with no surcharge for paying online (§4.4, §17).
 */

export const LEGAL_UPDATED = '2026-10-29';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export const termsContent: LegalSection[] = [
  {
    heading: 'About these terms',
    paragraphs: [
      'These terms apply when you use the Thrive Health & Fitness website and member portal, including joining or renewing a membership and paying for it online.',
      'By paying online you confirm that you have read and agree to these terms and to our Refund Policy.',
    ],
  },
  {
    heading: 'Prices',
    paragraphs: [
      'Plan prices are in Ethiopian birr (ETB) and are the same whether you pay at the front desk or online. We do not add a charge for paying online.',
      'The price you pay is the price of the plan at the moment you start the payment.',
    ],
  },
  {
    heading: 'Paying online',
    paragraphs: [
      'Online payments are processed by SantimPay, a licensed payment operator. You pay on SantimPay’s page with Telebirr, CBE Birr, a bank or another method they offer. We never see or store your wallet PIN or bank login.',
      'SantimPay sends you a receipt for the payment. Your payment, the plan you chose and the date are also recorded in your member account, or in the account the gym opens for you when you join.',
    ],
  },
  {
    heading: 'When your membership starts',
    paragraphs: [
      'Our staff confirm each online payment before your membership starts or is renewed.',
      'If you are joining, your membership starts on the day your payment is confirmed. Couple and group packages are set up and paid for at the front desk.',
      'If you are renewing and your current plan is still running, the new period starts when it ends. If your plan has already ended, the new period starts on the day your payment is confirmed.',
    ],
  },
  {
    heading: 'Your account',
    paragraphs: [
      'Keep your login details private. Payments made from your account are treated as made by you.',
      'Membership rules at the gym, such as freezes, continue to be handled at the front desk.',
    ],
  },
  {
    heading: 'Records',
    paragraphs: [
      'We keep records of payments and visits for at least one year, as our payment provider and the law require.',
    ],
  },
];

export const refundContent: LegalSection[] = [
  {
    heading: 'If we cannot confirm your payment',
    paragraphs: [
      'If our staff cannot confirm your online payment, for example because you already joined or renewed at the front desk or the plan is no longer available, we refund the full amount. Members see the reason in their account; if you were joining, we call you.',
    ],
  },
  {
    heading: 'How refunds are paid',
    paragraphs: [
      'Refunds for online payments are made through SantimPay, back to the account or wallet you paid from. We do not refund online payments in cash.',
      'Once a refund is started, the time it takes to reach you depends on SantimPay and your bank or wallet provider.',
    ],
  },
  {
    heading: 'Payments that did not go through',
    paragraphs: [
      'If a payment fails or you cancel it on SantimPay’s page, you are not charged. You can start a new payment at any time.',
    ],
  },
  {
    heading: 'After your membership has started',
    paragraphs: [
      'Once your new period has started, please speak to the front desk about any change or refund request. Approved refunds of online payments are still made through SantimPay.',
    ],
  },
  {
    heading: 'Questions',
    paragraphs: [
      'If you think you were charged by mistake or have not received a refund, contact the front desk with the date and amount of the payment.',
    ],
  },
];
