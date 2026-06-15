// Serbian/Balkans SEO landing-page configs. Each entry becomes a route.
// Targeting near-zero-competition Serbian Google queries (KD < 20).
import type { SeoLandingConfig } from "@/components/SeoLandingPage";

const en = (p: string) => ({ lang: "en", path: p });
const sr = (p: string) => ({ lang: "sr", path: p });

export const SR_LANDINGS: Record<string, SeoLandingConfig> = {
  "sah-online": {
    path: "/sr/sah-online",
    lang: "sr",
    title: "Šah online besplatno — Igraj sa pravim igračima | MasterChess",
    description: "Igraj šah online besplatno, bez reklama, bez registracije. MasterChess te povezuje sa pravim igračima iz celog sveta za 5 sekundi. Bullet, Blic, Brzopotezni i Klasični šah.",
    eyebrow: "Besplatno · Bez reklama",
    h1: "Šah online — besplatno, bez reklama",
    intro: "MasterChess je besplatan online šah sajt. Bez reklama, bez praćenja, bez registracije. Igraš protiv pravih ljudi za 5 sekundi — direktno iz pretraživača, na telefonu ili kompjuteru.",
    hreflang: [en("/free-online-chess"), sr("/sr/sah-online")],
    primaryCta: { label: "Igraj odmah", href: "/play/online" },
    secondaryCta: { label: "Igraj kao gost", href: "/play-guest" },
    bullets: [
      "Besplatno zauvek — bez paywalla",
      "Bez reklama i tracking pixela",
      "Pravi igrači, bez AI pomoći",
      "13 vremenskih kontrola (1+0 do 60+0)",
      "ELO rejting i ranking lista",
      "Radi na mobilnom i desktopu",
    ],
    sections: [
      {
        heading: "Zašto MasterChess",
        body: "Većina šah sajtova te bombarduje reklamama, traži pretplatu za osnovne funkcije, ili ti dozvoljava engine pomoć. MasterChess ide u suprotnom smeru — sve je besplatno, nema reklama, i u online partiji **nema AI eval bara**. Čist, autentičan šah.\n\nIgra počinje za 5 sekundi. Klikneš 'Igraj odmah', biraš vremensku kontrolu, i matchmaker te povezuje sa igračem sličnog rejtinga.",
      },
      {
        heading: "Vremenske kontrole",
        body: "Bullet (1+0, 2+1) za brze partije u pauzi. Blic (3+0, 5+0) za standardnu zabavu. Brzopotezni (10+0, 15+10) za ozbiljnu igru. Klasični (30+0, 60+0) za turnirsko iskustvo.",
      },
      {
        heading: "Šta nakon partije",
        body: "Posle svake partije dobiješ besplatan review — potezi po potezu, sa ručnom analizom (bez engine cheat-a). Vidiš svoj ELO rejting, koliko si poena dobio/izgubio, i možeš pozvati protivnika na revanš.",
      },
    ],
    faq: [
      { q: "Da li je MasterChess zaista besplatan?", a: "Da. Sve osnovne funkcije — online igra, rejting, review, turniri — su besplatne zauvek. Nema paywalla." },
      { q: "Moram li da se registrujem?", a: "Ne. Klikni 'Igraj kao gost' i partija počinje odmah. Registracija je opcionalna — potrebna samo ako želiš da pratiš rejting i istoriju." },
      { q: "Da li ima reklama?", a: "Ne. Nikada nećeš videti reklamu, banner ili tracking pixel na sajtu." },
      { q: "Mogu li igrati protiv prijatelja?", a: "Da. Generišeš link tipa masterchess.live/vs/tvoje-ime i pošalješ ga prijatelju preko WhatsApp-a." },
    ],
    internalLinks: [
      { label: "Šah protiv prijatelja", href: "/sr/sah-protiv-prijatelja" },
      { label: "Šah bez registracije", href: "/sr/sah-bez-registracije" },
      { label: "Šah protiv kompjutera", href: "/sr/sah-protiv-kompjutera" },
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
    ],
  },

  "sah-protiv-prijatelja": {
    path: "/sr/sah-protiv-prijatelja",
    lang: "sr",
    title: "Igraj šah protiv prijatelja preko linka — MasterChess",
    description: "Pošalji prijatelju link na WhatsApp i igrajte šah online za 10 sekundi. Bez registracije, bez aplikacije. Free za oba igrača na MasterChess-u.",
    eyebrow: "1 klik · WhatsApp share",
    h1: "Šah protiv prijatelja — preko linka",
    intro: "Generišeš link tipa masterchess.live/vs/tvoje-ime, pošalješ ga prijatelju preko WhatsApp-a, Telegrama ili SMS-a, i igrate. Bez aplikacije, bez registracije.",
    hreflang: [en("/play-chess-vs-friend"), sr("/sr/sah-protiv-prijatelja")],
    primaryCta: { label: "Napravi izazov link", href: "/viral" },
    secondaryCta: { label: "Igraj odmah", href: "/play/online" },
    bullets: [
      "1 klik — link je gotov",
      "Prijatelj klikne i igrate odmah",
      "Bez registracije za oba igrača",
      "Radi na svakom uređaju",
      "Birate vremensku kontrolu zajedno",
      "Posle partije — revanš preko istog linka",
    ],
    sections: [
      {
        heading: "Kako radi",
        body: "1. Otvori stranicu Izazov.\n2. Unesi svoje ime (ili koristi nasumičan kod).\n3. Klikni 'Kopiraj link' i pošalji prijatelju.\n4. Kad klikne, dovešće ga direktno u partiju protiv tebe.\n\nMožeš da napraviš više linkova istovremeno — jedan za sestru, jedan za drugara iz škole, jedan za onoga iz Italije.",
      },
      {
        heading: "Zašto preko linka, a ne matchmaker",
        body: "Matchmaker te povezuje sa nepoznatim igračem sličnog rejtinga. To je dobro za sebe — ali kad hoćeš da igraš sa **specifičnom osobom**, link je brži i nije ti potreban njihov username. Pošalješ link, igrate, gotovo.",
      },
    ],
    faq: [
      { q: "Mora li moj prijatelj da se registruje?", a: "Ne. Klikne link, izabere ime gosta, i partija počinje." },
      { q: "Da li link ističe?", a: "Link je aktivan 24h. Posle možeš napraviti novi." },
      { q: "Mogu li da igram sa nekim iz druge države?", a: "Da. Link radi gde god ima interneta." },
    ],
    internalLinks: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Šah bez registracije", href: "/sr/sah-bez-registracije" },
    ],
  },

  "sah-bez-registracije": {
    path: "/sr/sah-bez-registracije",
    lang: "sr",
    title: "Šah bez registracije — Igraj odmah, 1 klik | MasterChess",
    description: "Igraj šah online bez registracije. Nema email-a, nema lozinke, nema gate-a. Klikni i počni partiju za 5 sekundi. Besplatno na MasterChess-u.",
    eyebrow: "0 koraka · Gost mod",
    h1: "Šah bez registracije — 1 klik i igraš",
    intro: "Mnogi sajtovi te teraju da napraviš nalog pre nego što odigraš prvu partiju. MasterChess ne. Klikni 'Igraj kao gost' i za 5 sekundi si u partiji.",
    hreflang: [en("/chess-no-signup"), sr("/sr/sah-bez-registracije")],
    primaryCta: { label: "Igraj kao gost", href: "/play-guest" },
    secondaryCta: { label: "Saznaj više", href: "/sr/sah-online" },
    bullets: [
      "Bez email-a, lozinke, OTP-a",
      "Bez verifikacije telefona",
      "Bez aplikacije — direktno u pretraživaču",
      "Tvoji podaci se ne čuvaju",
      "Možeš se kasnije registrovati ako želiš ELO",
      "Funkcioniše na svakom uređaju",
    ],
    sections: [
      {
        heading: "Šta gubiš ako ne napraviš nalog",
        body: "Bez naloga ne pratiš trajno ELO rejting i istoriju partija. To je sve. Igra, review, igra protiv prijatelja preko linka, igra protiv kompjutera — sve radi kao gost.",
      },
      {
        heading: "Kad treba da se registruješ",
        body: "Ako želiš da pratiš svoj ELO kroz vreme, učestvuješ u turnirima, ili prikupljaš coins za nagrade — registracija je jednim klikom preko Google naloga. Bez email verifikacije.",
      },
    ],
    internalLinks: [
      { label: "Šah online besplatno", href: "/sr/sah-online" },
      { label: "Šah protiv prijatelja", href: "/sr/sah-protiv-prijatelja" },
    ],
  },

  "sah-protiv-kompjutera": {
    path: "/sr/sah-protiv-kompjutera",
    lang: "sr",
    title: "Šah protiv kompjutera (9 nivoa, 400-2000 ELO) — MasterChess",
    description: "Igraj šah protiv kompjutera na 9 različitih nivoa težine — od 400 do 2000 ELO. Svaki bot ima jedinstven stil. Besplatno, bez reklama na MasterChess-u.",
    eyebrow: "9 botova · 400-2000 ELO",
    h1: "Šah protiv kompjutera — 9 nivoa",
    intro: "Devet šahovskih botova sa jedinstvenim ličnostima i stilovima igre. Od 400 ELO (početnik) do 2000 ELO (kandidat za majstora). Biraš nivo, stil, i igraš.",
    primaryCta: { label: "Izaberi bota", href: "/play" },
    secondaryCta: { label: "Igraj online", href: "/play/online" },
    bullets: [
      "9 različitih botova",
      "Raspon 400-2000 ELO",
      "Svaki ima unikatan stil",
      "Stockfish engine pozadi",
      "Coaching mod uključen",
      "Besplatno — bez limita",
    ],
    sections: [
      {
        heading: "Zašto ne 'jedan jak kompjuter'",
        body: "Igrati protiv jednog jakog engine-a (kao Stockfish na max) je dosadno i frustrirajuće — izgubićeš svaku partiju za 20 poteza. Devet botova sa različitim ličnostima daje **stvarno iskustvo** — svaki bot ima slabosti, blunder rate, i karakter koji možeš da iskoristiš.",
      },
      {
        heading: "Kako da pobediš",
        body: "Svaki bot ima svoju 'How to beat' stranicu sa konkretnim savetima — koja otvaranja ne voli, gde tipično blunduje, koje formacije rušiti. Ne učiš samo da igraš protiv bota — učiš o sopstvenoj igri.",
      },
    ],
    internalLinks: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
    ],
  },

  "sah-za-pocetnike": {
    path: "/sr/sah-za-pocetnike",
    lang: "sr",
    title: "Šah za početnike — Nauči pravila i strategiju | MasterChess",
    description: "Nauči šah od nule. Pravila, otvaranja, taktike i strategija — sve na srpskom, besplatno. Interaktivne lekcije i šahovske zagonetke na MasterChess-u.",
    eyebrow: "Od nule · 5 min do prve partije",
    h1: "Šah za početnike — naučite za 5 minuta",
    intro: "Ako nikada nisi igrao, ovde počinješ. Pravila figura, osnovna otvaranja, kako da matiraš protivnika — sve objašnjeno jednostavno, sa interaktivnim primerima.",
    primaryCta: { label: "Počni lekcije", href: "/learn" },
    secondaryCta: { label: "Igraj protiv lakog bota", href: "/play" },
    bullets: [
      "Naučiš pravila za 5 min",
      "Interaktivni primeri (klikneš figuru, vidiš poteze)",
      "Lekcije podeljene po nivoima",
      "Šahovske zagonetke svaki dan",
      "Igra protiv najslabijeg bota (400 ELO)",
      "Sve besplatno, bez reklama",
    ],
    sections: [
      {
        heading: "Šta naučiš prvog dana",
        body: "Kako se kreće svaka figura, šta je šah a šta mat, kako se ide na rokadu, en passant, promocija pešaka. Sve sa interaktivnim šahovskim tabama na kojima vežbaš odmah.",
      },
      {
        heading: "Šta posle pravila",
        body: "Osnovna otvaranja (Italijanska, Španska, Caro-Kann), 5 najvažnijih taktičkih obrazaca (vilice, šis, otvoreni napad), i kako da matiraš sa kraljem i topom protiv golog kralja.",
      },
    ],
    internalLinks: [
      { label: "Pravila šaha", href: "/sr/sah-pravila" },
      { label: "Najbolja otvaranja", href: "/sr/sah-otvaranja" },
      { label: "Šah protiv kompjutera", href: "/sr/sah-protiv-kompjutera" },
    ],
  },

  "sah-pravila": {
    path: "/sr/sah-pravila",
    lang: "sr",
    title: "Pravila šaha — Kompletan vodič na srpskom | MasterChess",
    description: "Sva pravila šaha objašnjena jednostavno: kako se kreće svaka figura, rokada, en passant, promocija pešaka, pat, mat. Sa interaktivnim primerima.",
    eyebrow: "Vodič · Sva pravila",
    h1: "Pravila šaha",
    intro: "Šah ima jednostavna pravila — naučiš ih za 10 minuta. Ovde imaš sve, od osnovnog kretanja figura do specijalnih poteza kao što su rokada i en passant.",
    primaryCta: { label: "Vežbaj pravila", href: "/learn" },
    secondaryCta: { label: "Igraj odmah", href: "/play" },
    bullets: [
      "Kretanje svih 6 figura",
      "Rokada (mala i velika)",
      "En passant — sa primerom",
      "Promocija pešaka",
      "Šah, mat, pat — razlika",
      "Pravila o vremenu i remiju",
    ],
    sections: [
      {
        heading: "Šahovska tabla i početna pozicija",
        body: "Tabla ima 64 polja, 8x8, naizmenično bela i crna. Beli uvek prvi vuče. Svaki igrač počinje sa 16 figura: 8 pešaka, 2 topa, 2 lovca, 2 konja, 1 dama, 1 kralj.",
      },
      {
        heading: "Cilj igre",
        body: "Cilj je da matiraš protivničkog kralja — to znači da je njegov kralj napadnut a nema načina da se brani. Tada je partija gotova i ti si pobednik.\n\nPartija može da završi i remijem: pat (kralj nije napadnut ali nema legalan potez), ponavljanje pozicije 3 puta, ili 50 poteza bez uzimanja figure.",
      },
      {
        heading: "Kretanje figura",
        body: "Pešak — napred jedno polje, dva sa početne pozicije. Uzima dijagonalno.\n\nTop — pravolinijski, koliko god polja.\n\nLovac — dijagonalno, koliko god polja.\n\nDama — kombinuje topa i lovca, najmoćnija figura.\n\nKonj — u obliku slova 'L', preskače figure.\n\nKralj — jedno polje u bilo kom pravcu.",
      },
    ],
    internalLinks: [
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
      { label: "Otvaranja", href: "/sr/sah-otvaranja" },
    ],
  },

  "sah-otvaranja": {
    path: "/sr/sah-otvaranja",
    lang: "sr",
    title: "Najbolja šahovska otvaranja — Vodič i trener | MasterChess",
    description: "Italijanska, Španska, Caro-Kann, Sicilijanska — najpopularnija šahovska otvaranja sa objašnjenjima, zamkama i interaktivnim trenerom na MasterChess-u.",
    eyebrow: "20+ otvaranja · Interaktivno",
    h1: "Najbolja šahovska otvaranja",
    intro: "Pravo otvaranje ti daje 10-20% prednosti pre nego što počneš da razmišljaš. Ovde imaš 20+ najpopularnijih, sa objašnjenjima ideja, glavnih varijanti i taktičkih zamki.",
    primaryCta: { label: "Otvori Opening Trainer", href: "/openings" },
    secondaryCta: { label: "Igraj odmah", href: "/play" },
    bullets: [
      "20+ glavnih otvaranja",
      "Italijanska, Španska, Caro-Kann, Sicilijanska...",
      "Glavne varijante objašnjene",
      "Najčešće taktičke zamke",
      "Interaktivni trener (klikneš potez)",
      "Statistika uspešnosti po nivou",
    ],
    sections: [
      {
        heading: "Otvaranja za bele",
        body: "Ako voliš agresivnu igru: Italijanska (1.e4 e5 2.Sf3 Sc6 3.Lc4) ili Škotska (1.e4 e5 2.Sf3 Sc6 3.d4). Za pozicione igrače: Engleska (1.c4) ili Damin gambit (1.d4 d5 2.c4).",
      },
      {
        heading: "Otvaranja za crne",
        body: "Protiv 1.e4: Caro-Kann (siguran), Sicilijanska (oštar), Francuska (pozicioni).\n\nProtiv 1.d4: Nimzo-Indijska, Slovenska, King's Indian.",
      },
    ],
    internalLinks: [
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
      { label: "Opening Explorer", href: "/openings" },
    ],
  },

  "sahovski-rejting": {
    path: "/sr/sahovski-rejting",
    lang: "sr",
    title: "Šahovski ELO rejting — Kalkulator i objašnjenje | MasterChess",
    description: "Kako funkcioniše ELO rejting u šahu, koliko poena dobiješ po pobedi, FIDE skala, i kalkulator za izračunavanje promene rejtinga.",
    eyebrow: "ELO · FIDE skala",
    h1: "Šahovski ELO rejting",
    intro: "ELO sistem rangira igrače po snazi. Početnik ima ~800, klupski igrač 1500, majstor 2200, velemajstor 2500+. Pobeđuješ jače = dobijaš više poena. Gubiš od slabijeg = gubiš više.",
    primaryCta: { label: "Otvori kalkulator", href: "/tools/rating-calculator" },
    secondaryCta: { label: "Vidi rang sistem", href: "/leaderboard" },
    bullets: [
      "Kako se računa ELO",
      "Koliko dobiješ po pobedi",
      "FIDE titule (CM, FM, IM, GM)",
      "K-faktor po nivou igrača",
      "Razlika ELO i Glicko sistema",
      "Trenutni najjači igrači sveta",
    ],
    sections: [
      {
        heading: "FIDE skala — šta znače brojevi",
        body: "Ispod 1200: početnik. 1200-1600: amater sa znanjem. 1600-2000: klupski igrač. 2000-2200: kandidat za majstora. 2200+: nacionalni majstor (NM/CM). 2400+: FIDE majstor (FM). 2500+: internacionalni majstor (IM). 2600+: velemajstor (GM).",
      },
      {
        heading: "Kako se računa promena",
        body: "Razlika u rejtingu između tebe i protivnika određuje očekivani rezultat. Ako pobediš jačeg, dobijaš mnogo poena. Ako pobediš slabijeg, dobijaš par poena. Ako izgubiš od jačeg, gubiš malo. Ako izgubiš od slabijeg — gubiš mnogo.",
      },
    ],
    internalLinks: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Šah otvaranja", href: "/sr/sah-otvaranja" },
    ],
  },
};
