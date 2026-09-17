# Popravka svih botova i Nikola izazova

## Cilj
Omogućiti da se iz igre jasno izabere bilo koji bot, uključujući Nikolu, i da izabrani bot pouzdano odigra odgovor.

## Koraci
- Dovršiti prekinutu izmenu birača botova i ukloniti trenutne greške stranice.
- Povezati izbor bota sa ekranom igre, nivoom jačine i pokretanjem nove partije.
- Sačuvati direktan Nikola link i proveriti da on zaista bira Nikola profil.
- Ukloniti duple mobilne kontrole ako se potvrde na ekranu.
- Testirati na telefonu: izbor Nikole, početak partije, potez igrača i odgovor bota.
- Proveriti stanje Lovable Cloud-a odvojeno; nalozi i online igra zavise od njega, bot partije ne.

## Tehnički detalji
- `GameControls` dobija eksplicitne podatke i callback za izabranog bota.
- `Play` ostaje jedini vlasnik aktivnog profila i resetuje partiju pri promeni protivnika.
- Provera obuhvata TypeScript/build signal i Playwright tok na mobilnom prikazu.
