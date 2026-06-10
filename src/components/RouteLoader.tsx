/**
 * Minimal route-change loader. Shown as Suspense fallback for lazy routes so
 * the user never sees the full launch splash again after the initial open.
 * Renders a thin animated gold progress bar pinned to the top of the viewport.
 */
export default function RouteLoader() {
  return (
    <div
      aria-label="Loading"
      role="status"
      className="fixed top-0 inset-x-0 z-[60] h-0.5 overflow-hidden bg-transparent pointer-events-none"
    >
      <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-[routeloader_1s_ease-in-out_infinite]" />
      <style>{`@keyframes routeloader{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}
