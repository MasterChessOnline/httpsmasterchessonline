import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";

const sections = [
  { title: "Acceptance of Terms", text: "By using MasterChessOnline, you agree to these terms. If you do not agree, please do not use the platform." },
  { title: "Accounts", text: "You are responsible for maintaining the security of your account. One account per person is allowed. We reserve the right to suspend accounts that violate fair play policies." },
  { title: "Fair Play", text: "Using chess engines or external assistance during rated games or tournaments is strictly prohibited and may result in permanent ban." },
  { title: "Content", text: "All lessons, courses, and content are the intellectual property of DailyChess_12 / MasterChessOnline and may not be redistributed without permission." },
  { title: "Contact", text: "" },
];

const Terms = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-6 py-24 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12"
      >
        <motion.div
          className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-5"
          whileHover={{ rotate: 8, scale: 1.1 }}
        >
          <FileText className="h-7 w-7 text-primary" />
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </motion.div>

      <div className="space-y-6">
        {sections.map((s, i) => (
          <ScrollReveal key={s.title} delay={i * 0.08}>
            <div className="rounded-xl border border-border/30 glass-4d p-5 hover:border-primary/20 transition-all duration-300">
              <h2 className="text-lg font-semibold text-foreground mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.title === "Contact" ? (
                  <>Questions about these terms? Reach out via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</>
                ) : s.text}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
