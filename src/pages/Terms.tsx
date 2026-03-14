import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-6 py-24">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <h1 className="text-3xl font-bold font-display text-foreground">Terms of Service</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="space-y-6 mt-8 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Acceptance of Terms</h2>
            <p>By using MasterChessOnline, you agree to these terms. If you do not agree, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Accounts</h2>
            <p>You are responsible for maintaining the security of your account. One account per person is allowed. We reserve the right to suspend accounts that violate fair play policies.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Fair Play</h2>
            <p>Using chess engines or external assistance during rated games or tournaments is strictly prohibited and may result in permanent ban.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Payments & Refunds</h2>
            <p>Premium memberships and donations are non-refundable unless required by law. Tournament entry fees may be refunded if the tournament is cancelled.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Content</h2>
            <p>All lessons, courses, and video content are the intellectual property of DailyChess_12 / MasterChessOnline and may not be redistributed without permission.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p>Questions about these terms? Reach out via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Terms;
