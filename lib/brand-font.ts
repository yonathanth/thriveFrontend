import localFont from 'next/font/local';

export const brandFont = localFont({
  src: '../public/fonts/plus-jakarta-sans.ttf',
  variable: '--font-public-sans',
  weight: '200 800',
  display: 'swap',
});
