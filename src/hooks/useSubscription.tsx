import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useSubscription() {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, trial_ends_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    // Check if user has active subscription or valid trial
    const isActive = profile.subscription_status === "active";
    const trialValid = profile.subscription_status === "trial" && 
                       new Date(profile.trial_ends_at) > new Date();

    setHasAccess(isActive || trialValid);
    setLoading(false);

    if (!isActive && !trialValid) {
      navigate("/pricing");
    }
  };

  return { hasAccess, loading };
}
