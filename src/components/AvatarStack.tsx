interface AvatarStackProps {
  count: number;
  size?: 'sm' | 'md';
}

export default function AvatarStack({ count, size = 'sm' }: AvatarStackProps) {
  const avatarSize = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-7 h-7 text-sm'
  const max = 5
  const shown = Math.min(count, max)
  const remainder = count - max

  return (
    <div className="flex items-center">
      <div className="flex -space-x-1.5">
        {Array.from({ length: shown }).map((_, i) => (
          <div
            key={i}
            className={`${avatarSize} rounded-full bg-gradient-to-br from-green-300 to-green-500 flex items-center justify-center text-white font-medium border-2 border-white`}
          >
            🐹
          </div>
        ))}
      </div>
      <span className="ml-1.5 text-xs text-gray-500 font-medium">{count.toLocaleString()}</span>
    </div>
  )
}
