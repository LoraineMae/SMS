// src/lib/supabase.js
// Supabase client — used across the whole app

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = 'https://xstfijkxvloflbdsyslf.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhzdGZpamt4dmxvZmxiZHN5c2xmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3ODIzNTYsImV4cCI6MjA4NzM1ODM1Nn0.U2QnstkXz7roRqb2-hzj48_-WSgld7HjmcHcg9w0YsA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);