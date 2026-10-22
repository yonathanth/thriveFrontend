'use client';

import React from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

interface TourVideoCardProps {
  onOpenVideo: () => void;
}

export default function TourVideoCard({ onOpenVideo }: TourVideoCardProps) {
  return (
    <div
      onClick={onOpenVideo}
      className="group cursor-pointer select-none relative rounded-2xl sm:rounded-3xl p-2 sm:p-2.5 bg-white/[0.08] hover:bg-white/[0.14] backdrop-blur-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.01] sm:hover:scale-[1.03] hover:border-white/35 active:scale-[0.98] w-full lg:w-[320px] xl:w-[340px]"
    >
      {/* Shorter Video Thumbnail Box */}
      <div className="relative aspect-[2.1/1] sm:aspect-[2.2/1] lg:aspect-[16/8] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900 border border-white/10">
        <Image
          src="/tour-thumbnail.jpg"
          alt="Gym Tour Preview"
          fill
          sizes="(max-width: 1024px) 100vw, 340px"
          className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        {/* Subtle Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Central Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring */}
            <div className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#09b2f7]/30 animate-ping motion-reduce:animate-none opacity-60 pointer-events-none" />

            {/* Play Button Circle */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-white text-zinc-950 flex items-center justify-center pl-0.5 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-[#c2edff]">
              <Play className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-zinc-950" fill="currentColor" />
            </div>
          </div>
        </div>
      </div>

      {/* Caption text */}
      <div className="pt-2 pb-0.5 px-1 flex items-center justify-between">
        <span className="text-xs sm:text-sm font-semibold text-white tracking-tight group-hover:text-[#8ddfff] transition-colors">
          Watch Tour Video
        </span>
        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:bg-white group-hover:text-zinc-950 transition-colors">
          <span className="text-xs">↗</span>
        </div>
      </div>
    </div>
  );
}
