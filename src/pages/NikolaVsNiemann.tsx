// Kurir-style tabloid feature: 13-year-old MasterChess founder meets
// Hans Niemann at the board in Belgrade. Standalone route so it bypasses
// the DB-backed news list and can carry its own dedicated visual language.
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Share2, ArrowRight, Flame } from "lucide-react";
import photoAsset from "@/assets/nikola/nikola-vs-niemann.jpg.asset.json";

const HERO_PHOTO = photoAsset.url;
const URL_PATH = "/news/nikola-vs-niemann-belgrade";
const CANONICAL = `https://masterchess.live${URL_PATH}`;

const ARTICLE_LD = {
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  headline:
    "ŠOK U BEOGRADU: Klinac (13) koji je sam napravio MasterChess seo za tablu Hansa Niemanna!",
  description:
    "Nikola Šakotić (13), osnivač MasterChess.live, u glavnom gradu Srbije zauzeo mesto za istorijskom tablom Niemann–Nepomniachtchi. Priča koju ceo srpski šah komentariše.",
  image: [`https://masterchess.live${HERO_PHOTO}`],
  datePublished: "2026-07-17T09:00:00+02:00",
  dateModified: "2026-07-17T09:00:00+02:00",
  author: { "@type": "Person", name: "MasterChess Redakcija" },
  publisher: {
    "@type": "Organization",
    name: "MasterChess.live",
    logo: {
      "@type": "ImageObject",
      url: "https://masterchess.live/app-icon-512.png",
    },
  },
  mainEntityOfPage: CANONICAL,
};

