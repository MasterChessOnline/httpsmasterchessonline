// Quiet trust row for the homepage hero.
//
// Deliberately NO registered-player / games-played counters: on a young site
// small real numbers ("97 registered players") read as "empty site" and cost
// more signups than they win. Fake numbers are never an option either, so the
// row only carries claims that stay true at any size.
export default function HomeProofRow() {
  const pill = "rounded-full border border-white/10 bg-white/5 px-3 py-1";

  return (
    <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
      <span className={pill}>No signup needed</span>
      <span className={pill}>No ads · No subscription</span>
      <span className={pill}>Free forever</span>
    </div>
  );
}
