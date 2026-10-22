'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import TourVideoCard from './TourVideoCard';
import './landing.css';

interface HeroSectionProps {
  onJoinClick: () => void;
  onOpenVideo: () => void;
  onServicesClick?: () => void;
}

export default function HeroSection({
  onJoinClick,
  onOpenVideo,
  onServicesClick,
}: HeroSectionProps) {
  return (
    <section
      id="home"
      className="relative isolate min-h-[100svh] w-full flex flex-col justify-end overflow-hidden pt-32 pb-6 select-none bg-black"
    >
      {/* Background Image Container (z-0 to ensure it is always visible) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/hero-athlete.jpg"
          alt="Athlete focused during intense fitness training"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_right] md:object-[68%_center] brightness-[0.95] contrast-[1.05]"
        />

        {/* Subtle cinematic left vignette to ensure text contrast while keeping athlete bright */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/35" />
      </div>

      {/* Top flex spacer pushing all content down to the lower region */}
      <div className="flex-1 w-full min-h-[30px]" />

      {/* Lower Hero Area: Headline, Subtitle, Buttons on Left & Tour Video on Right */}
      <div className="landing-container relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-14 sm:gap-16 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
        {/* Left Column: Headline, Subtitle, Buttons pushed to bottom-left */}
        <div className="landing-copy flex flex-col max-w-xl">
          {/* Main headline */}
          <h1 className="text-[2.1rem] sm:text-4xl md:text-5xl lg:text-[3.25rem] xl:text-[3.6rem] font-bold text-white tracking-[-0.02em] leading-[1.08]">
            Strength and{' '}
            <span className="font-serif italic font-normal tracking-normal text-white font-[family-name:var(--font-editorial)]">
              fitness
            </span>
            <br />
            built around{' '}
            <span className="font-serif italic font-normal tracking-normal text-[#8ddfff] font-[family-name:var(--font-editorial)]">
              your life.
            </span>
          </h1>

          {/* Training options and location */}
          <p className="text-zinc-300 text-xs sm:text-sm md:text-base font-normal max-w-md leading-relaxed mt-2 sm:mt-2.5 mb-3.5 sm:mb-5">
            24/7 gym access, expert coaching, and martial arts classes in Addis Ababa.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 sm:gap-5">
            <button
              onClick={onJoinClick}
              className="px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full bg-white text-[#062332] font-semibold text-xs sm:text-sm hover:bg-[#c2edff] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-[#09b2f7]/15 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#8ddfff]"
            >
              Join Now
            </button>

            <a
              href="#services"
              onClick={(e) => {
                if (onServicesClick) {
                  e.preventDefault();
                  onServicesClick();
                }
              }}
              className="group inline-flex items-center gap-2 text-white/90 hover:text-white font-medium text-xs sm:text-sm py-2 px-1 transition-colors cursor-pointer"
            >
              <span>See Our Services</span>
              <ArrowRight
                size={16}
                className="text-[#09b2f7] group-hover:text-[#8ddfff] transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          </div>
        </div>

        {/* Right Column: Floating Tour Video Widget (With distinct gap on mobile) */}
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-none lg:w-auto flex justify-center lg:justify-end shrink-0">
          <TourVideoCard onOpenVideo={onOpenVideo} />
        </div>
      </div>

      {/* Bottom Horizontal Accent Line matching Screenshot 1 */}
      <div className="landing-container relative z-10 pt-2">
        <div className="w-full h-[1px] bg-white/20 relative overflow-hidden rounded-full">
          <div className="absolute left-0 top-0 h-full w-1/4 bg-gradient-to-r from-transparent via-[#09b2f7] to-transparent" />
        </div>
      </div>
    </section>
  );
}
