import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AvatarStack from '../components/AvatarStack'
import CellInteractionModal from '../components/CellInteractionModal'
import TipModal from '../components/TipModal'
import Toast from '../components/Toast'
import { mockMelonSheets } from '../stores/melonStore'
import { useUserStore } from '../stores/userStore'
import { getSheets, getCells, upsertCell, trackVisit } from '../services/api'
import { subscribeToCellChanges, createPresenceChannel } from '../services/realtime'

const BG_COLORS = ['#FFEBEE', '#FFF8E1', '#E8F5E9', '#F3E5F5', '#E3F2FD']
const COLUMN_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const COLS = 8
const ROWS = 30

interface CellData {
  id?: string;
  row_num: number;
  col_num: number;
  content: string;
  background_color?: string;
  is_poster?: boolean;
  poster_text?: string;
  span_rows?: number;
  span_cols?: number;
}

export default function MelonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { userId, nickname } = useUserStore()
  const mockData = id ? mockMelonSheets[id] : null

  // State for real-time data
  const [melonData, setMelonData] = useState(mockData)
  const [cells, setCells] = useState<CellData[]>([])
  const [sheetId, setSheetId] = useState<string>('')
  const [isLive, setIsLive] = useState(false)
  const [loading, setLoading] = useState(false)

  const [activeSheet, setActiveSheet] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null)
  const [editValue, setEditValue] = useState('')
  const [onlineCount, setOnlineCount] = useState(mockData?.onlineCount || 0)

  // Modals
  const [modalCell, setModalCell] = useState<{ row: number; col: number } | null>(null)
  const [showTip, setShowTip] = useState(false)
  const [tipTarget, setTipTarget] = useState<'cell' | 'melon'>('cell')
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false })

  // Poster mode
  const [posterMode, setPosterMode] = useState(false)
  const [posterStart, setPosterStart] = useState<{ row: number; col: number } | null>(null)
  const [posterEnd, setPosterEnd] = useState<{ row: number; col: number } | null>(null)
  const [showPosterInput, setShowPosterInput] = useState(false)
  const [posterText, setPosterText] = useState('')

  const gridRef = useRef<HTMLDivElement>(null)

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true })
  }, [])

  // Fetch real data from Supabase
  useEffect(() => {
    if (!id) return
    const loadData = async () => {
      setLoading(true)
      try {
        const sheets = await getSheets(id)
        if (sheets && sheets.length > 0) {
          const firstSheet = sheets[0]
          setSheetId(firstSheet.id)
          setActiveSheet(0)

          const cellsData = await getCells(firstSheet.id)
          if (cellsData) {
            setCells(cellsData)
            setIsLive(true)
          }
        }
      } catch (e) {
        console.warn('Failed to load live data, using mock:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
    trackVisit(id, userId || 'anonymous')
  }, [id, userId])

  // Real-time: subscribe to cell changes
  useEffect(() => {
    if (!sheetId) return
    const channel = subscribeToCellChanges(sheetId, (newCell: any) => {
      setCells((prev) => {
        const idx = prev.findIndex(
          (c) => c.row_num === newCell.row_num && c.col_num === newCell.col_num
        )
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], ...newCell }
          return updated
        }
        return [...prev, newCell]
      })
    })
    return () => { channel.unsubscribe() }
  }, [sheetId])

  // Real-time: online presence
  useEffect(() => {
    if (!id) return
    const channel = createPresenceChannel(id, (count) => {
      setOnlineCount(count)
    })
    return () => { channel.unsubscribe() }
  }, [id])

  const currentCells = isLive ? cells : (melonData?.sheets[activeSheet]?.cells || [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  const getCell = (row: number, col: number) => {
    if (isLive) {
      return currentCells.find((c: any) => c.row_num === row && c.col_num === col)
    }
    const cellMap = new Map<string, any>()
    currentCells.forEach((cell: any) => {
      cellMap.set(`${cell.row},${cell.col}`, cell)
    })
    return cellMap.get(`${row},${col}`)
  }

  const handleCellClick = (row: number, col: number) => {
    const cell = getCell(row, col)

    if (posterMode) {
      if (!posterStart) {
        setPosterStart({ row, col })
        setPosterEnd({ row, col })
      } else {
        setPosterEnd({ row, col })
        setShowPosterInput(true)
      }
      return
    }

    if (cell?.isPoster || cell?.is_poster) return

    const hasContent = isLive ? cell?.content : cell?.content
    if (hasContent && !editingCell) {
      setModalCell({ row, col })
      return
    }

    setSelectedCell(null)
    setEditingCell({ row, col })
    setEditValue(isLive ? (cell?.content || '') : (cell?.content || ''))
  }

  const handleCellSave = async () => {
    if (editingCell) {
      if (isLive && sheetId) {
        try {
          await upsertCell({
            sheet_id: sheetId,
            row_num: editingCell.row,
            col_num: editingCell.col,
            content: editValue,
          })
        } catch (e) {
          console.warn('Failed to save cell:', e)
        }
      } else {
        // Mock mode: update local state
        const cell = getCell(editingCell.row, editingCell.col)
        if (!cell) {
          currentCells.push({
            row: editingCell.row,
            col: editingCell.col,
            content: editValue,
          })
        } else {
          cell.content = editValue
        }
      }
      setSelectedCell(null)
    }
    setEditingCell(null)
    setEditValue('')
  }

  const handleColorCell = (color: string) => {
    if (selectedCell) {
      if (isLive && sheetId) {
        upsertCell({
          sheet_id: sheetId,
          row_num: selectedCell.row,
          col_num: selectedCell.col,
          content: getCell(selectedCell.row, selectedCell.col)?.content || '',
          background_color: color,
        }).catch(() => {})
      } else {
        const cell = getCell(selectedCell.row, selectedCell.col)
        if (cell) cell.color = color
      }
      showToast('单元格已标色')
      setSelectedCell(null)
    }
  }

  const handleTip = (amount: number) => {
    showToast(`🍉 打赏了 ${amount} 个瓜子！`)
  }

  const handleScreenshot = () => {
    showToast('📷 本瓜条限时存在，仅可截图留存')
  }

  const handleCreatePoster = () => {
    if (!posterText || !posterStart || !posterEnd) return
    const minRow = Math.min(posterStart.row, posterEnd.row)
    const minCol = Math.min(posterStart.col, posterEnd.col)
    const maxRow = Math.max(posterStart.row, posterEnd.row)
    const maxCol = Math.max(posterStart.col, posterEnd.col)
    const spanRows = maxRow - minRow + 1
    const spanCols = maxCol - minCol + 1

    if (isLive && sheetId) {
      upsertCell({
        sheet_id: sheetId,
        row_num: minRow,
        col_num: minCol,
        content: '',
        is_poster: true,
        poster_text: posterText,
        span_rows: spanRows,
        span_cols: spanCols,
        background_color: '#E8F5E9',
      }).catch(() => {})
    } else if (!isLive) {
      currentCells.push({
        row: minRow,
        col: minCol,
        content: '',
        isPoster: true,
        span: { rows: spanRows, cols: spanCols },
        color: '#E8F5E9',
        posterText,
      })
    }

    setPosterMode(false)
    setPosterStart(null)
    setPosterEnd(null)
    setShowPosterInput(false)
    setPosterText('')
    showToast('大字报已创建！')
  }

  const handleAddContent = () => {
    for (let r = 1; r <= ROWS; r++) {
      const cell = getCell(r, 2) as any
      const hasContent = isLive ? cell?.content : cell?.content
      if (!hasContent) {
        if (gridRef.current) {
          const rowEl = gridRef.current.querySelector(`[data-row="${r}"]`)
          rowEl?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
        setEditingCell({ row: r, col: 2 })
        setEditValue('')
        return
      }
    }
    showToast('格子已满')
  }

  const cellPositionToLabel = (row: number, col: number) => `${COLUMN_LABELS[col - 1] || '?'}${row}`

  const getModalCellData = () => {
    if (!modalCell) return null
    const cell = getCell(modalCell.row, modalCell.col) as any
    const content = isLive ? cell?.content : cell?.content
    const color = isLive ? cell?.background_color : cell?.color
    return {
      position: cellPositionToLabel(modalCell.row, modalCell.col),
      content: content || '',
      color,
    }
  }

  const modalData = getModalCellData()

  // Render cells for mock mode
  const renderMockCells = () => {
    const cellMap = new Map<string, any>()
    currentCells.forEach((cell: any) => {
      cellMap.set(`${cell.row},${cell.col}`, cell)
    })

    return Array.from({ length: ROWS }).map((_, rowIdx) => {
      const rowNumber = rowIdx + 1
      let skipRow = false
      for (const cell of currentCells) {
        if (cell.isPoster && cell.span) {
          if (rowNumber > cell.row && rowNumber <= cell.row + cell.span.rows - 1 && cell.col <= 1) {
            if (cell.col + cell.span.cols - 1 >= 1) { skipRow = true; break }
          }
        }
      }
      if (skipRow) return null

      return (
        <div key={rowIdx} className="flex border-b border-gray-200" data-row={rowNumber}>
          <div className="flex-shrink-0 w-10 min-h-[36px] flex items-center justify-center bg-gray-50 text-xs text-gray-400 border-r border-gray-200">{rowNumber}</div>
          {Array.from({ length: COLS }).map((_, colIdx) => {
            const colNumber = colIdx + 1
            const cell = cellMap.get(`${rowNumber},${colNumber}`)
            const isSelected = selectedCell?.row === rowNumber && selectedCell?.col === colNumber
            const isEditing = editingCell?.row === rowNumber && editingCell?.col === colNumber

            if (cell?.isPoster && cell.span) {
              return (
                <div key={colIdx} style={{ width: cell.span.cols * 96, minHeight: cell.span.rows * 36 + 8 }} className="bg-white border-r border-gray-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center p-2.5 text-center" style={{ backgroundColor: cell.color || '#E8F5E9' }}>
                    <div className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-line">{cell.posterText}</div>
                  </div>
                </div>
              )
            }

            let isCoveredByPoster = false
            for (const c of currentCells) {
              if (c.isPoster && c.span && rowNumber >= c.row && rowNumber < c.row + c.span.rows && colNumber >= c.col && colNumber < c.col + c.span.cols) {
                isCoveredByPoster = true; break
              }
            }
            if (isCoveredByPoster) return null

            return (
              <div key={colIdx} className={`flex-shrink-0 w-24 min-h-[36px] border-r border-gray-200 cursor-pointer transition-colors relative ${isSelected ? 'ring-2 ring-green-500 ring-inset z-10' : ''}`} style={{ backgroundColor: cell?.color || 'white' }} onClick={() => handleCellClick(rowNumber, colNumber)}>
                {isEditing ? (
                  <input autoFocus className="w-full h-full px-1.5 py-1 text-sm text-gray-700 outline-none bg-white border-2 border-green-500" placeholder="输入内容..." value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleCellSave} onKeyDown={(e) => { if (e.key === 'Enter') handleCellSave() }} />
                ) : (
                  <div className="px-1.5 py-1 text-sm text-gray-700 break-words leading-5">{cell?.content || ''}</div>
                )}
              </div>
            )
          })}
        </div>
      )
    })
  }

  // Render cells for live (Supabase) mode
  const renderLiveCells = () => {
    return Array.from({ length: ROWS }).map((_, rowIdx) => {
      const rowNumber = rowIdx + 1
      const rowCells = currentCells.filter((c: any) => c.row_num === rowNumber)

      // Check if row is covered by a poster
      let coveredByPoster = false
      for (const c of cells) {
        if (c.is_poster && c.span_rows) {
          if (rowNumber > c.row_num && rowNumber < c.row_num + c.span_rows && c.col_num <= 1) {
            coveredByPoster = true
          }
        }
      }
      if (coveredByPoster) return null

      return (
        <div key={rowIdx} className="flex border-b border-gray-200" data-row={rowNumber}>
          <div className="flex-shrink-0 w-10 min-h-[36px] flex items-center justify-center bg-gray-50 text-xs text-gray-400 border-r border-gray-200">{rowNumber}</div>
          {Array.from({ length: COLS }).map((_, colIdx) => {
            const colNumber = colIdx + 1
            const cell = cells.find((c) => c.row_num === rowNumber && c.col_num === colNumber)
            const isSelected = selectedCell?.row === rowNumber && selectedCell?.col === colNumber
            const isEditing = editingCell?.row === rowNumber && editingCell?.col === colNumber

            if (cell?.is_poster && cell.span_cols) {
              return (
                <div key={colIdx} style={{ width: cell.span_cols * 96, minHeight: cell.span_rows ? cell.span_rows * 36 + 8 : 44 }} className="bg-white border-r border-gray-200 overflow-hidden flex-shrink-0">
                  <div className="w-full h-full flex items-center justify-center p-2.5 text-center" style={{ backgroundColor: cell.background_color || '#E8F5E9' }}>
                    <div className="text-sm font-bold text-gray-700 leading-relaxed whitespace-pre-line">{cell.poster_text}</div>
                  </div>
                </div>
              )
            }

            let coveredByPoster = false
            for (const c of cells) {
              if (c.is_poster && c.span_cols && c.span_rows &&
                  rowNumber >= c.row_num && rowNumber < c.row_num + c.span_rows &&
                  colNumber >= c.col_num && colNumber < c.col_num + c.span_cols) {
                coveredByPoster = true; break
              }
            }
            if (coveredByPoster) return null

            return (
              <div key={colIdx} className={`flex-shrink-0 w-24 min-h-[36px] border-r border-gray-200 cursor-pointer transition-colors relative ${isSelected ? 'ring-2 ring-green-500 ring-inset z-10' : ''}`} style={{ backgroundColor: cell?.background_color || 'white' }} onClick={() => handleCellClick(rowNumber, colNumber)}>
                {isEditing ? (
                  <input autoFocus className="w-full h-full px-1.5 py-1 text-sm text-gray-700 outline-none bg-white border-2 border-green-500" placeholder="输入内容..." value={editValue} onChange={(e) => setEditValue(e.target.value)} onBlur={handleCellSave} onKeyDown={(e) => { if (e.key === 'Enter') handleCellSave() }} />
                ) : (
                  <div className="px-1.5 py-1 text-sm text-gray-700 break-words leading-5">{cell?.content || ''}</div>
                )}
              </div>
            )
          })}
        </div>
      )
    })
  }

  if (!mockData && !isLive) {
    if (loading) {
      return (
        <div className="h-full flex flex-col bg-white p-4 animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          <div className="h-8 bg-gray-200 rounded w-full mb-2" />
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-5/6 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-2/3" />
        </div>
      )
    }
    return <div className="h-full flex items-center justify-center text-gray-400">瓜条不存在</div>
  }

  const title = mockData?.title || ''
  const creator = mockData?.creator || ''
  const displayOnline = isLive ? onlineCount : (mockData?.onlineCount || 0)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Top bar */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 py-2">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="text-gray-500 text-lg">←</button>
            <h1 className="font-semibold text-gray-800 text-sm truncate max-w-[120px]">{title}</h1>
            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex-shrink-0">限时瓜</span>
            {isLive && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">LIVE</span>}
          </div>
          <div className="flex items-center gap-2">
            <AvatarStack count={displayOnline} />
            <button onClick={handleScreenshot} className="text-gray-400 text-sm hover:text-gray-600 transition-colors">📷</button>
            <button className="text-gray-400 text-sm hover:text-gray-600 transition-colors">⋯</button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400 flex items-center gap-1">👤 {creator}</span>
          <span className="text-red-500 font-mono font-medium">⏳ {formatTime(mockData?.retentionRemaining || 86400)}</span>
        </div>
      </div>

      {/* Poster mode banner */}
      {posterMode && (
        <div className="flex-shrink-0 bg-orange-50 border-b border-orange-200 px-3 py-1.5 flex items-center justify-between">
          <span className="text-xs text-orange-700">{posterStart ? '点击对角完成范围选择' : '点击起始单元格开始选择'}</span>
          <button onClick={() => { setPosterMode(false); setPosterStart(null); setPosterEnd(null) }} className="text-xs text-orange-500 font-medium">取消</button>
        </div>
      )}

      {showPosterInput && (
        <div className="flex-shrink-0 bg-white border-b border-gray-100 px-3 py-2">
          <textarea autoFocus className="w-full border border-green-300 rounded-lg p-2 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-green-500" rows={3} placeholder="输入大字报内容..." value={posterText} onChange={(e) => setPosterText(e.target.value)} />
          <div className="flex gap-2 mt-1.5 justify-end">
            <button onClick={() => { setShowPosterInput(false); setPosterMode(false); setPosterStart(null) }} className="text-xs px-3 py-1 rounded text-gray-500 border border-gray-200">取消</button>
            <button onClick={handleCreatePoster} className="text-xs px-3 py-1 rounded bg-orange-500 text-white font-medium">创建大字报</button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto bg-white" ref={gridRef}>
        <div className="flex-shrink-0 px-2 py-1 text-xs text-gray-400 bg-gray-50 border-b border-gray-100 flex items-center gap-1">
          <span className="w-4 h-4 rounded-full bg-green-400 text-[8px] flex items-center justify-center text-white">🐹</span>
          {nickname} 正在编辑...
        </div>

        <div className="min-w-fit grid-no-select">
          <div className="flex sticky top-0 bg-white z-10 border-b border-gray-200">
            <div className="flex-shrink-0 w-10 h-8 flex items-center justify-center bg-gray-50 text-xs text-gray-400 border-r border-gray-200" />
            {COLUMN_LABELS.slice(0, COLS).map((label, i) => (
              <div key={i} className="flex-shrink-0 w-24 h-8 flex items-center justify-center bg-gray-50 text-xs text-gray-500 font-medium border-r border-gray-200">{label}</div>
            ))}
          </div>
          {isLive ? renderLiveCells() : renderMockCells()}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 border-t border-gray-100">
        {selectedCell && (
          <div className="px-3 py-2 bg-white border-b border-gray-100 flex gap-1.5 overflow-x-auto">
            <div className="flex gap-1 flex-shrink-0">
              {BG_COLORS.map((color) => (
                <button key={color} className="w-7 h-7 rounded border border-gray-200 flex-shrink-0 hover:scale-110 transition-transform" style={{ backgroundColor: color }} onClick={() => handleColorCell(color)} />
              ))}
            </div>
            <div className="w-px bg-gray-200 mx-1 flex-shrink-0" />
            <button onClick={() => setModalCell(selectedCell)} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100 flex-shrink-0">👍 互动</button>
            <button onClick={() => { setTipTarget('cell'); setShowTip(true) }} className="text-xs text-gray-500 px-2 py-1 rounded hover:bg-gray-100 flex-shrink-0">🍉 打赏</button>
            <button onClick={() => { setPosterMode(true); setPosterStart(null); setPosterEnd(null); setSelectedCell(null) }} className="text-xs text-orange-600 px-2 py-1 rounded hover:bg-orange-50 flex-shrink-0">大字报</button>
          </div>
        )}

        <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50">
          <div className="flex gap-1">
            {['吃瓜区', '证据区'].map((name, i) => (
              <button key={i} onClick={() => setActiveSheet(i)} className={`text-xs px-3 py-1 rounded ${activeSheet === i ? 'bg-white text-green-700 font-medium shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}>
                {i === 0 ? '🟢 ' : '📎 '}{name}
              </button>
            ))}
          </div>
          <button onClick={handleAddContent} className="text-xs text-green-600 font-medium hover:text-green-700">+ 新增内容</button>
        </div>
      </div>

      {/* Modals */}
      {modalData && (
        <CellInteractionModal cellPosition={modalData.position} cellContent={modalData.content} cellColor={modalData.color} onClose={() => setModalCell(null)} onTip={() => { setModalCell(null); setTipTarget('cell'); setShowTip(true) }} />
      )}

      {showTip && (
        <TipModal balance={100} onClose={() => setShowTip(false)} onConfirm={handleTip} />
      )}

      <Toast message={toast.message} visible={toast.visible} onClose={() => setToast({ ...toast, visible: false })} />
    </div>
  )
}
