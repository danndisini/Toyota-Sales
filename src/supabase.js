// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vvksehbozaufwlxjlyhf.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a3NlaGJvemF1ZndseGpseWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDY3MjksImV4cCI6MjA3MDA4MjcyOX0.DCQO92eR6l5djjlYLCJVF5M-rbg4HUeXN-rsZsEDmho'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)


