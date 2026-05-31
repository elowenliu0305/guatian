import { supabase } from '../lib/supabase'

// ─── Profile ───

export async function createAnonymousProfile(nickname: string) {
  const { data, error } = await supabase.rpc('create_anonymous_profile', { nickname })
  if (error) {
    const { data: directData, error: directError } = await supabase
      .from('profiles')
      .insert({ nickname })
      .select()
      .single()
    if (directError) throw directError
    return directData
  }
  return { id: data, nickname }
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

// ─── Topics ───

export async function createTopic(topic: {
  title: string
  description?: string
  creator_id: string
  x?: number
  y?: number
  color?: string
}) {
  const { data, error } = await supabase
    .from('topics')
    .insert({
      title: topic.title,
      description: topic.description || '',
      creator_id: topic.creator_id,
      x: topic.x ?? 10,
      y: topic.y ?? 10,
      color: topic.color || '#E8F5E9',
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getTopics(params?: {
  creatorId?: string
  searchQuery?: string
  hotOnly?: boolean
}) {
  let query = supabase.from('topics').select('*')

  if (params?.creatorId) query = query.eq('creator_id', params.creatorId)
  if (params?.searchQuery) query = query.ilike('title', `%${params.searchQuery}%`)
  if (params?.hotOnly) query = query.gt('heat_score', 50000)

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getTopic(id: string) {
  const { data, error } = await supabase
    .from('topics')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

// ─── Notes ───

export async function getNotes(topicId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function createNote(note: {
  topic_id: string
  content: string
  author: string
  x?: number
  y?: number
  color?: string
  is_poster?: boolean
  poster_text?: string
}) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      topic_id: note.topic_id,
      content: note.content,
      author: note.author,
      x: note.x ?? 0,
      y: note.y ?? 0,
      color: note.color || '#FFF',
      is_poster: note.is_poster ?? false,
      poster_text: note.poster_text || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function likeNote(noteId: string) {
  const { data, error } = await supabase.rpc('like_note', { note_id: noteId })
  if (error) throw error
  return data
}

// ─── Storage ───

export async function uploadImage(file: File, userId: string) {
  const ext = file.name.split('.').pop()
  const path = `${userId}/${Date.now()}.${ext}`
  const { data, error } = await supabase.storage
    .from('topic-images')
    .upload(path, file)
  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('topic-images')
    .getPublicUrl(path)
  return urlData.publicUrl
}
