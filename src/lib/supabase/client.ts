// Re-export the Lovable-managed Supabase client so configuration stays
// centralized and no credentials are hardcoded in the repository.
export { supabase } from "@/integrations/supabase/client";
