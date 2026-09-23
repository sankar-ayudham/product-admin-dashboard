export function Loading({ label = "Loading..." }: { label?: string }) {
  return <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />{label}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"><p className="mb-3 text-sm text-red-700">{message}</p><button onClick={onRetry} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Retry</button></div>;
}
