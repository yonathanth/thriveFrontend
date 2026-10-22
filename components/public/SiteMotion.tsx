'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';

const revealSelectors = [
  '.tm-offering-list > article', '.tm-everyday', '.tm-questions > details', '.tm-faq > h2', '.tm-closing > *',
  '.tm-plan-grid > article', '.tm-class-prices > article',
  '.ts-cover', '.ts-story > *', '.ts-founder-feature', '.ts-inside-intro', '.ts-people-heading', '.ts-coaches > article', '.ts-visit > *',
  '.thrive-facilities-heading', '.thrive-facilities-wall > *',
  '.tc-connect > *', '.tc-map', '.tc-final',
  '.thrive-footer-columns > nav', '.thrive-footer-wordmark', '.thrive-footer-bottom',
].join(',');

export default function SiteMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useLayoutEffect(() => {
    const page = root.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!page || pathname === '/' || reduced.matches || !('IntersectionObserver' in window)) return;
    const animations = new Map<Element, Animation>();
    const prepared = new WeakSet<Element>();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const animation = animations.get(entry.target);
        if (reduced.matches) animation?.cancel();
        else animation?.play();
      });
    }, { threshold: .03 });

    const prepare = () => {
      page.querySelectorAll(revealSelectors).forEach((element) => {
        if (prepared.has(element) || element.closest('.thrive-homepage')) return;
        prepared.add(element);
        if (element.getBoundingClientRect().top < window.innerHeight) return;
        const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
        const delay = Math.min(siblings.indexOf(element) * 60, 120);
        const animation = element.animate([
          { opacity: 0, transform: 'translateY(20px)' },
          { opacity: 1, transform: 'none' },
        ], { duration: 850, delay, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' });
        animation.pause();
        animation.currentTime = 0;
        animations.set(element, animation);
        animation.onfinish = () => { animation.cancel(); animations.delete(element); };
        observer.observe(element);
      });
    };
    prepare();
    // Streamed routes can mount their content after the initial path change.
    const mutations = new MutationObserver(prepare);
    mutations.observe(page, { childList: true, subtree: true });
    const stop = () => {
      observer.disconnect();
      mutations.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
    };
    const onPreference = () => { if (reduced.matches) stop(); };
    reduced.addEventListener('change', onPreference);
    return () => { stop(); reduced.removeEventListener('change', onPreference); };
  }, [pathname]);

  return <div ref={root} className="thrive-site-motion">{children}</div>;
}
