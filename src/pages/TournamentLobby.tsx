import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTournament } from "@/hooks/use-tournament";
import { useTournamentNotifications } from "@/hooks/use-tournament-notifications";
import { useStreak } from "@/hooks/use-streak";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Trophy, Clock, Users, Swords, Timer, Crown, Send, Eye, MessageSquare,
  Loader2, ArrowLeft, Play, UserCheck, LogOut, ChevronRight, Medal, Zap, Flame, X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

function getSkillLabel(rating: number) {
  if (rating < 1000) return "Beginner";
  if (rating < 1400) return "Intermediate";
  return "Advanced";
}

function getPlayerName(reg: { display_name?: string; username?: string; user_id: string }) {
  return reg.display_name || reg.username || reg.user_id.slice(0, 8);
}

const TournamentLobby = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    tournament, registrations, pairings, chatMessages,
    isRegistered, loading, myPairing,
    join, leave, startTournament, sendChat,
  } = useTournament(id);

  const { streak } = useStreak(user?.id);
  useTournamentNotifications(tournament, myPairing, user?.id);

  const [chatInput, setChatInput] = useState("");
  const [joining, setJoining] = useState(false);
  const [starting, setStarting] = useState(false);
  const [activeTab, setActiveTab] = useState<"standings" | "rounds" | "chat">("standings");
  const [dismissedBanners, setDismissedBanners] = useState<Record<string, number>>({});
  const [now, setNow] = useState(Date.now());
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const currentRound = tournament?.current_round ?? 0;
  const isReadyDismissed = dismissedBanners.ready === currentRound;
  const isCompleteDismissed = dismissedBanners.complete === currentRound;
  const isByeDismissed = dismissedBanners.bye === currentRound;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 pt-24 pb-16 text-center">
          <p className="text-muted-foreground">Tournament not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/tournaments")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Tournaments
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const isActive = tournament.status === "active";
  const isRegistering = tournament.status === "registering";
  const isFinished = tournament.status === "finished";
  const currentRoundPairings = pairings.filter(p => p.round === tournament.current_round);
  const regMap = new Map(registrations.map(r => [r.user_id, r]));

  const handleJoin = async () => {
    if (!user) { navigate("/login"); return; }
    setJoining(true);
    try {
      await join();
      toast({ title: "Joined!", description: "You're registered for the tournament." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    try {
      await leave();
      toast({ title: "Left tournament" });
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      await startTournament();
      toast({ title: "Tournament started!" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setStarting(false);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    await sendChat(chatInput.trim());
    setChatInput("");
  };

  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: "var(--font-body)" }}>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => navigate("/tournaments")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-3">
            <ArrowLeft className="h-4 w-4" /> Back to Tournaments
          </button>
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{tournament.name}</h1>
                <Badge className={
                  isActive ? "bg-accent text-accent-foreground" :
                  isRegistering ? "bg-primary/10 text-primary" :
                  "bg-muted text-muted-foreground"
                }>
                  {isActive ? "🔴 Live" : isRegistering ? "Open" : isFinished ? "Finished" : tournament.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{tournament.description}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 flex-wrap">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {tournament.time_control_label}</span>
                <span className="flex items-center gap-1"><Swords className="h-3 w-3" /> {tournament.total_rounds} rounds ({tournament.format})</span>
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {registrations.length}/{tournament.max_players} players</span>
                {isActive && <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-primary" /> Round {tournament.current_round}/{tournament.total_rounds}</span>}
              </div>
              {streak && streak.current_streak > 0 && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-accent/20 text-accent-foreground border-accent/30 text-[10px]">
                    <Flame className="h-3 w-3 mr-0.5 text-orange-500" /> {streak.current_streak}-day streak
                  </Badge>
                  {streak.longest_streak > streak.current_streak && (
                    <Badge variant="outline" className="text-[10px]">
                      Best: {streak.longest_streak} days
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px]">
                    {streak.total_tournaments_played} tournaments played
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {isRegistering && !isRegistered && (
                <Button onClick={handleJoin} disabled={joining}>
                  {joining ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserCheck className="h-4 w-4 mr-1" />}
                  Join Tournament
                </Button>
              )}
              {isRegistering && isRegistered && (
                <>
                  <Button variant="outline" onClick={handleLeave}>
                    <LogOut className="h-4 w-4 mr-1" /> Leave
                  </Button>
                  {registrations.length >= 2 && (
                    <Button onClick={handleStart} disabled={starting}>
                      {starting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                      Start Now
                    </Button>
                  )}
                </>
              )}
              {isActive && myPairing?.game_id && (
                <Button onClick={() => navigate(`/play/online?game=${myPairing.game_id}`)}>
                  <Swords className="h-4 w-4 mr-1" /> Play Your Game
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Auto-start countdown */}
        {isRegistering && tournament.starts_at && (() => {
          const ms = new Date(tournament.starts_at).getTime() - now;
          const sec = Math.max(0, Math.floor(ms / 1000));
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          const enough = registrations.length >= 2;
          return (
            <div className={`rounded-lg border p-3 mb-6 flex items-center justify-between gap-2 ${
              ms <= 0 ? "border-accent/40 bg-accent/10" : "border-primary/30 bg-primary/10"
            }`}>
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {ms > 0 ? (
                      <>Auto-starts in <span className="font-mono">{m}:{String(s).padStart(2, "0")}</span></>
                    ) : enough ? (
                      "Starting now…"
                    ) : (
                      "Waiting for more players (need at least 2)"
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {registrations.length} player{registrations.length === 1 ? "" : "s"} registered · {tournament.time_control_label}
                  </p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Notification banner for active round */}
        {isActive && myPairing && !myPairing.result && myPairing.game_id && !isReadyDismissed && (
          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-foreground">
                Round {tournament.current_round} — Your game is ready!
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" onClick={() => navigate(`/play/online?game=${myPairing.game_id}`)}>
                Play Now <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
              <button
                onClick={() => setDismissedBanners(d => ({ ...d, ready: currentRound }))}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
        {isActive && myPairing && myPairing.result && !isCompleteDismissed && (
          <div className="rounded-lg border border-border/50 bg-card p-3 mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Round {tournament.current_round} complete — {
                  myPairing.result === "1-0" && myPairing.white_player_id === user?.id ? "You won! 🎉" :
                  myPairing.result === "0-1" && myPairing.black_player_id === user?.id ? "You won! 🎉" :
                  myPairing.result === "1/2-1/2" ? "Draw" : "You lost"
                }. Waiting for other games to finish...
              </span>
            </div>
            <button
              onClick={() => setDismissedBanners(d => ({ ...d, complete: currentRound }))}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        {isActive && !myPairing && isRegistered && !isByeDismissed && (
          <div className="rounded-lg border border-border/50 bg-card p-3 mb-6 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">You have a bye this round. Waiting for next round...</span>
            </div>
            <button
              onClick={() => setDismissedBanners(d => ({ ...d, bye: currentRound }))}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-4">
          {(["standings", "rounds", "chat"] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-all border ${
                activeTab === tab ? "border-primary bg-primary/10 text-primary" : "border-border/50 bg-muted/20 text-muted-foreground hover:border-primary/30"
              }`}>
              {tab === "standings" && <Trophy className="h-3.5 w-3.5" />}
              {tab === "rounds" && <Swords className="h-3.5 w-3.5" />}
              {tab === "chat" && <MessageSquare className="h-3.5 w-3.5" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ============ STANDINGS ============ */}
        {activeTab === "standings" && (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-2 text-xs font-medium text-muted-foreground bg-muted/30 border-b border-border/30">
              <span>#</span><span>Player</span><span>Rating</span><span>Skill</span><span>Score</span>
            </div>
            {registrations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">No players registered yet.</p>
            ) : (
              registrations.sort((a, b) => Number(b.score) - Number(a.score) || b.rating_at_join - a.rating_at_join).map((reg, i) => (
                <div key={reg.id}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-4 py-2.5 text-sm items-center border-b border-border/20 last:border-0 ${
                    user && reg.user_id === user.id ? "bg-primary/5" : ""
                  }`}>
                  <span className="w-6 text-center">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-xs text-muted-foreground">{i + 1}</span>}
                  </span>
                  <span className="font-medium text-foreground truncate">
                    {getPlayerName(reg)}
                    {user && reg.user_id === user.id && <span className="text-primary text-xs ml-1">(you)</span>}
                  </span>
                  <span className="text-muted-foreground">{reg.rating_at_join}</span>
                  <Badge variant="outline" className="text-[10px]">{getSkillLabel(reg.rating_at_join)}</Badge>
                  <span className="font-bold text-primary">{Number(reg.score)}</span>
                </div>
              ))
            )}
          </div>
        )}

        {/* ============ ROUNDS ============ */}
        {activeTab === "rounds" && (
          <div className="space-y-4">
            {tournament.current_round === 0 && (
              <p className="text-center text-muted-foreground py-8 text-sm">Tournament hasn't started yet.</p>
            )}
            {Array.from({ length: tournament.current_round }, (_, i) => i + 1).reverse().map(round => {
              const roundPairings = pairings.filter(p => p.round === round);
              return (
                <div key={round} className="rounded-xl border border-border/50 bg-card overflow-hidden">
                  <div className="px-4 py-2 bg-muted/30 border-b border-border/30 flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Round {round}</span>
                    {round === tournament.current_round && isActive && (
                      <Badge className="bg-accent text-accent-foreground text-[10px]">🔴 In Progress</Badge>
                    )}
                  </div>
                  {roundPairings.map(p => {
                    const white = regMap.get(p.white_player_id);
                    const black = p.black_player_id ? regMap.get(p.black_player_id) : null;
                    const isBye = !p.black_player_id;
                    const isMyGame = user && (p.white_player_id === user.id || p.black_player_id === user.id);
                    const canSpectate = !isMyGame && p.game_id && !p.result;

                    return (
                      <div key={p.id} className={`px-4 py-3 border-b border-border/20 last:border-0 flex items-center justify-between ${isMyGame ? "bg-primary/5" : ""}`}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                              {white ? getPlayerName(white) : "?"}
                            </span>
                            <span className="text-xs text-muted-foreground">vs</span>
                            <span className="text-sm font-medium text-foreground truncate">
                              {isBye ? <span className="text-muted-foreground italic">BYE</span> : black ? getPlayerName(black) : "?"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {p.result ? (
                            <Badge variant="outline" className="text-xs">
                              {p.result === "1-0" ? "1-0" : p.result === "0-1" ? "0-1" : "½-½"}
                            </Badge>
                          ) : (
                            <Badge className="bg-accent/20 text-accent-foreground text-[10px]">Playing</Badge>
                          )}
                          {canSpectate && (
                            <Button size="sm" variant="ghost" className="text-xs" onClick={() => navigate(`/play/online?spectate=${p.game_id}`)}>
                              <Eye className="h-3 w-3 mr-1" /> Watch
                            </Button>
                          )}
                          {isMyGame && p.game_id && !p.result && (
                            <Button size="sm" onClick={() => navigate(`/play/online?game=${p.game_id}`)}>
                              <Play className="h-3 w-3 mr-1" /> Play
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* ============ CHAT ============ */}
        {activeTab === "chat" && (
          <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
            <div className="h-80 overflow-y-auto p-4 space-y-2">
              {chatMessages.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">No messages yet. Say hello!</p>
              )}
              {chatMessages.map(msg => {
                const sender = regMap.get(msg.user_id);
                const isMe = user && msg.user_id === user.id;
                return (
                  <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 ${isMe ? "bg-primary/20 text-primary" : "bg-muted text-foreground"}`}>
                      <p className="text-[10px] font-medium mb-0.5 opacity-70">
                        {sender ? getPlayerName(sender) : msg.user_id.slice(0, 8)}
                      </p>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            {user && isRegistered && (
              <div className="border-t border-border/30 p-3 flex gap-2">
                <Input
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1"
                  onKeyDown={e => e.key === "Enter" && handleSendChat()}
                />
                <Button size="sm" onClick={handleSendChat} disabled={!chatInput.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            )}
            {!isRegistered && (
              <div className="border-t border-border/30 p-3 text-center text-xs text-muted-foreground">
                Join the tournament to chat
              </div>
            )}
          </div>
        )}

        {/* Finished - show final standings and badges */}
        {isFinished && registrations.length > 0 && (
          <div className="mt-8 text-center">
            <h2 className="font-display text-xl font-bold text-foreground mb-4">🏆 Final Results</h2>
            <div className="inline-flex gap-6 justify-center flex-wrap">
              {registrations.sort((a, b) => Number(b.score) - Number(a.score)).slice(0, 3).map((reg, i) => (
                <div key={reg.id} className="text-center">
                  <div className="text-3xl mb-1">{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</div>
                  <p className="font-medium text-foreground">{getPlayerName(reg)}</p>
                  <p className="text-xs text-muted-foreground">{Number(reg.score)} pts</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default TournamentLobby;
