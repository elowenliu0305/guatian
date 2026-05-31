import { useState } from 'react'
import type { Note } from '../stores/topicStore'

type CardSize = 'compact' | 'normal' | 'large'

interface StickyNoteProps {
  note: Note;
  onLike: () => void;
  cardSize?: CardSize;
}

function getCardSize(likes: number): CardSize {
  if (likes >= 60) return 'large'
  if (likes >= 25) return 'normal'
  return 'compact'
}

const sizeStyles: Record<CardSize, {
  padding: string;
  contentSize: string;
  posterTitleSize: string;
  posterContentSize: string;
  metaSize: string;
  heatScale: number;
}> = {
  compact: {
    padding: 'p-2.5',
    contentSize: 'text-xs',
    posterTitleSize: 'text-xs',
    posterContentSize: 'text-xs',
    metaSize: 'text-[10px]',
    heatScale: 0,
  },
  normal: {
    padding: 'p-3.5',
    contentSize: 'text-sm',
    posterTitleSize: 'text-sm',
    posterContentSize: 'text-sm',
    metaSize: 'text-xs',
    heatScale: 1,
  },
  large: {
    padding: 'p-4',
    contentSize: 'text-base',
    posterTitleSize: 'text-base',
    posterContentSize: 'text-sm',
    metaSize: 'text-xs',
    heatScale: 2,
  },
}

const fontSizes: Record<string, string> = {
  sm: 'text-xs',
  base: 'text-sm',
  lg: 'text-base',
}

export default function StickyNote({ note, onLike, cardSize: sizeProp }: StickyNoteProps) {
  const [liked, setLiked] = useState(false)
  const cardSize = note.manualSize || sizeProp || getCardSize(note.likes)
  const s = sizeStyles[cardSize]

  const fs = note.fontSize ? fontSizes[note.fontSize] : s.contentSize
  const tc = note.textColor

  const baseClass = `${s.padding} rounded-2xl border border-gray-200/50 shadow-sm transition-shadow hover:shadow-md`
  const contentStyle: React.CSSProperties = {
    backgroundColor: note.color || '#FFF',
  }
  if (tc) contentStyle.color = tc

  if (note.isPoster) {
    return (
      <div className={`${baseClass} overflow-hidden`} style={contentStyle}>
        {note.image && (
          <img src={note.image} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />
        )}
        {note.posterText && (
          <div className={`${s.posterTitleSize} font-bold text-gray-700 mb-2 whitespace-pre-line`}>{note.posterText}</div>
        )}
        <div className={`${s.posterContentSize} leading-relaxed`} style={{ color: tc || '#4B5563' }}>{note.content}</div>
        <div className={`flex items-center justify-between mt-3 ${s.metaSize} text-gray-400`}>
          <span>{note.author}</span>
          <button
            onClick={() => { setLiked(!liked); onLike() }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${liked ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100'}`}
          >
            {liked ? '❤️' : '🤍'} {note.likes + (liked ? 1 : 0)}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${baseClass} overflow-hidden`} style={contentStyle}>
      {note.image && (
        <img src={note.image} alt="" className="w-full h-32 object-cover rounded-xl mb-2" />
      )}
      <div className={`${fs} leading-relaxed`}>{note.content}</div>
      <div className={`flex items-center justify-between mt-2.5 ${s.metaSize} ${tc ? '' : 'text-gray-400'}`} style={tc ? { color: tc } : {}}>
        <span>{note.author}</span>
        <button
          onClick={() => { setLiked(!liked); onLike() }}
          className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${liked ? 'text-red-500 bg-red-50' : 'hover:bg-gray-100'}`}
        >
          {liked ? '❤️' : '🤍'} {note.likes + (liked ? 1 : 0)}
        </button>
      </div>
    </div>
  )
}
