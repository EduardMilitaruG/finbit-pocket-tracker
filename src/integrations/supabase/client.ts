
import { createClient } from '@supabase/supabase-js'

const urlSupabase = 'https://mgafluaswmlrcarzamue.supabase.co'
const clavePublica = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nYWZsdWFzd21scmNhcnphbXVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MjUwMTIsImV4cCI6MjA2NTAwMTAxMn0.61z-68C4A5XiO3x6az-CM1qwb77jKufgY2Q4zFbuvl4'

export const supabase = createClient(urlSupabase, clavePublica)
