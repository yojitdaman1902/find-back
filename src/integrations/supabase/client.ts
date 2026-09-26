import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zjkqtmcqlfwexqylqpog.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_AROPjjdl1NziwirNhu5bFA_vGDxSM1q";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
