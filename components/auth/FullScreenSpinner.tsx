export default function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-background-dark flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-white/60">Loading...</p>
      </div>
    </div>
  );
}
