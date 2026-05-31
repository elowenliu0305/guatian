import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Note Changes Subscription ───

export function subscribeToNoteChanges(
  topicId: string,
  onNoteChange: (note: any) => void
): RealtimeChannel {
  return supabase
    .channel(`notes:${topicId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'notes',
        filter: `topic_id=eq.${topicId}`,
      },
      (payload) => {
        onNoteChange(payload.new)
      }
    )
    .subscribe()
}

// ─── Topic Changes Subscription ───

export function subscribeToTopicChanges(
  topicId: string,
  onUpdate: (topic: any) => void
): RealtimeChannel {
  return supabase
    .channel(`topic:${topicId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'topics',
        filter: `id=eq.${topicId}`,
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()
}
