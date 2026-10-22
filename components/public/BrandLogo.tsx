'use client';

import { useId } from 'react';
import Image from 'next/image';
import './brand-logo.css';

export default function BrandLogo({ className = '', decorative = false }: { className?: string; decorative?: boolean }) {
  const filterId = `thrive-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const sizes = className.includes('--footer') ? '(max-width: 699px) 100vw, 1100px' : className.includes('--watermark') ? '310px' : '(max-width: 699px) 130px, 155px';
  return <span className={`thrive-logo ${className}`} aria-hidden={decorative || undefined}><svg width="0" height="0" aria-hidden="true" style={{ position: 'absolute' }}><defs><filter id={filterId} colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  1 1 1 0 0" /></filter></defs></svg><Image src="/brand/thrive-logo.png" alt={decorative ? '' : 'Thrive Health & Fitness'} width={1448} height={1086} sizes={sizes} className="thrive-logo-image" style={{ filter: `url(#${filterId})` }} /></span>;
}
