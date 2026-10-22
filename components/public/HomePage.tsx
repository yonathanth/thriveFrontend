'use client';

import React, { useRef, useState } from 'react';
import Navbar from '@/components/public/Navbar';
import HeroSection from '@/components/public/HeroSection';
import AboutSection from '@/components/public/AboutSection';
import ServicesSection from '@/components/public/ServicesSection';
import FacilitiesSection from '@/components/public/FacilitiesSection';
import AboutContactSection from '@/components/public/AboutContactSection';
import TourVideoModal from '@/components/public/TourVideoModal';
import { useRouter } from 'next/navigation';
import useLandingMotion from '@/hooks/public/useLandingMotion';
import '@/components/public/landing-motion.css';

export default function Home() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const router = useRouter();
  const page = useRef<HTMLDivElement>(null);
  useLandingMotion(page);

  return (
    <div ref={page} className="thrive-homepage relative min-h-screen bg-[#050507] text-[#f4f4f5] flex flex-col selection:bg-amber-400 selection:text-black">
      <Navbar onJoinClick={() => router.push('/join')} />

      <main className="flex-1 flex flex-col">
        <HeroSection
          onJoinClick={() => router.push('/join')}
          onOpenVideo={() => setIsVideoModalOpen(true)}
          onServicesClick={() => {
            const el = document.getElementById('services');
            if (el) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
          }}
        />

        <AboutSection
          onJoinClick={() => router.push('/join')}
          onOpenVideo={() => setIsVideoModalOpen(true)}
        />

        {/* Supporting Services Section */}
        <ServicesSection />

        <FacilitiesSection onOpenVideo={() => setIsVideoModalOpen(true)} />

        {/* Philosophy, Facilities & Contact */}
        <AboutContactSection
          onJoinClick={() => router.push('/join')}
        />
      </main>

      {/* Interactive Tour Video Lightbox Modal */}
      <TourVideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
      />
    </div>
  );
}
