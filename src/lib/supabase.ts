
import { createClient } from '@supabase/supabase-js';

// Use the values from the connected Supabase project
const supabaseUrl = "https://rlkznudjiicipdwrkpxt.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJsa3pudWRqaWljaXBkd3JrcHh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ0OTQ4NDMsImV4cCI6MjA2MDA3MDg0M30.TnVZpNybskkhS8nu9XnzpcI1Uu5VocYJ4GMHgRSPSFs";

// Create Supabase client with the actual values
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});

// Add a helper function to check if we have valid credentials
export const isSupabaseConfigured = () => {
  return true; // We now have real credentials
};
