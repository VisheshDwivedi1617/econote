
import { createClient } from '@supabase/supabase-js';

// Attempt to get values from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY5MjMyMzcsImV4cCI6MTkzMjQ5OTYzN30.placeholder';

// Create Supabase client with defaults or environment values
export const supabase = createClient(supabaseUrl, supabaseKey);

// Add a helper function to check if we have valid credentials
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://example.supabase.co' && 
         supabaseKey !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTY5MjMyMzcsImV4cCI6MTkzMjQ5OTYzN30.placeholder';
};
