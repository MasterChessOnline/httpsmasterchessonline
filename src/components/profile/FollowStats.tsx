import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** The profile being viewed (auth user id) */
  userId: string;
  /** Currently signed-in user id, if any */
  viewerId?: string | null;
}

/**
 * Followers / following counters plus a follow-unfollow action.
 * Counts are read live from `follows` so they are always real numbers.
 */
const FollowStats = ({ userId, viewerId }: Props) => {
  const [followers, setFollowers] = useState<number | null>(null);
  const [following, setFollowing] = useState<number | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  const isSelf = viewerId === userId;

  const load = async () => {
    const [a, b] = await Promise.all([
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("following_id", userId),
      supabase.from("follows").select("id", { count: "exact", head: true }).eq("follower_id", userId),
    ]);
    setFollowers(a.count ?? 0);
    setFollowing(b.count ?? 0);

    if (viewerId && !isSelf) {
      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", viewerId)
        .eq("following_id", userId)
        .maybeSingle();
      setIsFollowing(!!data);
    }
  };

  useEffect(() => {
    if (!userId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, viewerId]);

  const toggle = async () => {
    if (!viewerId) {
      toast.info("Create a free account to follow players");
      return;
    }
    setBusy(true);
    try {
      if (isFollowing) {
        await supabase.from("follows").delete().eq("follower_id", viewerId).eq("following_id", userId);
        setIsFollowing(false);
        setFollowers((c) => Math.max(0, (c ?? 1) - 1));
      } else {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: viewerId, following_id: userId });
        if (error) throw error;
        setIsFollowing(true);
        setFollowers((c) => (c ?? 0) + 1);
        toast.success("Following ✓");
      }
    } catch (e: any) {
      toast.error(e.message || "Could not update follow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/10 p-3">
      <div className="flex items-center gap-5">
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-foreground">{followers ?? "—"}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-foreground">{following ?? "—"}</p>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Following</p>
        </div>
      </div>

      {isSelf ? (
        <Link to="/community">
          <Button size="sm" variant="outline">Find players</Button>
        </Link>
      ) : (
        <Button size="sm" onClick={toggle} disabled={busy} variant={isFollowing ? "outline" : "default"}>
          {busy ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : isFollowing ? (
            <UserCheck className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <UserPlus className="mr-1.5 h-3.5 w-3.5" />
          )}
          {isFollowing ? "Following" : "Follow"}
        </Button>
      )}
    </div>
  );
};

export default FollowStats;
