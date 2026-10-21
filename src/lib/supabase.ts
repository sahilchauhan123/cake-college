import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jdfswrmuigcbiyizxrfk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZnN3cm11aWdjYml5aXp4cmZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI1NDk1NzcsImV4cCI6MjEwODEyNTU3N30.kAMSXyS-dXTk4IeTF5maFF3vbGZqpB4sVgUqdWOQkak';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
