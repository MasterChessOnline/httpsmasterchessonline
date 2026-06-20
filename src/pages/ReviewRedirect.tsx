import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useGoogleReview, trackReviewClick } from "@/lib/google-review";

/** /review — short link that bounces to the Google review form. */
export default function ReviewRedirect() {
  const { reviewUrl } = useGoogleReview();
  useEffect(() => {
    trackReviewClick("short-link");
    window.location.replace(reviewUrl);
  }, [reviewUrl]);
  return (
    <>
      <Helmet>
        <title>Review MasterChess on Google</title>
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="https://masterchess.live/review" />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <a href={reviewUrl} className="underline">Opening Google review form…</a>
      </div>
    </>
  );
}
