import { useState, useRef } from 'react'

interface BottomNavProps {
  onSendMessage?: (text: string) => void;
  placeholder?: string;
}

export default function BottomNav({ onSendMessage, placeholder = '想说点什么...' }: BottomNavProps) {
  const [expanded, setExpanded] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if (!text.trim()) return
    onSendMessage?.(text.trim())
    setText('')
    setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-3 py-2.5">
      {expanded ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            autoFocus
            className="flex-1 px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#428844] focus:border-transparent"
            placeholder={placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className="px-4 py-2 rounded-xl bg-[#428844] text-white text-sm font-medium disabled:opacity-40"
          >
            发送
          </button>
        </div>
      ) : (
        <div
          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-full border border-gray-100 cursor-text active:bg-gray-100 transition-colors"
          onClick={() => { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 50) }}
        >
          <span className="text-gray-400 text-sm">💬</span>
          <span className="text-xs text-gray-400">{placeholder}</span>
        </div>
      )}
    </div>
  )
}
