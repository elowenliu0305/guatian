import { useEffect } from 'react'

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, visible, onClose, duration = 2500 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration)
      return () => clearTimeout(timer)
    }
  }, [visible, onClose, duration])

  if (!visible) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] animate-fade-in">
      <div className="bg-gray-800/90 text-white text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
        {message}
      </div>
    </div>
  )
}
