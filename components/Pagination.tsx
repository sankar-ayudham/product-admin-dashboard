"use client";

export default function Pagination({ page, pageSize, total, onPage, onPageSize }: { page: number; pageSize: number; total: number; onPage: (page: number) => void; onPageSize: (size: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => {
    let n = Math.max(1, page - 2) + i;
    if (n > pages) n = pages - (Math.min(5, pages) - 1 - i);
    return n;
  });
  return <div className="flex flex-col gap-4 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="text-slate-500">Showing {start}–{end} of {total}</p><div className="flex flex-wrap items-center gap-2"><select value={pageSize} onChange={(e) => onPageSize(Number(e.target.value))} className="rounded-lg border bg-white px-2 py-2"><option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option></select><button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Previous</button>{numbers.map((n) => <button key={n} onClick={() => onPage(n)} className={`rounded-lg border px-3 py-2 ${n === page ? "bg-slate-900 text-white" : "bg-white"}`}>{n}</button>)}<button disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-lg border px-3 py-2 disabled:opacity-40">Next</button></div></div>;
}
