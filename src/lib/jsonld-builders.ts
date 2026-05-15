// Schema.org JSON-LD builders for rich SERP results.
// Use with the existing <Seo jsonLd={...} /> prop.
const SITE = "https://masterchess.live";

export function buildPersonSchema(opts: {
  name: string;
  username?: string | null;
  url: string;
  image?: string | null;
  bio?: string | null;
  country?: string | null;
  rating?: number;
  gamesPlayed?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["Person", "Athlete"],
    name: opts.name,
    alternateName: opts.username ?? undefined,
    url: opts.url,
    image: opts.image ?? `${SITE}/og-image.jpg`,
    description: opts.bio ?? `${opts.name} — chess player on MasterChess`,
    nationality: opts.country ?? undefined,
    sport: "Chess",
    affiliation: { "@type": "Organization", name: "MasterChess", url: SITE },
    award: opts.rating ? `${opts.rating} ELO` : undefined,
  };
}

export function buildVideoSchema(v: {
  videoId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  uploadDate?: string;
  duration?: string; // ISO 8601 e.g. PT5M30S
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: v.title,
    description: v.description ?? v.title,
    thumbnailUrl: v.thumbnailUrl ?? `https://i.ytimg.com/vi/${v.videoId}/maxresdefault.jpg`,
    uploadDate: v.uploadDate ?? new Date().toISOString(),
    duration: v.duration,
    contentUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    embedUrl: `https://www.youtube.com/embed/${v.videoId}`,
    publisher: {
      "@type": "Organization",
      name: "MasterChess",
      logo: { "@type": "ImageObject", url: `${SITE}/og-image.jpg` },
    },
  };
}

export function buildEventSchema(t: {
  id: string;
  name: string;
  description?: string;
  startsAt: string;
  endsAt?: string;
  status?: string;
  maxPlayers?: number;
}) {
  const url = `${SITE}/tournaments/${t.id}`;
  return {
    "@context": "https://schema.org",
    "@type": ["Event", "SportsEvent"],
    name: t.name,
    description: t.description ?? `${t.name} — chess tournament on MasterChess`,
    startDate: t.startsAt,
    endDate: t.endsAt ?? t.startsAt,
    eventStatus:
      t.status === "finished"
        ? "https://schema.org/EventCompleted"
        : t.status === "active"
          ? "https://schema.org/EventScheduled"
          : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url,
    },
    organizer: { "@type": "Organization", name: "MasterChess", url: SITE },
    sport: "Chess",
    image: `${SITE}/og-image.jpg`,
    url,
    maximumAttendeeCapacity: t.maxPlayers,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    },
  };
}

export function buildBreadcrumbSchema(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${SITE}${c.path}`,
    })),
  };
}

export function buildItemListSchema(items: { name: string; path: string }[], listName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      url: `${SITE}${it.path}`,
    })),
  };
}

export function buildCourseSchema(c: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: c.name,
    description: c.description,
    url: c.url,
    provider: { "@type": "Organization", name: "MasterChess", url: SITE },
    inLanguage: "en",
    educationalLevel: "Beginner to Advanced",
    teaches: c.name,
    isAccessibleForFree: true,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "PT15M",
    },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}
