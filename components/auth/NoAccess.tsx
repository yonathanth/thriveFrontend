/** Shown where the signed-in account lacks the permission for a page or panel. */
export default function NoAccess({
  message = "You don't have access to this. Ask an admin if you need it.",
  compact = false,
}: {
  message?: string;
  /** A small inline notice for a panel, instead of a full page. */
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-surface-dark rounded-xl border border-surface-dark-lighter px-4 py-3 text-sm text-white/60">
        <span className="material-symbols-outlined text-base">lock</span>
        {message}
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <span className="material-symbols-outlined text-5xl text-white/30">lock</span>
      <h2 className="text-lg font-semibold text-white">No access</h2>
      <p className="max-w-sm text-sm text-white/60">{message}</p>
    </div>
  );
}
