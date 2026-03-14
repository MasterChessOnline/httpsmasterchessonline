import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-6 py-24">
      <div className="max-w-3xl mx-auto prose prose-invert prose-sm">
        <h1 className="text-3xl font-bold font-display text-foreground">Privacy Policy</h1>
        <p className="text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="space-y-6 mt-8 text-muted-foreground text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Information We Collect</h2>
            <p>We collect information you provide when creating an account (email, display name) and gameplay data (ratings, game history) to deliver and improve our services.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">How We Use Your Information</h2>
            <p>Your data is used to provide chess games, track progress, maintain leaderboards, and process payments. We never sell your personal information to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Payments</h2>
            <p>Payments are processed securely through Stripe. We do not store your credit card information on our servers.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Cookies</h2>
            <p>We use essential cookies for authentication and session management. No third-party tracking cookies are used.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Contact</h2>
            <p>For privacy-related questions, please reach out via our <a href="/contact" className="text-primary hover:underline">Contact page</a>.</p>
          </section>
        </div>
      </div>
    </main>
    <Footer />
  </div>
);

export default Privacy;
