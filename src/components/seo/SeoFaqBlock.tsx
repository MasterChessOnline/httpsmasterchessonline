/**
 * Visible FAQ block for content pages. Pair it with buildFaqSchema() in the
 * page's <Seo jsonLd> so Google can render the questions as rich results.
 */
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqItem } from "@/lib/seo-faq";

export default function SeoFaqBlock({
  items,
  title = "Frequently asked",
  className = "",
}: {
  items: FaqItem[];
  title?: string;
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <section className={`mt-10 ${className}`} aria-label={title}>
      <h2 className="font-display text-sm uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <HelpCircle className="h-4 w-4 text-primary" /> {title}
      </h2>
      <Accordion type="single" collapsible className="rounded-xl border border-border/30 glass-4d px-4">
        {items.map((f, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-border/20">
            <AccordionTrigger className="text-left text-sm font-semibold hover:text-primary">
              {f.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-foreground/80 leading-relaxed">
              {f.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
