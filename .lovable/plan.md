# Plan: Popraviti sve u Online Play sistemu

Cilj: svako dugme radi, bez bugova, sa zvukovima i smooth UX-om.

## 1. Resign (instant, bez laga)
- Optimistic UI: odmah lock board + overlay "You Lost"
- `endingRef` guard protiv duplog klika (već postoji — verifikovati)
- RPC `finalize_online_game` + direct UPDATE fallback
- Loading state na dugmetu ("Resigning…") + disabled
- Trigger `playGameOverSound()` + `triggerHaptic("loss")` lokalno
- Protivnik dobija realtime event → "You Won" overlay + `playVictoryMelody()`

## 2. Draw offers
- Klik "Offer Draw" → poziv `offer_draw` RPC
- Toast "Draw offered" + dugme menja state na "Offered…" 30s cooldown
- Protivnik vidi modal "Opponent offers draw" sa Accept/Decline + `playChessSound("notify")`
- Accept → `respond_draw_offer(true)` → oba igrača overlay "STALEMATE" + `playDrawMelody()`
- Decline → toast both sides, board ostaje aktivan
- Auto-expire posle 60s

## 3. Timeout
- Klijent koji vidi clock=0 zove `commit_online_move` sa `result` i `end_reason='time'` (ili novi RPC `claim_timeout`)
- Overlay "TIME OUT" + odgovarajući zvuk pobedniku/gubitniku
- `playGameOverSound()` + haptic

## 4. Checkmate / stalemate detekcija
- Posle svakog poteza chess.js proverava `isCheckmate` / `isStalemate` / `isDraw`
- `commit_online_move` već prima `p_result` — proslediti tačan rezultat
- Overlay variant "checkmate" + konfeti + `playVictoryMelody()` za pobednika

## 5. Zvukovi (svi event-i)
| Event | Zvuk |
|---|---|
| Move | `playMoveSound` |
| Capture | `playCaptureSound` |
| Check | `playCheckSound` |
| Game start (match found) | `playGameStartSound` |
| Win | `playVictoryMelody` + `playGameOverSound` |
| Loss | `playGameOverSound` |
| Draw | `playDrawMelody` |
| Draw offer received | `playChessSound("notify")` |

Sve gated kroz `isMuted()` (već u `chess-sounds.ts`).

## 6. Game End Overlay
- Koristi postojeći `GameEndOverlay` komponentu
- Variant: `checkmate` / `resign` / `timeout` / `draw`
- `winnerLabel` lokalizovan ("You Won" / "You Lost" / "Draw")
- Board lock dok je overlay aktivan

## 7. Reconnect / refresh sync
- Na mount `PlayOnline` → fetch trenutni `online_games` red po `current_game_id`
- Server authoritative: FEN, PGN, turn, clocks iz baze
- Realtime subscribe na `online_games` i `online_draw_offers` za taj `game_id`

## 8. Stale game cleanup
- Edge function `online-game-watchdog` (već postoji) → cron svakih 5 min
- Auto-abort partije sa `last_move_at < now() - 1h` AND `move_number = 0`
- Auto-resign igrača koji je odsutan >5 min posle prvog poteza (presence tabela)

## 9. Testiranje (manual checklist nakon implementacije)
1. Start partije → start zvuk, board unlock
2. Klik Resign → instant lock + "You Lost" overlay + zvuk
3. Protivnik vidi "You Won" + konfeti bez refresh
4. Offer Draw → modal kod protivnika
5. Accept Draw → oba vide "STALEMATE" + draw melody
6. Decline Draw → game continues
7. Checkmate → konfeti pobedniku
8. Timeout → "TIME OUT" overlay
9. Refresh u sred partije → state ostaje tačan
10. Rating se update-uje samo jednom (`elo_applied` guard)

## Files koji se menjaju
- `src/hooks/use-online-game.ts` — resign/draw/timeout flow, zvukovi, overlay state
- `src/pages/PlayOnline.tsx` — overlay rendering, draw offer modal, loading states na dugmadima
- (opciono) `src/components/chess/DrawOfferModal.tsx` — novi mali komponent
- Nijedna database migracija nije potrebna — sve RPC funkcije već postoje

## Šta NIJE deo ovog plana
- Matchmaking refactor
- Spectate sistem
- Mobile UI dalje izmene (već urađene)
- 100 internet resources lista
