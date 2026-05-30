import { useState } from 'react'

interface TipModalProps {
  onClose: () => void;
  onConfirm: (amount: number) => void;
  balance: number;
}

const TIP_AMOUNTS = [1, 5, 10, 50]

export default function TipModal({ onClose, onConfirm, balance }: TipModalProps) {
  const [selected, setSelected] = useState<number>(5)

  return (
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-md mx-auto bg-white rounded-t-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-2 pb-1">
          <div className="w-8 h-1 bg-gray-300 rounded-full" />
        </div>

        <div className="px-5 py-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center mb-1">🍉 打赏瓜子</h3>
          <p className="text-xs text-gray-400 text-center mb-4">
            当前瓜子余额：<span className="text-green-600 font-medium">{balance}</span>
          </p>

          <div className="grid grid-cols-4 gap-3 mb-4">
            {TIP_AMOUNTS.map((amount) => (
              <button
                key={amount}
                onClick={() => setSelected(amount)}
                className={`py-3 rounded-xl text-lg font-bold transition-colors ${
                  selected === amount
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-green-300'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>

          <div className="text-center text-sm text-gray-500 mb-4">
            打赏 <span className="font-bold text-green-600">{selected}</span> 个瓜子
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50"
            >
              取消
            </button>
            <button
              onClick={() => {
                if (balance < selected) {
                  alert('瓜子不足！去赚取更多瓜子吧')
                  return
                }
                onConfirm(selected)
                onClose()
              }}
              className={`flex-1 py-2.5 rounded-lg text-sm text-white font-medium ${
                balance < selected
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {balance < selected ? '瓜子不足' : '确定打赏'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
