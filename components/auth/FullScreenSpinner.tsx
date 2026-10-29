import BrandLogo from '@/components/public/BrandLogo';

export default function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-[#0b1013] flex items-center justify-center" role="status" aria-live="polite" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <BrandLogo decorative />
        <div className="mt-5 size-6 border-2 border-[#8ddfff]/20 border-t-[#8ddfff] rounded-full animate-spin motion-reduce:animate-none" aria-hidden="true" />
      </div>
    </div>
  );
}
