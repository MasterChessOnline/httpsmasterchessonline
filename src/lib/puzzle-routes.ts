// Slug helpers for /puzzle/:slug — strips internal data-source prefix so user-visible
// URLs never leak third-party brand names.
export function puzzleIdToSlug(id: string): string {
  return id.replace(/^lichess-/i, "").replace(/^mc-/i, "").toLowerCase();
}

export function slugMatchesPuzzleId(slug: string, id: string): boolean {
  return puzzleIdToSlug(id) === slug.toLowerCase();
}
