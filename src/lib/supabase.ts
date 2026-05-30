import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qqnmarbvzlqjqtlcszyt.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxbm1hcmJ2emxxanF0bGNzenl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNDg4MzksImV4cCI6MjA5NTcyNDgzOX0.qZipRB4GNEwaymvxasYMsfAT6fiXJCwG2YiOwHBa_zM'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})
