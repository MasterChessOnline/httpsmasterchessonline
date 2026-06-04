## Cilj
Maksimalno povećati atraktivnost MasterChess sajta (mobile + desktop) i pretvoriti posetioca u registrovanog igrača. Ovo je menu ideja — biraš šta gradimo.

---

## A · Mobilni "wow" faktor (prvih 3 sekunde)

1. **Animirana 3D figura na ulazu** — kralj se spušta sa parallax efektom, prati prst (gyroscope). Maksimalan cinematic dojam pre nego što vide bilo šta.
2. **Haptic feedback** na svakom tap-u (Vibration API) — daje "premium" osećaj.
3. **Native share API dugme** — "Share MasterChess" generiše board sliku sa logom.
4. **Pull-to-refresh = New Daily Quote** od velikih GM-ova (Carlsen, Kasparov citati) sa animacijom.
5. **Skeleton + shimmer loaders** umesto praznih ekrana — uvek nešto se kreće.
6. **"Tap-to-play"** mini board widget na svakoj public stranici — odigraš jedan potez i hookuje te.

## B · Desktop "premium" detalji

7. **Custom cursor sa shadow trail** na hero sekcijama (već imamo CursorGlow, proširiti).
8. **Spatial audio** — tihi ambient (drveni sat, šum sobe) na desktopu, mute toggle.
9. **Keyboard shortcut overlay** (Cmd+/) — pokazuje sve shortcut-ove, "power user" feeling.
10. **Cinematic intro video** (5s autoplay loop) na hero-u — pravi šahisti igraju, slow motion.
11. **Picture-in-Picture mode** — možeš gledati live partiju u floating prozoru dok skroluješ.
12. **Multi-tab sync** — ako gledaš na laptopu, mobilni te notifikuje o potezu.

## C · Konverzija (visitor → signup)

13. **"Rate Your Style" kviz** (4 pitanja) → daje ti personality badge + traži signup da ga sačuvaš.
14. **Free Daily Lesson** vidljiv na home-u, full unlock posle 1. korak (signup).
15. **"Spectate Now"** ulaz — gledaš live partiju bez prijave 60s, pa overlay "Sign up to keep watching".
16. **Magic link login** (passwordless) — samo email, klikneš link → ulogovan. Manje frikcije od šifre.
17. **Apple/Discord login** pored Google-a — IG publika često ima više Apple ID.
18. **Time-limited offer banner** — "First 1,000 IG signups dobijaju Founder badge" sa real countdown brojem mesta.
19. **Referral leaderboard** — najveći donosioci registracija dobijaju title + 5000 coina mesečno.
20. **Onboarding gamified** — 5 koraka, svaki = +50 coina (pick avatar, pick board, play 1 move, follow 1 user, claim daily reward).

## D · Viral & social loop

21. **Auto-generated "Game of the Day" slika** sa player handle-om → IG-ready 1080×1080 sa downloadom.
22. **"Beat me" challenge link** — generiše custom link kao "Nikola izaziva tebe na 5+3", deli na IG story.
23. **Streak share na IG Story** — kad imaš 7-day streak, jedan tap = export u IG story sa template-om.
24. **Instagram Reels generator** — 15s replay tvoje najbolje partije sa muzikom (eksperimentalno).
25. **TikTok-style "For You" feed** za šah snippet-ove — 10s klipove od DailyChess_12 + community.
26. **"Send a chess card"** — Valentine/birthday cards sa šah pozicijom umesto teksta.

## E · Engagement & retention

27. **Daily Mystery Box** — uđeš svaki dan, klikneš box, dobiješ random reward. Stvara naviku.
28. **Weekly Challenge League** — sedmodnevni stub-leaderboard sa rewardom za top 10.
29. **"Comeback Bonus"** — ako se vratiš posle 3 dana, double XP 24h.
30. **Achievements showcase** na profilu — animirane medalje, share-able.
31. **AI Coach komentar** (samo posle partije, ne tokom) — "Tvoja igra najliči na Tal-a u 1965."
32. **Smart push notifications** — "Tvoj rival baš se ulogovao, baci mu rematch!"
33. **Friend streak** — ti i prijatelj igrate svaki dan, gradite zajednički streak.

## F · Trust & autoritet

34. **"As seen on" traka** — IG handle, YouTube channel views, broj korisnika.
35. **Live user counter** u footeru ("12 igrača iz tvog grada online sada") — već imamo LiveSocialProof, proširiti.
36. **Testimonijal video carousel** — kratki klipovi pravih korisnika.
37. **GM endorsement** — ako uspeš da nabaviš jednog (čak i lokalnog majstora), ogromno.
38. **Press Kit / Media stranica** sa logima medija ako te neko spomene.
39. **Public Transparency Report** — broj partija, broj korisnika, anti-cheat statistika.

## G · UX poliranje (lako, velik impact)

40. **Empty states sa pozivom na akciju** — nigde "nema podataka", uvek "još ne, klikni ovde".
41. **Toast animacije** — coin earned animacija kao u Duolingo.
42. **Confetti** na svakoj pobedi (canvas-confetti library, lagan).
43. **Sound on/off toggle** sa nostalgičnim chess clock zvukom.
44. **Dark/Light mode + Auto** — automatski po vremenu dana.
45. **Reduce motion** opcija (accessibility) — već imamo, prikaži je vidljivo.
46. **Onboarding "tour"** — Shepherd.js style, 4 koraka po sajtu.

## H · SEO & traffic (drugi izvori prijava, ne samo IG)

47. **Public profile pages za sve igrače** — `/u/username` indeksirano u Google.
48. **Live game permalink-ovi** koji se mogu deliti — generiše OG image preview.
49. **Blog sa SEO postovima** — "How to beat 1500 ELO", "Best chess openings 2026" → organski traffic.
50. **Sitemap + JSON-LD** za sve dinamičke rute.
51. **Lokalizacija** — prevod na srpski/hrvatski/bosanski (lokalna IG publika).
52. **YouTube embed-ovi** DailyChess_12 partija na blog postove → SEO + retention.

## I · Konkretni "queek win"-ovi (mogu sad)

Top 8 koje preporučujem da prvo gradimo, redom:

1. **Magic link login** (#16) — najveći konverzija boost, najmanje koda
2. **Onboarding gamified 5 koraka** (#20) — pretvara signup u igru
3. **"Beat me" challenge link** (#22) — viralna petlja iz IG-a
4. **Rate Your Style kviz** (#13) — hook za znatiželjne
5. **Confetti + coin animacije** (#41, #42) — instant "feels premium"
6. **Daily Mystery Box** (#27) — pretvara svakog korisnika u dnevno aktivnog
7. **Comeback bonus** (#29) — vraća izgubljene
8. **Friend streak** (#33) — zaključava 2 korisnika zajedno

---

## Šta želiš?
Reci jedno od:
- **"Sve iz I sekcije"** → gradim svih 8 jedno za drugim
- **"Top 3 brzo"** → samo magic link + onboarding + beat me link
- **"Faza po faza, kreni od X"** → biraš sa liste 1–52
- Ili svojim rečima šta ti zvuči najbolje
