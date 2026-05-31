import { useState, useEffect } from 'react'

interface CreateTopicModalProps {
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
  initialTitle?: string;
}

export default function CreateTopicModal({ onClose, onCreate, initialTitle = '' }: CreateTopicModalProps) {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState('')

  useEffect(() => {
    setTitle(initialTitle)
  }, [initialTitle])

  const handleCreate = () => {
    if (!title.trim()) return
    onCreate(title.trim(), description.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-t-2xl p-5 animate-slide-up">
        <h2 className="text-lg font-bold text-gray-800 mb-1">创建新话题</h2>
        <p className="text-xs text-gray-400 mb-4">创建一个话题让大家来 bb</p>

        <input
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#428844] focus:border-transparent mb-3"
          placeholder="话题标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={30}
        />
        <textarea
          className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#428844] focus:border-transparent resize-none"
          placeholder="话题描述（可选）"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={100}
        />

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-500">取消</button>
          <button onClick={handleCreate} disabled={!title.trim()} className="flex-1 py-3 rounded-xl bg-[#428844] text-white text-sm font-medium disabled:opacity-40">创建</button>
        </div>
      </div>
    </div>
  )
}
