'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronRight, Menu, X } from 'lucide-react';
import './landing.css';
import BrandLogo from './BrandLogo';

interface NavbarProps {
  onJoinClick?: () => void;
}

export default function Navbar({ onJoinClick }: NavbarProps) {
  const pathname = usePathname();
  const isCurrentPage = (href: string) => {
    const path = href.split('#')[0];
    return path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`);
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const mobileDialog = useRef<HTMLDialogElement>(null);
  const menuAnimations = useRef<Animation[]>([]);
  const menuClosing = useRef(false);

  useEffect(() => {
    if (!mobileMenuOpen) {
      mobileDialog.current?.close();
      return;
    }
    mobileDialog.current?.showModal();
    menuClosing.current = false;
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && mobileDialog.current) {
      menuAnimations.current.push(mobileDialog.current.animate([
        { opacity: 0, transform: 'translateY(-12px)' },
        { opacity: 1, transform: 'none' },
      ], { duration: 480, easing: 'cubic-bezier(.22,.61,.36,1)' }));
      mobileDialog.current.querySelectorAll('.landing-mobile-links a, .landing-mobile-signin, .landing-mobile-join, .landing-mobile-menu-bottom').forEach((element, index) => {
        menuAnimations.current.push(element.animate([
          { opacity: 0, transform: 'translateY(12px)' },
          { opacity: 1, transform: 'none' },
        ], { duration: 520, delay: 70 + index * 45, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'backwards' }));
      });
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => {
      menuAnimations.current.forEach((animation) => animation.cancel());
      menuAnimations.current = [];
      menuClosing.current = false;
      document.body.style.overflow = previousOverflow;
      desktop.removeEventListener('change', closeOnDesktop);
    };
  }, [mobileMenuOpen]);

  const closeMobileMenu = () => {
    const dialog = mobileDialog.current;
    if (menuClosing.current) return;
    if (!dialog?.open || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog?.close();
      setMobileMenuOpen(false);
      return;
    }
    menuClosing.current = true;
    menuAnimations.current.forEach((animation) => animation.cancel());
    const closing = dialog.animate([
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translateY(-8px)' },
    ], { duration: 280, easing: 'ease-in', fill: 'forwards' });
    menuAnimations.current = [closing];
    void closing.finished.then(() => {
      dialog.close();
      setMobileMenuOpen(false);
    }).catch(() => { /* Closing is cancelled when the page unmounts or changes size. */ });
  };

  useEffect(() => {
    const updateScroll = () => setIsScrolled(
      Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop) > 16
    );
    updateScroll();
    // The page body can be the scroll container when horizontal overflow is hidden.
    window.addEventListener('scroll', updateScroll, { passive: true, capture: true });
    return () => window.removeEventListener('scroll', updateScroll, true);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/#home' },
    { name: 'Offerings', href: '/services' },
    { name: 'Prices', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header
      className={`landing-navbar w-full fixed top-0 left-0 right-0 z-40 ${isScrolled ? 'landing-navbar-scrolled' : ''}`}
      style={{
        backdropFilter: isScrolled ? 'blur(24px) saturate(150%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(24px) saturate(150%)' : 'none',
      }}
    >
      <div className="landing-container relative py-6 sm:py-7 flex items-center justify-between gap-4">
      <Link href="/" className="landing-brand-link" aria-label="Thrive — home"><BrandLogo /></Link>

      {/* Right Edge: Nav Links + Join Now Button with no bar circling them */}
      <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
        <nav className="hidden lg:flex items-center gap-5 lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              aria-current={isCurrentPage(link.href) ? 'page' : undefined}
              className="landing-nav-link text-sm font-medium text-white/85 hover:text-white drop-shadow transition-colors relative py-1 hover:after:w-full after:w-0 after:h-[2px] after:bg-white after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <Link href="/login" className="landing-signin">Sign in</Link>

        {/* Right CTA Button */}
        <button
          onClick={onJoinClick}
          className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 text-xs sm:text-sm font-semibold text-zinc-950 bg-white hover:bg-[#c2edff] rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg cursor-pointer"
        >
          Join Now
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => { if (mobileMenuOpen) closeMobileMenu(); else setMobileMenuOpen(true); }}
          className="lg:hidden p-2 text-white/90 hover:text-white rounded-lg focus:outline-none"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <dialog ref={mobileDialog} id="mobile-navigation" className="landing-mobile-menu" aria-label="Main navigation" onCancel={(event) => { event.preventDefault(); closeMobileMenu(); }}>
        <div className="landing-mobile-menu-content">
          <div className="landing-mobile-menu-top">
            <Link href="/#home" onClick={closeMobileMenu} className="landing-mobile-brand" aria-label="Thrive — home"><BrandLogo /></Link>
            <button type="button" onClick={closeMobileMenu} aria-label="Close navigation" className="landing-mobile-close" autoFocus><X size={26} strokeWidth={1.5} /></button>
          </div>
          <nav aria-label="Mobile navigation" className="landing-mobile-links">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} aria-current={isCurrentPage(link.href) ? 'page' : undefined} onClick={closeMobileMenu}>{link.name}<ChevronRight size={22} strokeWidth={1.3} aria-hidden="true" /></Link>
            ))}
          </nav>
          <Link href="/login" className="landing-mobile-signin" onClick={closeMobileMenu}>Sign in<ArrowUpRight size={20} aria-hidden="true" /></Link>
          <button type="button" className="landing-mobile-join" onClick={() => { closeMobileMenu(); onJoinClick?.(); }}>Join Now<ArrowUpRight size={20} aria-hidden="true" /></button>
          <div className="landing-mobile-menu-bottom"><a href="https://maps.google.com/?cid=2794173722916044271" target="_blank" rel="noopener noreferrer">Addis Ababa</a><a href="tel:+251913814546">091 381 4546</a><span>Open 24/7</span></div>
        </div>
      </dialog>
      </div>
    </header>
  );
}
