'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import BrandLogo from './BrandLogo';
import { ArrowLeft, ArrowRight, Maximize2, Play, X } from 'lucide-react';
import './facilities.css';

const photos = [
  { src: '/tour-thumbnail.jpg', title: 'The whole picture.', alt: 'A panoramic gym floor with strength machines, cardio equipment, and members training', className: 'floor' },
  { src: '/facilities/gym-floor.jpg', title: 'Built for your best.', alt: 'An open gym interior filled with training equipment', className: 'room' },
  { src: '/services/strength.jpg', title: 'Strength in abundance.', alt: 'Rows of dumbbells and benches in a strength training area', className: 'weights' },
  { src: '/facilities/training-space.jpg', title: 'Find your rhythm.', alt: 'A dedicated indoor gym training space', className: 'training' },
  { src: '/facilities/strength-zone.jpg', title: 'Make it your space.', alt: 'A gym strength and fitness training area', className: 'zone' },
];

export default function FacilitiesSection({ onOpenVideo }: { onOpenVideo: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const isOpen = selected !== null;

  useEffect(() => {
    if (!isOpen) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [isOpen]);

  const movePhoto = (direction: number) => setSelected((current) => current === null ? null : (current + direction + photos.length) % photos.length);

  return (
    <section id="facilities" aria-labelledby="facilities-heading" className="thrive-facilities">
      <div className="landing-container">
        <div className="thrive-facilities-heading">
          <h2 id="facilities-heading">Space to move.<br /><em>Room to grow.</em></h2>
          <button type="button" onClick={onOpenVideo} className="thrive-facilities-tour"><span><Play size={13} fill="currentColor" aria-hidden="true" /></span>Take a look inside</button>
        </div>
        <div className="thrive-facilities-wall">
          {photos.map((photo, index) => (
            <button type="button" key={photo.src} onClick={() => setSelected(index)} className={`thrive-facilities-photo thrive-facilities-${photo.className}`} aria-label={`Enlarge photo: ${photo.title}`} aria-haspopup="dialog">
              <Image src={photo.src} alt={photo.alt} fill sizes={index === 0 ? '(max-width: 699px) 100vw, 65vw' : '(max-width: 699px) 50vw, 40vw'} />
              <span className="thrive-facilities-photo-shade" />
              <span className="thrive-facilities-photo-caption">{photo.title}<span className="thrive-facilities-expand"><Maximize2 size={16} aria-hidden="true" /></span></span>
            </button>
          ))}
          <div className="thrive-facilities-statement"><span className="thrive-facilities-brand"><BrandLogo className="thrive-logo--watermark" decorative /></span><p>Your space.<br /><em>Your next level.</em></p></div>
        </div>
      </div>
      <dialog ref={dialog} className="thrive-facilities-lightbox" aria-label="Facilities photo gallery" onCancel={(event) => { event.preventDefault(); setSelected(null); }} onClick={(event) => { if (event.target === event.currentTarget) setSelected(null); }} onKeyDown={(event) => {
        if (event.key === 'ArrowRight') { event.preventDefault(); movePhoto(1); }
        if (event.key === 'ArrowLeft') { event.preventDefault(); movePhoto(-1); }
      }}>
        {selected !== null && <div className="thrive-facilities-lightbox-content">
          <button type="button" autoFocus className="thrive-facilities-close" onClick={() => setSelected(null)} aria-label="Close photo gallery"><X size={23} /></button>
          <div className="thrive-facilities-lightbox-image"><Image key={photos[selected].src} src={photos[selected].src} alt={photos[selected].alt} fill sizes="95vw" /></div>
          <div className="thrive-facilities-lightbox-footer"><p aria-live="polite">{photos[selected].title}</p><div><button type="button" onClick={() => movePhoto(-1)} aria-label="Previous facility photo"><ArrowLeft size={19} /></button><span>{selected + 1} / {photos.length}</span><button type="button" onClick={() => movePhoto(1)} aria-label="Next facility photo"><ArrowRight size={19} /></button></div></div>
        </div>}
      </dialog>
    </section>
  );
}
