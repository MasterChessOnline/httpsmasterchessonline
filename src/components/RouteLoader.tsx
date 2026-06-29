import { Crown } from "lucide-react";

export default function RouteLoader() {
  return (
    <div
      aria-label="Loading"
      role="status"
      className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-background pointer-events-none"
    >
      <div className="absolute left-0 right-0 top-0 h-1 overflow-hidden bg-primary/10">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent animate-[routeloader_0.9s_ease-in-out_infinite]" />
      </div>
      <div className="flex flex-col items-center text-center px-6">
        <div className="grid h-20 w-20 place-items-center rounded-2xl border border-primary/45 bg-primary/10 shadow-[0_22px_80px_hsl(var(--primary)/0.24)]">
          <Crown className="h-10 w-10 text-primary" aria-hidden="true" />
        </div>
        <div className="mt-5 font-display text-5xl sm:text-7xl font-black uppercase text-primary leading-none tracking-normal">
          MASTERCHESS
        </div>
      </div>
      <style>{`@keyframes routeloader{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}`}</style>
    </div>
  );
}