export default function NikolaVsNiemann() {
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900">
      <Seo
        title="ŠOK: Klinac (13) iz Srbije seo za tablu Hansa Niemanna — MasterChess"
        description="Nikola Šakotić (13), tvorac MasterChess.live, u Beogradu zauzeo mesto za tablom Niemann–Nepomniachtchi. Ekskluzivna priča i fotografija."
        path={URL_PATH}
        type="article"
        image={HERO_PHOTO}
        jsonLd={[ARTICLE_LD]}
      />

      <Navbar />

      {/* ============ KURIR-STYLE HEADER ============ */}
      <div className="bg-red-700 text-white border-b-4 border-yellow-400">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between text-xs md:text-sm font-bold uppercase tracking-widest">
          <span className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-yellow-300" />
            Ekskluzivno · MasterChess Vesti
          </span>
          <span className="hidden md:inline">17. jul 2026 · Beograd</span>
        </div>
      </div>

      <main className="container mx-auto max-w-3xl px-4 py-6 md:py-10">
        {/* Screamer chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="bg-red-600 text-white text-xs font-black uppercase px-3 py-1 rounded-sm tracking-wider">
            ŠOK
          </span>
          <span className="bg-yellow-400 text-black text-xs font-black uppercase px-3 py-1 rounded-sm tracking-wider">
            Ekskluzivno
          </span>
          <span className="bg-black text-yellow-300 text-xs font-black uppercase px-3 py-1 rounded-sm tracking-wider">
            Srbija · Šah
          </span>
        </div>

        {/* KURIR-STYLE HEADLINE */}
        <h1
          className="text-3xl md:text-5xl lg:text-6xl font-black leading-[0.95] mb-3 uppercase"
          style={{
            fontFamily:
              "'Impact', 'Arial Narrow', 'Bebas Neue', sans-serif",
            letterSpacing: "-0.01em",
          }}
        >
          Klinac (13){" "}
          <span className="bg-yellow-300 px-1">koji je SAM napravio</span>{" "}
          MasterChess seo za tablu{" "}
          <span className="text-red-700">Hansa Niemanna!</span>
        </h1>

        <p className="text-lg md:text-xl font-semibold text-neutral-700 mb-6 leading-snug">
          Neverovatna scena u Beogradu: Nikola Šakotić, dečak iz Srbije koji je
          sam kodirao ceo šahovski sajt, zauzeo mesto za istorijskom tablom
          <b> Niemann–Nepomniachtchi</b>. Fotografija koja je zapalila mreže.
        </p>

        {/* HERO PHOTO with kurir caption */}
        <figure className="mb-6 border-y-8 border-black">
          <img
            src={HERO_PHOTO}
            alt="Nikola Šakotić za tablom Niemann–Nepomniachtchi u Beogradu"
            className="w-full h-auto"
            loading="eager"
          />
          <figcaption className="bg-black text-white text-xs md:text-sm px-3 py-2 font-semibold">
            EKSKLUZIVA: Nikola (13) za tablom gde je igrao Niemann protiv
            Nepomniachtchija · Foto: privatna arhiva
          </figcaption>
        </figure>

        {/* BYLINE */}
        <div className="flex items-center justify-between text-xs md:text-sm text-neutral-500 uppercase tracking-widest border-b border-neutral-300 pb-3 mb-6">
          <span>PIŠE: MasterChess Redakcija</span>
          <button
            onClick={() =>
              navigator.share?.({
                title: "Klinac (13) seo za tablu Hansa Niemanna",
                url: CANONICAL,
              })
            }
            className="flex items-center gap-1 hover:text-red-700"
          >
            <Share2 className="h-3.5 w-3.5" /> Podeli
          </button>
        </div>

        {/* LEAD */}
        <p className="text-lg md:text-xl font-semibold leading-relaxed mb-5 first-letter:text-6xl first-letter:font-black first-letter:text-red-700 first-letter:mr-2 first-letter:float-left first-letter:leading-none">
          Ovo je fotografija koja je za manje od 24 sata obišla srpski šahovski
          svet. Za tablom za kojom su se pre samo par meseci mučili{" "}
          <b>Hans Niemann</b> i <b>Ian Nepomniachtchi</b>, sada sedi —{" "}
          <b>Nikola Šakotić, trinaestogodišnjak iz Beograda</b>. I to nije
          slučajan turista. Nikola je tvorac{" "}
          <Link
            to="/"
            className="text-red-700 underline font-black underline-offset-2"
          >
            MasterChess.live
          </Link>
          , kompletnog šahovskog sajta koji je sam isprogramirao — svaki red
          koda, svaka figura, svaki bot.
        </p>

        <h2 className="text-2xl md:text-3xl font-black mt-8 mb-3 uppercase text-red-700">
          &laquo;Nisam mogao da verujem gde sedim&raquo;
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-4">
          Nikola je u Beogradu bio na jednom od najvećih šahovskih događaja
          godine. Tabla za kojom je snimljen jeste ista ona na kojoj se u
          Srbiji odigrala partija između kontroverznog američkog velemajstora{" "}
          <b>Hansa Niemanna</b> i ruskog superzvezde <b>Iana Nepomniachtchija</b>.
        </p>
        <p className="text-base md:text-lg leading-relaxed mb-4">
          &raquo;Prišao sam tabli, seo, i pomislio: <i>ovde je Niemann razmišljao
          o svom potezu</i>. Ne znam da li ću ikada zaboraviti taj osećaj&laquo;
          — priča Nikola.
        </p>

        <h2 className="text-2xl md:text-3xl font-black mt-8 mb-3 uppercase">
          KO JE NIKOLA?
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-4">
          Ima <b>13 godina</b>. Nauči jedan programski jezik za mesec dana, pa
          drugi. Umesto igrica — pravi svoju. Rezultat:{" "}
          <Link to="/" className="text-red-700 underline font-bold">
            masterchess.live
          </Link>{" "}
          — potpuno besplatan šahovski sajt, bez reklama, sa 9 botova, live
          turnirima, dnevnim zagonetkama i analizom partija preko Stockfisha.
        </p>
        <p className="text-base md:text-lg leading-relaxed mb-4">
          &raquo;Meni je smetalo što svaki šahovski sajt bombarduje reklamama.
          Pa sam napravio svoj. Za mene, i za sve koji vole čist šah&laquo; —
          kratko je objasnio.
        </p>

        <h2 className="text-2xl md:text-3xl font-black mt-8 mb-3 uppercase text-red-700">
          ŠTA KAŽU U SRPSKOM ŠAHU?
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-4">
          Sajt već koriste igrači iz cele Srbije, ali i iz regiona i sveta.
          Nikola je viđen na više turnira Šahovskog saveza Srbije, uvek u
          majici sa svojim logom — zlatnom krunom na crnoj pozadini.
        </p>

        <blockquote className="border-l-8 border-yellow-400 bg-yellow-50 pl-4 pr-3 py-3 my-6 text-lg md:text-xl font-bold italic leading-snug">
          &raquo;Neverovatno je šta je ovo dete sam napravilo. Ovo je budućnost
          srpskog šaha, i to ne za deset godina — nego već sada.&laquo;
        </blockquote>

        <h2 className="text-2xl md:text-3xl font-black mt-8 mb-3 uppercase">
          A SADA?
        </h2>
        <p className="text-base md:text-lg leading-relaxed mb-4">
          Sledeće na spisku: <b>Dragan Brakus Kup</b> — turnir od 9 kola koji
          Nikola organizuje u znak sećanja na velikog srpskog organizatora.
          Prijave su besplatne, a igra se online preko MasterChess platforme.
        </p>

        {/* CTA card */}
        <div className="mt-8 border-4 border-black bg-yellow-300 p-5 md:p-6">
          <div className="text-xs font-black uppercase tracking-widest mb-2">
            IGRAJ ODMAH · BESPLATNO
          </div>
          <div className="text-2xl md:text-3xl font-black uppercase leading-tight mb-3">
            Uđi na sajt koji je napravio dečak iz Srbije.
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="bg-red-700 hover:bg-red-800 text-white font-black uppercase tracking-wide"
            >
              <Link to="/play-guest">
                Igraj sada <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-black bg-white text-black font-black uppercase hover:bg-neutral-100"
            >
              <Link to="/nikola-sakotic">Priča o Nikoli</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-black bg-white text-black font-black uppercase hover:bg-neutral-100"
            >
              <Link to="/dragan-brakus">Dragan Brakus Kup</Link>
            </Button>
          </div>
        </div>

        <div className="mt-10 pt-4 border-t border-neutral-300 text-xs text-neutral-500">
          © MasterChess.live · Ekskluzivno · Kopiranje uz obavezno navođenje
          izvora i link ka sajtu.
        </div>
      </main>

      <Footer />
    </div>
  );
}
