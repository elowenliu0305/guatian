import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface TypingDraft {
  author: string;
  content: string;
  cardColor: string;
  textColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  cardSize: 'compact' | 'normal' | 'large';
  updatedAt: number;
}

export function subscribeToTyping(
  topicId: string,
  onDraft: (draft: TypingDraft) => void,
): RealtimeChannel {
  const channel = supabase.channel(`typing:${topicId}`, {
    broadcast: { self: false },
  })

  channel.on('broadcast', { event: 'typing' }, (payload) => {
    onDraft(payload.payload as TypingDraft)
  })

  channel.subscribe()
  return channel
}

export function broadcastTyping(
  channel: RealtimeChannel,
  draft: Omit<TypingDraft, 'updatedAt'>,
) {
  channel.send({
    type: 'broadcast',
    event: 'typing',
    payload: { ...draft, updatedAt: Date.now() },
  })
}
