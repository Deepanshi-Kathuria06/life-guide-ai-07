import { useState, useEffect } from "react";
import { User, LogOut, MessageSquare, Calendar, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export function ProfileDropdown() {
  const [profile, setProfile] = useState<any>(null);
  const [chatCount, setChatCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile data
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Get chat count
      const { count } = await supabase
        .from("chats")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setChatCount(count || 0);
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
    navigate("/");
  };

  const getDaysRemaining = () => {
    if (!profile?.trial_ends_at) return 0;
    const now = new Date();
    const trialEnd = new Date(profile.trial_ends_at);
    const diff = trialEnd.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getInitials = () => {
    if (!profile?.email) return "U";
    return profile.email.charAt(0).toUpperCase();
  };

  if (loading) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Avatar className="h-8 w-8 sm:h-10 sm:w-10 cursor-pointer border-2 border-primary/20">
            <AvatarFallback className="bg-gradient-primary text-white text-sm sm:text-base">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 sm:w-72">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">My Account</p>
            <p className="text-xs leading-none text-muted-foreground truncate max-w-[200px] sm:max-w-[240px]">
              {profile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <div className="px-2 py-2 sm:py-3 space-y-2 sm:space-y-3">
          {/* Subscription Status */}
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm">Subscription</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground capitalize">
                {profile?.subscription_status || "Free"}
              </p>
            </div>
          </div>

          {/* Days Remaining */}
          {profile?.subscription_status === "trial" && (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs sm:text-sm">Trial Days Left</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {getDaysRemaining()} days remaining
                </p>
              </div>
            </div>
          )}

          {/* Chat Count */}
          <div className="flex items-center gap-2 sm:gap-3 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-xs sm:text-sm">Total Chats</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {chatCount} conversations
              </p>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => navigate("/pricing")} className="text-xs sm:text-sm">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Manage Subscription</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleLogout} className="text-destructive text-xs sm:text-sm">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
