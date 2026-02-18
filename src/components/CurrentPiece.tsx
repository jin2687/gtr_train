import { BOARD_WIDTH, PuyoColor } from '../core/types'
import { PuyoBoard } from '../core/PuyoBoard'
import type { FallingPiece } from '../hooks/useGame'

interface CurrentPieceProps {
  piece: FallingPiece
}

const colorClassMap: Record<PuyoColor, string> = {
  [PuyoColor.NONE]: '',
  [PuyoColor.RED]: 'puyo-red',
  [PuyoColor.BLUE]: 'puyo-blue',
  [PuyoColor.GREEN]: 'puyo-green',
  [PuyoColor.YELLOW]: 'puyo-yellow',
}

export function CurrentPiece({ piece }: CurrentPieceProps) {
  const { dx, dy } = PuyoBoard.childOffset(piece.rotation)
  const childX = piece.x + dx

  // We display 2 rows x 6 cols above the board
  // Row 0 (top) = display row for higher puyo, Row 1 (bottom) = lower puyo
  // Map axis at (piece.x, 0) and child relative to it
  const cells: React.ReactNode[] = []

  // Determine positions in the 2-row display
  // Axis is at row=1 (bottom), child relative to axis
  type PuyoPos = { x: number; row: number; color: PuyoColor }
  const puyos: PuyoPos[] = []

  if (dx === 0) {
    // Vertical
    if (dy > 0) {
      puyos.push({ x: piece.x, row: 1, color: piece.pair.axis })
      puyos.push({ x: piece.x, row: 0, color: piece.pair.child })
    } else {
      puyos.push({ x: piece.x, row: 0, color: piece.pair.axis })
      puyos.push({ x: piece.x, row: 1, color: piece.pair.child })
    }
  } else {
    // Horizontal - both on bottom row
    puyos.push({ x: piece.x, row: 1, color: piece.pair.axis })
    puyos.push({ x: childX, row: 1, color: piece.pair.child })
  }

  for (let row = 0; row < 2; row++) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const puyo = puyos.find((p) => p.x === x && p.row === row)
      if (puyo) {
        cells.push(
          <div key={`${x}-${row}`} className="current-piece-cell">
            <div className={`puyo ${colorClassMap[puyo.color]}`} />
          </div>
        )
      } else {
        cells.push(<div key={`${x}-${row}`} className="current-piece-cell" />)
      }
    }
  }

  return <div className="current-piece-area">{cells}</div>
}
