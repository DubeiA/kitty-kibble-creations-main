import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";


export function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      setUser(data?.user || null);
      setLoading(false);
    };
      getUser();
      
      
  }, []);

  return { user, loading };
}

export default useCurrentUser;
