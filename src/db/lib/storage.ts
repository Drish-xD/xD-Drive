import { createClient } from "@supabase/supabase-js";
import { CONFIG } from "@/config";

export const { storage } = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
