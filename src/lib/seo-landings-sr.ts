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

  "sah-protiv-kompjutera-besplatno": {
    path: "/sr/sah-protiv-kompjutera-besplatno",
    lang: "sr",
    title: "Šah protiv kompjutera besplatno — 9 nivoa | MasterChess",
    description: "Igraj šah protiv kompjutera potpuno besplatno. 9 nivoa od 400 do 2000 ELO. Bez instalacije, bez reklama, radi u pretraživaču.",
    eyebrow: "Besplatno · 9 nivoa",
    h1: "Šah protiv kompjutera — besplatno, bez instalacije",
    intro: "Devet AI šahovskih botova, raspon 400-2000 ELO, svaki sa unikatnim stilom. Direktno u pretraživaču — bez aplikacije, bez registracije.",
    primaryCta: { label: "Igraj odmah", href: "/play" },
    secondaryCta: { label: "Igraj online", href: "/play/online" },
    bullets: [
      "Potpuno besplatno — bez limita partija",
      "9 različitih botova sa karakterom",
      "Stockfish engine pozadi",
      "Bez reklama, bez praćenja",
      "Radi offline kad je strana učitana",
      "Coaching mod i revija partija uključeni",
    ],
    sections: [
      { heading: "Kako da izabereš pravi nivo", body: "Početnik (do 1000 ELO): kreni od Marcusa (400). Amater (1000-1400): Sofia ili Viktor. Klupski igrač (1400-1800): Elena ili Magnus-bot. Iznad 1800: gornji botovi vežbaće te taktički." },
      { heading: "Šta dobiješ posle partije", body: "Reviju po potezima sa ručnom analizom (bez engine cheat-a), ELO simulaciju, i konkretne savete za svaki bot — gde tipično blunduje, koja otvaranja ne voli." },
    ],
    internalLinks: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
    ],
  },

  "sahovske-zagonetke": {
    path: "/sr/sahovske-zagonetke",
    lang: "sr",
    title: "Šahovske zagonetke — Dnevna zagonetka i 1000+ vežbi | MasterChess",
    description: "Reši dnevnu šahovsku zagonetku i vežbaj taktiku na hiljadama zadataka. Besplatno, bez reklama, podešavanje težine po tvom rejtingu.",
    eyebrow: "Dnevna zagonetka",
    h1: "Šahovske zagonetke — vežbaj taktiku",
    intro: "Najbrži način da napreduješ: 5 zagonetki dnevno. Taktički motivi (vilice, šis, otvoreni napad, žrtve), prilagođene tvom nivou.",
    primaryCta: { label: "Reši dnevnu zagonetku", href: "/daily-puzzle" },
    secondaryCta: { label: "Sve zagonetke", href: "/puzzles" },
    bullets: [
      "Dnevna zagonetka svaki dan u 00:00",
      "Težina se podešava po tvom rejtingu",
      "Pokrivamo sve taktičke motive",
      "Bez reklama i bez paywalla",
      "Tvoj streak se prati i nagrađuje",
      "Mobilno i desktop optimizovano",
    ],
    sections: [
      { heading: "Zašto zagonetke ubrzavaju napredak", body: "Studije pokazuju da 15 minuta taktičkih zagonetki dnevno donose više ELO poena za mesec dana nego 1 sat igre. Razlog: zagonetke izoluju obrazac koji se ponavlja u realnim partijama." },
      { heading: "Šta sve dobijaš", body: "Po rešavanju vidiš obrazloženje rešenja, alternativne pokušaje, i obeležavanje tvojih najslabijih motiva da bi vežbao više njih." },
    ],
    internalLinks: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Šahovska strategija", href: "/sr/sahovska-strategija" },
    ],
  },

  "sah-turniri-online": {
    path: "/sr/sah-turniri-online",
    lang: "sr",
    title: "Online šah turniri — Besplatno, dnevno | MasterChess",
    description: "Učestvuj u besplatnim online šah turnirima — Arena i Swiss formati, svaki dan, sa nagradama i lestvicom. Bez kotizacije.",
    eyebrow: "Besplatno · Dnevno",
    h1: "Online šah turniri",
    intro: "Arena turniri (5-30 min) i Swiss turniri (1-3h) se održavaju svakog dana. Bez kotizacije, automatsko pariranje, ELO promene u realnom vremenu.",
    primaryCta: { label: "Vidi sve turnire", href: "/tournaments" },
    secondaryCta: { label: "Igraj odmah", href: "/play/online" },
    bullets: [
      "Besplatni dnevni turniri",
      "Arena i Swiss formati",
      "Automatsko pariranje (Swiss algoritam)",
      "Live lestvica tokom turnira",
      "Posebni titularni turniri vikendom",
      "Pridruži se i kao gost",
    ],
    sections: [
      { heading: "Razlika Arena vs Swiss", body: "Arena je vremenski ograničen — igraš što više partija u 15-30 min, najviše bodova pobeđuje. Swiss je sa fiksnim brojem kola (3-7), parira te sa igračima istog skora." },
      { heading: "Kako se pridružuješ", body: "Klikni turnir, pridruži se, sačekaj start. Sistem automatski pariraje, otvori sledeću partiju, broji rezultate. Bez ručnog rada." },
    ],
    internalLinks: [
      { label: "Šah online", href: "/sr/sah-online" },
      { label: "Battle Royale", href: "/battle-royale" },
    ],
  },

  "kako-igrati-sah": {
    path: "/sr/kako-igrati-sah",
    lang: "sr",
    title: "Kako igrati šah — Vodič od 0 do prve pobede | MasterChess",
    description: "Detaljan vodič kako igrati šah — postavljanje table, kretanje figura, osnovne strategije, kako matirati. Sve na srpskom, besplatno.",
    eyebrow: "Od 0 · 15 min",
    h1: "Kako igrati šah",
    intro: "Za 15 minuta naučićeš sve što ti treba za prvu pobedu. Postavljanje table, kretanje svih 6 figura, kako matirati, i prvih 5 saveta za otvaranje.",
    primaryCta: { label: "Počni interaktivne lekcije", href: "/learn" },
    secondaryCta: { label: "Igraj sa botom (400 ELO)", href: "/play" },
    bullets: [
      "Postavljanje šahovske table",
      "Kretanje svih 6 figura sa primerima",
      "Cilj igre — šah, mat, pat",
      "Specijalni potezi (rokada, en passant)",
      "5 saveta za prvi potez",
      "Interaktivne vežbe odmah",
    ],
    sections: [
      { heading: "Korak 1 — Postavi tablu", body: "Tabla se postavlja tako da je belo polje u desnom donjem uglu (\"white on right\"). U prvom redu od levo: top, konj, lovac, dama, kralj, lovac, konj, top. Drugi red: pešaci. Dama ide na svoju boju (bela na belo polje, crna na crno)." },
      { heading: "Korak 2 — Beli vuče prvi", body: "Beli uvek prvi vuče. Najpopularniji prvi potezi: 1.e4 (otvara dijagonale) ili 1.d4 (zauzima centar)." },
      { heading: "Korak 3 — Cilj je mat", body: "Mat = napadnut protivnički kralj nema načina da pobegne. Ne uzimaš kralja — samo ga staviš u poziciju iz koje ne može da pobegne." },
    ],
    internalLinks: [
      { label: "Pravila šaha", href: "/sr/sah-pravila" },
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
      { label: "Šahovska tabla", href: "/sr/sahovska-tabla" },
    ],
  },

  "sahovska-tabla": {
    path: "/sr/sahovska-tabla",
    lang: "sr",
    title: "Šahovska tabla — Postavljanje i pravila | MasterChess",
    description: "Kako pravilno postaviti šahovsku tablu, koordinate polja, algebarska notacija. Sve sa primerima i interaktivnim tablama.",
    eyebrow: "Vodič · Tabla",
    h1: "Šahovska tabla — sve što treba da znaš",
    intro: "Tabla ima 64 polja, 8x8, naizmenično bela i crna. Kolone (a-h) i redovi (1-8) čine koordinate svakog polja.",
    primaryCta: { label: "Vežbaj na tabli", href: "/learn" },
    secondaryCta: { label: "Igraj odmah", href: "/play" },
    bullets: [
      "64 polja — 32 bela i 32 crna",
      "Belo polje u desnom donjem uglu",
      "Kolone: a, b, c, d, e, f, g, h",
      "Redovi: 1, 2, 3, 4, 5, 6, 7, 8",
      "Algebarska notacija — npr. e4, Sf3",
      "Tabla je ista za oba igrača vizuelno",
    ],
    sections: [
      { heading: "Postavljanje figura", body: "Prva (osma) linija: top na uglovima, zatim konj, lovac, dama, kralj, lovac, konj, top. Dama uvek ide na svoju boju (bela na d1, crna na d8). Pešaci popunjavaju drugu i sedmu liniju." },
      { heading: "Algebarska notacija", body: "Svako polje ima ime: kombinacija slova (kolona) i broja (red). Pešak na e4 znači pešak na koloni e, redu 4. Skraćenice: K=kralj, D=dama, T=top, L=lovac, S=konj." },
    ],
    internalLinks: [
      { label: "Pravila šaha", href: "/sr/sah-pravila" },
      { label: "Šahovske figure", href: "/sr/sahovske-figure" },
    ],
  },

  "sahovske-figure": {
    path: "/sr/sahovske-figure",
    lang: "sr",
    title: "Šahovske figure — Kretanje i vrednost | MasterChess",
    description: "Kako se kreće svaka šahovska figura: pešak, top, konj, lovac, dama, kralj. Vrednost figura i taktički saveti na srpskom.",
    eyebrow: "6 figura · Sa primerima",
    h1: "Šahovske figure — sve o kretanju",
    intro: "Svaka figura ima jedinstven način kretanja i različitu vrednost. Razumeti ovo je osnova svake šahovske strategije.",
    primaryCta: { label: "Vežbaj kretanje", href: "/learn" },
    secondaryCta: { label: "Vrednost figura", href: "/piece-values" },
    bullets: [
      "Pešak (1 poen) — napred, uzima dijagonalno",
      "Konj (3 poena) — slovo L, preskače",
      "Lovac (3 poena) — dijagonalno",
      "Top (5 poena) — pravolinijski",
      "Dama (9 poena) — top + lovac",
      "Kralj (∞) — jedno polje u svakom pravcu",
    ],
    sections: [
      { heading: "Vrednost figura nije pravilo — orijentir je", body: "Konj može da vredi više od lovca u zatvorenoj poziciji. Top je jači od konja u krajnjici. Dama gubi vrednost kad nema otvorenih linija. Brojevi su starting point, ne presuda." },
      { heading: "Specijalna pravila", body: "Pešak: dva polja sa starta, en passant, promocija. Kralj: rokada (mala/velika), nikad ne prelazi u napadnuto polje. Top i kralj: rokada radi samo ako se nijedan nije pomerio." },
    ],
    internalLinks: [
      { label: "Pravila šaha", href: "/sr/sah-pravila" },
      { label: "Vrednost figura", href: "/piece-values" },
    ],
  },

  "sah-za-decu": {
    path: "/sr/sah-za-decu",
    lang: "sr",
    title: "Šah za decu — Lake lekcije i bezbedna igra | MasterChess",
    description: "Šah za decu od 5 godina naviše. Lake interaktivne lekcije, prijateljski botovi (400 ELO), bez chat-a, bez reklama, bezbedno za najmlađe.",
    eyebrow: "Od 5 godina · Bezbedno",
    h1: "Šah za decu",
    intro: "Šah razvija logiku, koncentraciju i strpljenje. MasterChess za decu nudi lake lekcije, najslabijeg bota za prve partije, i okruženje bez reklama i bez chat-a sa nepoznatima.",
    primaryCta: { label: "Počni lekcije za decu", href: "/learn" },
    secondaryCta: { label: "Igraj sa lakim botom", href: "/bot/marcus" },
    bullets: [
      "Lekcije sa slikama i animacijama",
      "Bot na 400 ELO (perfektan za prve partije)",
      "Bez chat-a sa nepoznatima",
      "Bez reklama i in-app purchase-a",
      "Daily puzzle prilagođen po nivou",
      "Bezbedno za uzrast 5+",
    ],
    sections: [
      { heading: "Zašto šah za decu", body: "Šah uči dete strpljenju, planiranju unapred, i prihvatanju gubitka kao dela učenja. Studije pokazuju vezu sa boljim ocenama iz matematike i jezika." },
      { heading: "Kako početi sa detetom", body: "1. Nauči ga pravila preko interaktivnih lekcija (15 min). 2. Pustite ga da odigra prvu partiju sa Marcus-om (400 ELO). 3. Posle svake partije pogledajte gde je napravio grešku — bez kritike, samo \"vidi šta je bot uradio\"." },
    ],
    internalLinks: [
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
      { label: "Pravila šaha", href: "/sr/sah-pravila" },
    ],
  },

  "najbolje-sahovsko-otvaranje": {
    path: "/sr/najbolje-sahovsko-otvaranje",
    lang: "sr",
    title: "Najbolje šahovsko otvaranje za početnike | MasterChess",
    description: "Koje šahovsko otvaranje je najbolje za početnika? Italijanska igra. Evo zašto, sa konkretnim potezima i zamkama.",
    eyebrow: "Za početnike",
    h1: "Najbolje šahovsko otvaranje za početnike",
    intro: "Italijanska igra (1.e4 e5 2.Sf3 Sc6 3.Lc4) je najbolji izbor — razvija figure brzo, kontroliše centar, ima jasan plan, i ne zahteva pamćenje teorije.",
    primaryCta: { label: "Vežbaj Italijansku igru", href: "/openings/italian-game" },
    secondaryCta: { label: "Sva otvaranja", href: "/openings" },
    bullets: [
      "Lako za pamćenje (3 poteza)",
      "Razvija konje i lovce odmah",
      "Cilja slabu tačku f7",
      "Vodi u jasne planove",
      "Funkcioniše do 1800 ELO",
      "Mnogo taktičkih prilika",
    ],
    sections: [
      { heading: "Glavna linija", body: "1.e4 e5 2.Sf3 Sc6 3.Lc4. Sada beli prati: O-O, d3, Sc3, i napada f7 sa Sg5 ako se ukaže prilika. Crni odgovara sa Lc5 ili Sf6." },
      { heading: "Kad ne raditi Italijansku", body: "Ako je protivnik iznad 2000 ELO i očekuje teoriju — preći ćeš u poznate linije gde je tvoj nedostatak teorije problem. Ali do 1800 ELO — savršena za sve nivoe." },
    ],
    internalLinks: [
      { label: "Šahovska otvaranja", href: "/sr/sah-otvaranja" },
      { label: "Italijanska igra", href: "/openings/italian-game" },
    ],
  },

  "kraljev-gambit": {
    path: "/sr/kraljev-gambit",
    lang: "sr",
    title: "Kraljev gambit — Najagresivnije otvaranje | MasterChess",
    description: "Kraljev gambit (1.e4 e5 2.f4) — najagresivnije šahovsko otvaranje. Glavne varijante, zamke, kako braniti kao crni.",
    eyebrow: "Agresivno · ECO C30-C39",
    h1: "Kraljev gambit (1.e4 e5 2.f4)",
    intro: "Kraljev gambit žrtvuje pešaka za brz razvoj i otvorene linije ka crnom kralju. Klasika 19. veka — još uvek opasna ako protivnik ne zna teoriju.",
    primaryCta: { label: "Vežbaj Kraljev gambit", href: "/openings/kings-gambit" },
    secondaryCta: { label: "Sva otvaranja", href: "/openings" },
    bullets: [
      "Žrtva pešaka za inicijativu",
      "Otvorene linije ka crnom kralju",
      "Tipično vodi u taktičku partiju",
      "Idealno protiv defanzivnih igrača",
      "Glavne varijante: prihvaćen i odbijen",
      "Klasika od 1561. godine",
    ],
    sections: [
      { heading: "Prihvaćen Kraljev gambit", body: "Posle 2...exf4 beli igra 3.Sf3 i priprema d4. Klasične linije: Kieseritzky (3...g5 4.h4 g4 5.Se5) i Muzio gambit (3...g5 4.Lc4 g4 5.O-O — žrtva konja!)." },
      { heading: "Odbijen Kraljev gambit", body: "Crni igra 2...Lc5 ili 2...d6, ne uzima pešaka. Beli i dalje ima inicijativu, ali nije gambit u pravom smislu." },
    ],
    internalLinks: [
      { label: "Šahovska otvaranja", href: "/sr/sah-otvaranja" },
      { label: "Najbolja otvaranja za početnike", href: "/sr/najbolje-sahovsko-otvaranje" },
    ],
  },

  "sicilijanska-odbrana": {
    path: "/sr/sicilijanska-odbrana",
    lang: "sr",
    title: "Sicilijanska odbrana — Najpopularnije crnino otvaranje | MasterChess",
    description: "Sicilijanska odbrana (1.e4 c5) — najuspešnije crnino otvaranje na vrhunskom nivou. Najdorf, Drakon, Sveshnikov varijante.",
    eyebrow: "Za crnog · ECO B20-B99",
    h1: "Sicilijanska odbrana (1.e4 c5)",
    intro: "Najčešće crnino otvaranje na svim nivoima. Daje neuravnoteženu igru gde crni traži pobedu, ne samo remi. Najdorf, Drakon i Sveshnikov su glavne varijante.",
    primaryCta: { label: "Vežbaj Sicilijansku", href: "/openings/sicilian-defense" },
    secondaryCta: { label: "Sva otvaranja", href: "/openings" },
    bullets: [
      "Najuspešnija crna odbrana na 1.e4",
      "Asimetrična pozicija = igra za pobedu",
      "Najdorf — varijanta velikih majstora",
      "Drakon — najagresivnija crna linija",
      "Sveshnikov — moderna i popularna",
      "Otvoreni i zatvoreni sistemi",
    ],
    sections: [
      { heading: "Glavne varijante", body: "Najdorf (5...a6) — najtemeljitije proučena, igraju je Carlsen, Fischer, Kasparov. Drakon (5...g6) — agresivni napadi sa obe strane. Sveshnikov (5...e5) — moderna, popularna od 1990-ih." },
      { heading: "Šta beli igra protiv", body: "Otvoreni Sicilijanac: 2.Sf3 i 3.d4 — vodi u kompleksne varijante. Zatvoreni: 2.Sc3 — manje teorije, više pozicione igre. Alapin (2.c3) — siguran sistem za belog." },
    ],
    internalLinks: [
      { label: "Šahovska otvaranja", href: "/sr/sah-otvaranja" },
      { label: "Kraljev gambit", href: "/sr/kraljev-gambit" },
    ],
  },

  "sahovska-strategija": {
    path: "/sr/sahovska-strategija",
    lang: "sr",
    title: "Šahovska strategija — 7 principa za bolji šah | MasterChess",
    description: "Sedam ključnih principa šahovske strategije: razvoj, centar, sigurnost kralja, struktura pešaka, slabe i jake tačke, planiranje.",
    eyebrow: "7 principa · Strategija",
    h1: "Šahovska strategija — 7 principa",
    intro: "Taktika je 99% šaha do 1800 ELO. Ali ovih 7 strateških principa ti daju put kroz svaku poziciju gde nema očiglednog poteza.",
    primaryCta: { label: "Vežbaj strategiju", href: "/training" },
    secondaryCta: { label: "Reši zagonetke", href: "/puzzles" },
    bullets: [
      "1. Brz razvoj figura",
      "2. Kontrola centra",
      "3. Sigurnost kralja (rokada brzo)",
      "4. Struktura pešaka",
      "5. Slabe i jake polja",
      "6. Aktivna dama, ali ne prerano",
      "7. Plan — ne samo potez po potez",
    ],
    sections: [
      { heading: "Princip 1-3: otvaranje", body: "U prvih 10 poteza: razvij sve lake figure (konje pre lovaca), kontroliši centar (e4, d4, e5, d5), i rokiraj. Bez ovog — gubiš pre nego što shvatiš." },
      { heading: "Princip 4-7: sredina partije", body: "Tvoja pešačka struktura određuje plan. Slaba polja (gde pešak ne može da dođe) su za tvoje figure. Plan: igraj na strani gde imaš više prostora i bolju strukturu." },
    ],
    internalLinks: [
      { label: "Šahovske zagonetke", href: "/sr/sahovske-zagonetke" },
      { label: "Šah za početnike", href: "/sr/sah-za-pocetnike" },
    ],
  },

  "sah-mat-u-3-poteza": {
    path: "/sr/sah-mat-u-3-poteza",
    lang: "sr",
    title: "Šah mat u 3 poteza — Sve varijante | MasterChess",
    description: "Sve poznate varijante šah mata u 3 poteza: Scholar's mate, brzi matovi protiv slabe odbrane, kako ih napraviti i kako se braniti.",
    eyebrow: "Brzi matovi",
    h1: "Šah mat u 3 poteza",
    intro: "Mat u 3 (ili 4) poteza je moguć samo protiv vrlo slabe odbrane. Ovde imaš najpoznatije linije, kako ih napraviti, i — važnije — kako se braniti od njih.",
    primaryCta: { label: "Reši mat zagonetke", href: "/puzzles" },
    secondaryCta: { label: "Igraj odmah", href: "/play" },
    bullets: [
      "Fool's mate — 2 poteza (najbrži)",
      "Scholar's mate — 4 poteza (najpoznatiji)",
      "Légal's mate — žrtva dame",
      "Kako ih napraviti",
      "Kako se braniti (1 ključan potez)",
      "Zašto ne raditi protiv jakih igrača",
    ],
    sections: [
      { heading: "Scholar's mate (4 poteza)", body: "1.e4 e5 2.Lc4 Sc6 3.Dh5 Sf6?? 4.Dxf7# — dama uzima pešaka f7 i daje mat. Crna odbrana: posle 3.Dh5 igraj 3...g6 (terajući damu) ili 3...De7." },
      { heading: "Zašto ne računati na brzi mat", body: "Svaki igrač iznad 800 ELO zna odbranu od Scholar's mate-a. Ako pokušaš protiv jačeg, gubiš tempo i poziciju. Brzi mat je za zabavu protiv kompletnog početnika — ne kao strategija." },
    ],
    internalLinks: [
      { label: "Šahovska strategija", href: "/sr/sahovska-strategija" },
      { label: "Šahovske zagonetke", href: "/sr/sahovske-zagonetke" },
    ],
  },
};

