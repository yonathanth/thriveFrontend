'use client';

import { useLayoutEffect, type RefObject } from 'react';

export default function useLandingMotion(root: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const page = root.current;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!page || reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const animations = new Set<Animation>();
    const pending = new Map<Element, Animation>();
    const delays = new Map<Element, number>();
    const groups = [
      '.thrive-about-heading',
      '.thrive-about-grid > *',
      '.thrive-services-heading',
      '.thrive-services-list > *',
      '.thrive-facilities-heading',
      '.thrive-facilities-wall > *',
      '.thrive-contact-invitation',
      '.thrive-contact-details > *',
      '.thrive-contact-map',
      '.thrive-footer-columns > *',
      '.thrive-footer-wordmark',
      '.thrive-footer-bottom',
    ];
    groups.forEach((selector) => {
      page.querySelectorAll(selector).forEach((element, index) => delays.set(element, Math.min(index * 70, 140)));
    });

    function animate(element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) {
      const animation = element.animate(frames, options);
      animations.add(animation);
      animation.onfinish = () => {
        animations.delete(animation);
        // Release the final transform so hover styles can take over without a jump.
        animation.cancel();
      };
      return animation;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        const animation = pending.get(entry.target);
        pending.delete(entry.target);
        if (reducedMotion.matches) animation?.cancel();
        else animation?.play();
      });
    }, { threshold: 0.03, rootMargin: '0px' });

    delays.forEach((delay, element) => {
      const bounds = element.getBoundingClientRect();
      // Never hide anything already on screen or above the current scroll position.
      if (bounds.top < window.innerHeight) return;
      const animation = animate(element, [
        { opacity: 0, transform: 'translate3d(0, 24px, 0)' },
        { opacity: 1, transform: 'translate3d(0, 0, 0)' },
      ], { duration: 900, delay, easing: 'cubic-bezier(.22, .61, .36, 1)', fill: 'both' });
      animation.pause();
      animation.currentTime = 0;
      pending.set(element, animation);
      observer.observe(element);
    });
    const heroPhoto = page.querySelector('#home > div:first-child img');
    if (heroPhoto) animate(heroPhoto, [
      { transform: 'scale(1.015)', opacity: 0.9 },
      { transform: 'scale(1)', opacity: 1 },
    ], { duration: 1900, easing: 'cubic-bezier(.25, .46, .45, .94)' });

    const stop = () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      animations.clear();
      pending.clear();
    };
    const onPreferenceChange = () => { if (reducedMotion.matches) stop(); };
    reducedMotion.addEventListener('change', onPreferenceChange);
    return () => {
      stop();
      reducedMotion.removeEventListener('change', onPreferenceChange);
    };
  }, [root]);
}
