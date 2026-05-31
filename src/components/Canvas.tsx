import { useState, useRef, useCallback, useEffect } from 'react'
import { mockTopics, mockNotes } from '../stores/topicStore'
import type { Topic, Note } from '../stores/topicStore'
import StickyNote from './StickyNote'
import CreateTopicModal from './CreateTopicModal'
import { useUserStore } from '../stores/userStore'
import { subscribeToTyping, broadcastTyping } from '../services/typingRealtime'
import type { TypingDraft } from '../services/typingRealtime'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface CanvasProps {
  onNavigate: (path: string) => void;
  createTopicDraft?: string;
  onDraftConsumed?: () => void;
  onTopicDetailChange?: (inDetail: boolean) => void;
}

export default function Canvas({ onNavigate, createTopicDraft, onDraftConsumed, onTopicDetailChange }: CanvasProps) {
  const [topics, setTopics] = useState<Topic[]>(() => mockTopics.map(t => ({ ...t })))
  const [notes, setNotes] = useState<Note[]>(() => mockNotes.map(n => ({ ...n })))
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null)
  const [showCreateTopic, setShowCreateTopic] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const [arrangeMode, setArrangeMode] = useState<'grid' | 'spiral' | 'wordcloud'>('grid')
  const [showArrangeMenu, setShowArrangeMenu] = useState(false)
  const [activeDrafts, setActiveDrafts] = useState<Record<string, TypingDraft>>({})
  const dragRef = useRef<{
    type: 'topic' | 'note';
    id: string;
    startX: number;
    startY: number;
    origLeft: number;
    origTop: number;
    moved: boolean;
  } | null>(null)
  const typingChannelRef = useRef<RealtimeChannel | null>(null)
  const arrangeRef = useRef<HTMLDivElement | null>(null)

  // Close arrange menu on outside click
  useEffect(() => {
    if (!showArrangeMenu) return
    const handler = (e: MouseEvent) => {
      if (arrangeRef.current && !arrangeRef.current.contains(e.target as Node)) {
        setShowArrangeMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showArrangeMenu])

  const nickname = useUserStore(s => s.nickname) || '我'

  const topicNotes = activeTopic
    ? notes.filter((n) => n.topicId === activeTopic.id)
    : []

  const handleCreateNote = () => {
    if (!activeTopic) return
    const maxY = topicNotes.reduce((max, n) => Math.max(max, n.y + 120), 10)
    const newNote: Note = {
      id: `n${Date.now()}`,
      topicId: activeTopic.id,
      x: 40,
      y: maxY,
      content: '说点什么...',
      color: '#FFF8E1',
      author: '我',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      likes: 0,
    }
    setNotes(prev => [...prev, newNote])
  }

  const handleArrange = (mode?: 'grid' | 'spiral' | 'wordcloud') => {
    if (!activeTopic) return
    const m = mode || arrangeMode
    setArrangeMode(m)
    setShowArrangeMenu(false)

    const sorted = [...topicNotes].sort((a, b) => (b.likes || 0) - (a.likes || 0))
    const getSize = (n: Note) => {
      const s = n.manualSize || (n.likes >= 60 ? 'large' : n.likes >= 25 ? 'normal' : 'compact')
      const colWidths: Record<string, number> = { compact: 170, normal: 220, large: 280 }
      const rowHeights: Record<string, number> = { compact: 100, normal: 130, large: 170 }
      return { w: colWidths[s], h: rowHeights[s] }
    }

    let positions: Array<{ x: number; y: number }>

    if (m === 'spiral') {
      // Spiral: Archimedean spiral from center
      const cx = 200, cy = 280
      positions = sorted.map((n, i) => {
        const angle = i * 0.55
        const radius = 15 + i * 16
        return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }
      })
    } else if (m === 'wordcloud') {
      // Word cloud: column-based with vertical staggering
      const cols = 4
      const colY = [10, 10, 10, 10]
      positions = sorted.map((n, i) => {
        const { w, h } = getSize(n)
        const col = i % cols
        const x = 20 + col * 190
        const y = colY[col]
        colY[col] = y + h + 12 + (Math.random() > 0.5 ? 8 : -8)
        return { x, y }
      })
    } else {
      // Grid: columns with wrapping
      const gapX = 20, gapY = 20, containerW = 360
      let x = 0, y = 0, rowMaxH = 0
      positions = sorted.map(n => {
        const { w, h } = getSize(n)
        if (x + w > containerW) { x = 0; y += rowMaxH + gapY; rowMaxH = 0 }
        const pos = { x: x + 20, y: y + 10 }
        x += w + gapX
        rowMaxH = Math.max(rowMaxH, h)
        return pos
      })
    }

    setNotes(prev => prev.map(n => {
      if (n.topicId !== activeTopic.id) return n
      const idx = sorted.findIndex(s => s.id === n.id)
      return { ...n, ...positions[idx] }
    }))
  }

  useEffect(() => {
    onTopicDetailChange?.(activeTopic !== null)
  }, [activeTopic, onTopicDetailChange])

  useEffect(() => {
    if (createTopicDraft) {
      setDraftTitle(createTopicDraft)
      setShowCreateTopic(true)
      onDraftConsumed?.()
    }
  }, [createTopicDraft, onDraftConsumed])

  // Subscribe to real-time typing drafts
  useEffect(() => {
    if (!activeTopic) return

    const channel = subscribeToTyping(activeTopic.id, (draft) => {
      if (draft.content.trim()) {
        setActiveDrafts(prev => ({ ...prev, [draft.author]: draft }))
      } else {
        setActiveDrafts(prev => {
          const next = { ...prev }
          delete next[draft.author]
          return next
        })
      }
    })
    typingChannelRef.current = channel

    // Stale draft cleanup every 2s
    const interval = setInterval(() => {
      setActiveDrafts(prev => {
        const now = Date.now()
        const filtered: Record<string, TypingDraft> = {}
        for (const [author, draft] of Object.entries(prev)) {
          if (now - draft.updatedAt < 4000) filtered[author] = draft
        }
        return filtered
      })
    }, 2000)

    return () => {
      channel.unsubscribe()
      clearInterval(interval)
      setActiveDrafts({})
      typingChannelRef.current = null
    }
  }, [activeTopic])

  const handlePreview = (data: { text: string; cardColor: string; textColor: string; fontSize: 'sm' | 'base' | 'lg'; manualSize: 'compact' | 'normal' | 'large' } | null) => {
    if (data && data.text.trim()) {
      const draft = {
        author: nickname,
        content: data.text,
        cardColor: data.cardColor,
        textColor: data.textColor,
        fontSize: data.fontSize,
        cardSize: data.manualSize,
      }
      setActiveDrafts(prev => ({ ...prev, [nickname]: { ...draft, updatedAt: Date.now() } }))
      if (typingChannelRef.current) {
        broadcastTyping(typingChannelRef.current, draft)
      }
    } else {
      setActiveDrafts(prev => {
        const next = { ...prev }
        delete next[nickname]
        return next
      })
      if (typingChannelRef.current) {
        broadcastTyping(typingChannelRef.current, {
          author: nickname,
          content: '',
          cardColor: '#FFF8E1',
          textColor: '',
          fontSize: 'sm',
          cardSize: 'normal',
        })
      }
    }
  }

  const handlePointerDown = useCallback((
    e: React.PointerEvent,
    type: 'topic' | 'note',
    item: Topic | Note,
  ) => {
    e.preventDefault()
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    dragRef.current = {
      type,
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      origLeft: 'x' in item ? item.x : item.x,
      origTop: 'y' in item ? item.y : item.y,
      moved: false,
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true
    if (!d.moved) return

    if (d.type === 'topic') {
      setTopics(prev => prev.map(t =>
        t.id === d.id ? { ...t, x: d.origLeft + dx, y: d.origTop + dy } : t
      ))
    } else {
      setNotes(prev => prev.map(n =>
        n.id === d.id ? { ...n, x: d.origLeft + dx, y: d.origTop + dy } : n
      ))
    }
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent, onClick?: () => void) => {
    const d = dragRef.current
    if (d) {
      const el = e.currentTarget as HTMLElement
      el.releasePointerCapture(e.pointerId)
      if (!d.moved && onClick) onClick()
      dragRef.current = null
    }
  }, [])

  // Canvas overview
  if (!activeTopic) {
    return (
      <div className="h-full relative">
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-white/90 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-800">得聊</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-500 text-xl px-2"
            >
              ≡
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 w-36">
                  <button onClick={() => { setShowMenu(false); onNavigate('/hot') }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">🔥 热门榜</button>
                  <button onClick={() => { setShowMenu(false); onNavigate('/profile') }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">👤 我的</button>
                  <div className="border-t border-gray-100 my-1" />
                  <button onClick={() => setShowMenu(false)} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">📋 社区公约</button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Canvas area */}
        <div className="h-full overflow-auto pt-12 pb-20">
          <div className="relative min-h-[600px] p-4">
            {/* Grid background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.03]">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* Topic cards */}
            <div className="relative">
              {[...topics]
                .sort((a, b) => b.heatScore - a.heatScore)
                .map((topic) => {
                  const isNaWa = topic.id === '7'
                  const isHot = topic.heatScore >= 950 && !isNaWa
                  const isWarm = topic.heatScore >= 850 && !isNaWa
                  const cardW = isNaWa ? 'min-w-[300px]' : isHot ? 'min-w-[220px]' : isWarm ? 'min-w-[190px]' : 'min-w-[160px]'
                  const titleSize = isNaWa ? 'text-lg' : isHot ? 'text-base' : isWarm ? 'text-sm' : 'text-xs'
                  return (
                    <div
                      key={topic.id}
                      className={`absolute ${cardW} p-4 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow text-left cursor-grab active:cursor-grabbing select-none`}
                      style={{
                        left: topic.x,
                        top: topic.y,
                        backgroundColor: topic.color,
                        touchAction: 'none',
                      }}
                      onPointerDown={(e) => handlePointerDown(e, 'topic', topic)}
                      onPointerMove={handlePointerMove}
                      onPointerUp={(e) => handlePointerUp(e, () => setActiveTopic(topic))}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`${titleSize} font-bold text-gray-800`}>{topic.title}</h3>
                        {topic.isHot && <span className="text-xs flex-shrink-0">🔥</span>}
                      </div>
                      <p className={`text-xs text-gray-500 mt-1 line-clamp-2 ${isNaWa ? 'text-sm' : ''}`}>{topic.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] text-gray-400 ${isNaWa ? 'text-xs' : ''}`}>{topic.noteCount} 条消息</span>
                        <span className={`text-[10px] text-gray-400 ${isNaWa ? 'text-xs' : ''}`}>热度 {topic.heatScore}</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>

        {/* Create topic modal */}
        {showCreateTopic && (
          <CreateTopicModal
            initialTitle={draftTitle}
            onClose={() => { setShowCreateTopic(false); setDraftTitle('') }}
            onCreate={(title, desc) => {
              const newTopic: Topic = {
                id: `t${Date.now()}`,
                title,
                description: desc,
                x: 40 + Math.random() * 200,
                y: 60 + Math.random() * 300,
                color: '#E8F5E9',
                creator: '我',
                noteCount: 0,
                heatScore: 0,
                createdAt: new Date().toISOString(),
              }
              setTopics(prev => [...prev, newTopic])
              setShowCreateTopic(false)
              setDraftTitle('')
            }}
          />
        )}
      </div>
    )
  }

  // Topic detail view
  return (
    <div className="h-full flex flex-col">
      {/* Topic header */}
      <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-b border-gray-100 px-3 py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => setActiveTopic(null)} className="text-gray-500 text-lg">←</button>
          <h1 className="font-semibold text-gray-800 text-sm truncate flex-1">{activeTopic.title}</h1>
          <div className="relative" ref={arrangeRef}>
            <button
              onClick={() => setShowArrangeMenu(!showArrangeMenu)}
              className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1.5 rounded-full font-medium"
            >
              ⊞ {arrangeMode === 'grid' ? '排列' : arrangeMode === 'spiral' ? '螺旋' : '词云'}
            </button>
            {showArrangeMenu && (
              <div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 w-20">
                <button onClick={() => handleArrange('grid')} className={`w-full text-left px-3 py-2 text-xs ${arrangeMode === 'grid' ? 'text-[#3B82F6] font-medium' : 'text-gray-700'} hover:bg-gray-50`}>排列</button>
                <button onClick={() => handleArrange('spiral')} className={`w-full text-left px-3 py-2 text-xs ${arrangeMode === 'spiral' ? 'text-[#3B82F6] font-medium' : 'text-gray-700'} hover:bg-gray-50`}>螺旋</button>
                <button onClick={() => handleArrange('wordcloud')} className={`w-full text-left px-3 py-2 text-xs ${arrangeMode === 'wordcloud' ? 'text-[#3B82F6] font-medium' : 'text-gray-700'} hover:bg-gray-50`}>词云</button>
              </div>
            )}
          </div>
          <button onClick={handleCreateNote} className="text-xs text-white bg-[#3B82F6] px-3 py-1.5 rounded-full font-medium">+ 写一条</button>
        </div>
        <p className="text-xs text-gray-400 mt-1 ml-7">{activeTopic.description}</p>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto">
        <div className="relative min-h-[500px] p-4">
          {/* Grid background */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]">
            <defs>
              <pattern id="grid-detail" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3B82F6" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-detail)" />
          </svg>

          {/* Live typing drafts — everyone's in-progress input */}
          {Object.entries(activeDrafts).map(([author, draft], idx) => (
            <div
              key={author}
              className="absolute z-10 opacity-90"
              style={{ left: 40 + idx * 200, top: 10 }}
            >
              <div className="relative">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <StickyNote
                  note={{
                    id: `__typing_${author}__`,
                    topicId: activeTopic!.id,
                    x: 40 + idx * 200,
                    y: 10,
                    content: draft.content,
                    color: draft.cardColor,
                    author: draft.author,
                    createdAt: '',
                    updatedAt: '',
                    likes: 0,
                    textColor: draft.textColor || undefined,
                    fontSize: draft.fontSize,
                    manualSize: draft.cardSize,
                  }}
                  cardSize={draft.cardSize}
                  onLike={() => {}}
                />
              </div>
            </div>
          ))}

          {/* Note cards */}
          <div className="relative">
            {[...topicNotes]
              .sort((a, b) => b.likes - a.likes)
              .map((note) => {
                const size = note.manualSize || (note.likes >= 60 ? 'large' : note.likes >= 25 ? 'normal' : 'compact')
                const w = size === 'large' ? 'w-[280px]' : size === 'normal' ? 'w-[220px]' : 'w-[170px]'
                return (
                  <div
                    key={note.id}
                    className={`absolute ${w} cursor-grab active:cursor-grabbing`}
                    style={{
                      left: note.x,
                      top: note.y,
                      touchAction: 'none',
                    }}
                    onPointerDown={(e) => handlePointerDown(e, 'note', note)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={(e) => handlePointerUp(e)}
                  >
                    <StickyNote
                      note={note}
                      cardSize={size}
                      onLike={() => {
                        setNotes(prev => prev.map(n =>
                          n.id === note.id ? { ...n, likes: n.likes + 1 } : n
                        ))
                      }}
                    />
                  </div>
                )
              })}
          </div>
        </div>
      </div>

      {/* Bottom send bar */}
      <div className="flex-shrink-0 bg-white border-t border-gray-100">
        <FormatSendInput
          onSend={(text, cardColor, textColor, fontSize, manualSize, image) => {
            if (!activeTopic) return
            const maxY = topicNotes.reduce((max, n) => Math.max(max, n.y + 120), 10)
            const newNote: Note = {
              id: `n${Date.now()}`,
              topicId: activeTopic.id,
              x: 40,
              y: maxY,
              content: text,
              color: cardColor,
              author: '我',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              likes: 0,
              textColor,
              fontSize,
              manualSize,
              image,
            }
            setNotes(prev => [...prev, newNote])
          }}
          onPreview={handlePreview}
        />
      </div>
    </div>
  )
}

const CARD_COLORS = [
  { label: '黄', value: '#FFF8E1' },
  { label: '白', value: '#FFFFFF' },
  { label: '粉', value: '#FFEBEE' },
  { label: '绿', value: '#E8F5E9' },
  { label: '蓝', value: '#E3F2FD' },
  { label: '紫', value: '#F3E5F5' },
  { label: '橙', value: '#FFF3E0' },
  { label: '灰', value: '#F5F5F5' },
]

const TEXT_COLORS = [
  { label: '默认', value: '' },
  { label: '红', value: '#DC2626' },
  { label: '绿', value: '#16A34A' },
  { label: '蓝', value: '#2563EB' },
  { label: '橙', value: '#EA580C' },
  { label: '紫', value: '#9333EA' },
]

function FormatSendInput({ onSend, onPreview }: {
  onSend: (text: string, cardColor: string, textColor: string, fontSize: 'sm' | 'base' | 'lg', manualSize: 'compact' | 'normal' | 'large', image?: string) => void;
  onPreview?: (data: { text: string; cardColor: string; textColor: string; fontSize: 'sm' | 'base' | 'lg'; manualSize: 'compact' | 'normal' | 'large' } | null) => void;
}) {
  const [text, setText] = useState('')
  const [showFormat, setShowFormat] = useState(false)
  const [cardColor, setCardColor] = useState('#FFF8E1')
  const [textColor, setTextColor] = useState('')
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('sm')
  const [cardSize, setCardSize] = useState<'compact' | 'normal' | 'large'>('normal')
  const [image, setImage] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const sizeLabels: Record<string, string> = { compact: '小', normal: '中', large: '大' }

  const emitPreview = (t: string, cc: string, tc: string, fs: 'sm' | 'base' | 'lg', cs: 'compact' | 'normal' | 'large') => {
    onPreview?.(t.trim() ? { text: t, cardColor: cc, textColor: tc, fontSize: fs, manualSize: cs } : null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { uploadImage } = await import('../services/api')
      const { useUserStore } = await import('../stores/userStore')
      const uid = useUserStore.getState().userId || 'anon'
      const url = await uploadImage(file, uid)
      setImage(url)
    } catch (err) {
      console.error('Upload failed:', err)
    }
    setUploading(false)
  }

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text.trim(), cardColor, textColor, fontSize, cardSize, image || undefined)
    setText('')
    setImage('')
    onPreview?.(null)
  }

  return (
    <div className="px-3 py-2.5">
      {showFormat && (
        <div className="mb-2 space-y-2 animate-fade-in">
          {/* Card color */}
          <div>
            <div className="text-[10px] text-gray-400 mb-1">卡片颜色</div>
            <div className="flex gap-1.5">
              {CARD_COLORS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { setCardColor(c.value); emitPreview(text, c.value, textColor, fontSize, cardSize) }}
                  className={`w-7 h-7 rounded-full border-2 ${cardColor === c.value ? 'border-[#3B82F6]' : 'border-gray-200'}`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </div>
          {/* Text color + Font size */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gray-400 mb-1">文字颜色</div>
              <div className="flex gap-1.5">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value || 'default'}
                    onClick={() => { setTextColor(c.value); emitPreview(text, cardColor, c.value, fontSize, cardSize) }}
                    className={`w-7 h-7 rounded-full border-2 text-[10px] flex items-center justify-center ${
                      textColor === c.value ? 'border-[#3B82F6]' : 'border-gray-200'
                    }`}
                    style={c.value ? { backgroundColor: c.value } : { backgroundColor: '#f5f5f5' }}
                    title={c.label}
                  >
                    {!c.value && <span className="text-gray-400">A</span>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-gray-400 mb-1">字号</div>
              <div className="flex bg-gray-100 rounded-lg p-0.5">
                {(['sm', 'base', 'lg'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFontSize(s); emitPreview(text, cardColor, textColor, s, cardSize) }}
                    className={`px-2.5 py-1 text-xs rounded-md transition-colors ${fontSize === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                  >
                    {s === 'sm' ? 'S' : s === 'base' ? 'M' : 'L'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Card size */}
          <div>
            <div className="text-[10px] text-gray-400 mb-1">卡片大小</div>
            <div className="flex bg-gray-100 rounded-lg p-0.5 w-fit">
              {(['compact', 'normal', 'large'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => { setCardSize(s); emitPreview(text, cardColor, textColor, fontSize, s) }}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${cardSize === s ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'}`}
                >
                  {sizeLabels[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {image && (
        <div className="mb-2 relative inline-block">
          <img src={image} alt="" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
          <button onClick={() => setImage('')} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gray-700 text-white rounded-full text-[10px] flex items-center justify-center">✕</button>
        </div>
      )}
      <div className="flex items-center gap-2">
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleImageUpload} />
        <button
          onClick={() => setShowFormat(!showFormat)}
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-colors ${showFormat ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          {showFormat ? '✕' : '🎨'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors disabled:opacity-40"
        >
          {uploading ? '⏳' : '🖼'}
        </button>
        <input
          autoFocus
          className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent"
          placeholder="写一条..."
          value={text}
          onChange={(e) => { const v = e.target.value; setText(v); emitPreview(v, cardColor, textColor, fontSize, cardSize) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="px-4 py-2 rounded-xl bg-[#3B82F6] text-white text-sm font-medium disabled:opacity-40"
        >
          发送
        </button>
      </div>
    </div>
  )
}
