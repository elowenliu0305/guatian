import { supabase } from '../lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ─── Cell Changes Subscription ───

export function subscribeToCellChanges(
  sheetId: string,
  onCellUpdate: (cell: any) => void
): RealtimeChannel {
  return supabase
    .channel(`cells:${sheetId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cells',
        filter: `sheet_id=eq.${sheetId}`,
      },
      (payload) => {
        onCellUpdate(payload.new)
      }
    )
    .subscribe()
}

// ─── Melon Changes Subscription ───

export function subscribeToMelonChanges(
  melonId: string,
  onUpdate: (melon: any) => void
): RealtimeChannel {
  return supabase
    .channel(`melon:${melonId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'melons',
        filter: `id=eq.${melonId}`,
      },
      (payload) => {
        onUpdate(payload.new)
      }
    )
    .subscribe()
}

// ─── Typing Indicators (Broadcast) ───

export interface TypingEvent {
  userId: string
  nickname: string
  cellPosition: string
}

export function createTypingChannel(
  melonId: string,
  onTyping: (event: TypingEvent) => void,
  onTypingEnd: (userId: string) => void
): RealtimeChannel {
  const channel = supabase.channel(`typing:${melonId}`)

  channel
    .on('broadcast', { event: 'typing_start' }, (payload) => {
      onTyping(payload.payload as TypingEvent)
    })
    .on('broadcast', { event: 'typing_end' }, (payload) => {
      onTypingEnd((payload.payload as TypingEvent).userId)
    })
    .subscribe()

  return channel
}

export async function broadcastTyping(
  melonId: string,
  event: 'typing_start' | 'typing_end',
  data: TypingEvent
) {
  await supabase.channel(`typing:${melonId}`).send({
    type: 'broadcast',
    event,
    payload: data,
  })
}

// ─── Online Presence ───

export function createPresenceChannel(
  melonId: string,
  onPresence: (onlineCount: number) => void
): RealtimeChannel {
  const channel = supabase.channel(`presence:${melonId}`, {
    configs: {
      presence: {
        key: '',
      },
    },
  })

  channel
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channel.presenceState()
      const count = Object.keys(presenceState).length
      onPresence(count)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ online_at: new Date().toISOString() })
      }
    })

  return channel
}
