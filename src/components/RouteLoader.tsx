import { Crown } from "lucide-react";

export default function RouteLoader() {
  return (
    <div
      aria-label="Loading"
      role="status"
      className="fixed left-1/2 top-20 z-[60] -translate-x-1/2 pointer-events-none"
    >
      <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-background/75 px-3 py-2 text-xs font-semibold text-primary shadow-[0_18px_60px_hsl(var(--primary)/0.16)] backdrop-blur-md">
        <Crown className="h-4 w-4" aria-hidden="true" />
        <span className="h-1.5 w-20 overflow-hidden rounded-full bg-primary/15">
          <span className="block h-full w-1/3 bg-primary animate-[routeloader_0.9s_ease-in-out_infinite]" />
        </span>
      </div>
      <style>{`@keyframes routeloader{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}
