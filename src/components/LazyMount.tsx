import { ReactNode, useEffect, useRef, useState } from "react";

interface Props {
  children: ReactNode;
  /** Approx height while not yet mounted, prevents CLS. */
  minHeight?: number | string;
  /** rootMargin for IntersectionObserver. */
  rootMargin?: string;
  /** Render immediately on small screens? Default false. */
  eager?: boolean;
}

/**
 * Defers mounting heavy below-the-fold sections until they approach the viewport.
 * Cuts initial JS work and improves first-paint on mobile.
 */
export default function LazyMount({
  children,
  minHeight = 400,
  rootMargin = "300px 0px",
  eager = false,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={{ minHeight: visible ? undefined : minHeight }}>
      {visible ? children : null}
    </div>
  );
}
