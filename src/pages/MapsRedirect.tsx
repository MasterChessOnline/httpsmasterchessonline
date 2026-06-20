import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useGoogleReview } from "@/lib/google-review";

/** /maps — short link that bounces to the MasterChess Google Maps listing. */
export default function MapsRedirect() {
  const { mapsUrl } = useGoogleReview();
  useEffect(() => {
    window.location.replace(mapsUrl);
  }, [mapsUrl]);
  return (
    <>
      <Helmet>
        <title>MasterChess on Google Maps</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://masterchess.live/maps" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <a href={mapsUrl} className="underline">Opening Google Maps…</a>
      </div>
    </>
  );
}
