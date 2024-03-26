import { createClient } from "@supabase/supabase-js";

const key = process.env.API_KEY;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Create a single supabase client for interacting with your database
const supabase = createClient(url, key, {
  db: { schema: "public" },
});

export default supabase;
