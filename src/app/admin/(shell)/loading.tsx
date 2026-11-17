/** Shown while an admin page streams in; also marks the page boundary for Cache Components. */
export default function AdminLoading() {
  return (
    <div role="status" aria-label="Loading" className="animate-pulse">
      <div className="h-3 w-20 rounded bg-chip" />
      <div className="mt-3 h-8 w-64 rounded bg-chip" />
      <div className="mt-2 h-4 w-96 max-w-full rounded bg-chip" />
      <div className="mt-8 h-72 rounded-lg border border-line bg-white" />
    </div>
  );
}
