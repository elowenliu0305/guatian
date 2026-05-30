import { supabase } from '../lib/supabase'

// ─── Profile ───

export async function createAnonymousProfile(nickname: string) {
  const { data, error } = await supabase.rpc('create_anonymous_profile', { nickname })
  if (error) {
    // Fallback: direct insert if RPC fails
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .insert({ nickname, guazi_balance: 100 })
      .select()
      .single()
    if (directError) throw directError
    return directData
  }
  return { id: data, nickname, guazi_balance: 100 }
}

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(id: string, updates: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Melons ───

export async function createMelon(melon: {
  title: string
  description?: string
  creator_id: string
  retention_seconds: number
  is_time_limited?: boolean
  allow_revival?: boolean
  allow_images?: boolean
}) {
  const { data, error } = await supabase
    .from('melons')
    .insert({
      title: melon.title,
      description: melon.description || '',
      creator_id: melon.creator_id,
      retention_seconds: melon.retention_seconds,
      is_time_limited: melon.is_time_limited ?? true,
      allow_revival: melon.allow_revival ?? true,
      allow_images: melon.allow_images ?? true,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMelons(params?: {
  status?: string
  creatorId?: string
  searchQuery?: string
  hotOnly?: boolean
}) {
  let query = supabase.from('melons').select('*')

  if (params?.status) query = query.eq('status', params.status)
  if (params?.creatorId) query = query.eq('creator_id', params.creatorId)
  if (params?.searchQuery) query = query.ilike('title', `%${params.searchQuery}%`)
  if (params?.hotOnly) query = query.gt('heat_score', 50000)

  query = query.order('last_activity_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMelon(id: string) {
  const { data, error } = await supabase
    .from('melons')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateMelonStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('melons')
    .update({ status })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Sheets ───

export async function getSheets(melonId: string) {
  const { data, error } = await supabase
    .from('sheets')
    .select('*')
    .eq('melon_id', melonId)
    .order('sort_order')
  if (error) throw error
  return data
}

// ─── Cells ───

export async function getCells(sheetId: string) {
  const { data, error } = await supabase
    .from('cells')
    .select('*')
    .eq('sheet_id', sheetId)
  if (error) throw error
  return data
}

export async function upsertCell(cell: {
  sheet_id: string
  row_num: number
  col_num: number
  content: string
  background_color?: string
  is_poster?: boolean
  poster_text?: string
  span_rows?: number
  span_cols?: number
  has_image?: boolean
  image_url?: string
}) {
  const { data, error } = await supabase
    .from('cells')
    .upsert(cell, { onConflict: 'sheet_id, row_num, col_num' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Cell Reactions ───

export async function addReaction(cellId: string, userId: string, reactionType: string) {
  const { data, error } = await supabase
    .from('cell_reactions')
    .upsert(
      { cell_id: cellId, user_id: userId, reaction_type: reactionType },
      { onConflict: 'cell_id, user_id, reaction_type' }
    )
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Tips ───

export async function createTip(cellId: string, userId: string, amount: number) {
  const { data, error } = await supabase
    .from('cell_tips')
    .insert({ cell_id: cellId, user_id: userId, amount })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Revival ───

export async function createRevivalRequest(melonId: string, requesterId: string, duration: number) {
  const { data, error } = await supabase
    .from('revival_requests')
    .insert({ melon_id: melonId, requester_id: requesterId, revival_duration: duration })
    .select()
    .single()
  if (error) throw error
  return data
}

// ─── Online Participants ───

export async function trackVisit(melonId: string, userId: string) {
  const { error } = await supabase
    .from('melon_participants')
    .upsert(
      { melon_id: melonId, user_id: userId, last_visited_at: new Date().toISOString() },
      { onConflict: 'melon_id, user_id' }
    )
  if (error) throw error
}

// ─── Storage ───

export async function uploadImage(file: File, userId: string) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('melon-images')
    .upload(path, file)
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('melon-images')
    .getPublicUrl(path)
  return urlData.publicUrl
}
