import { BOARD_WIDTH, BOARD_HEIGHT, PuyoColor, type Grid } from '../core/types'
import type { GhostPosition } from '../hooks/useGame'
import { PuyoCell } from './PuyoCell'

interface BoardProps {
  grid: Grid
  playerGhost: GhostPosition | null
  solutionGhost: GhostPosition | null
}

export function Board({ grid, playerGhost, solutionGhost }: BoardProps) {
  const cells: React.ReactNode[] = []

  // Render from top (y=12) to bottom (y=0)
  for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const key = `${x}-${y}`
      const cellColor = grid[y][x]
      const isGtrZone = x <= 1 && y <= 2

      // Check if this cell has a solution ghost
      let isSolutionGhost = false
      let solutionColor: PuyoColor = PuyoColor.NONE
      if (solutionGhost) {
        if (solutionGhost.axisX === x && solutionGhost.axisY === y) {
          isSolutionGhost = true
          solutionColor = solutionGhost.axisColor
        }
        if (solutionGhost.childX === x && solutionGhost.childY === y) {
          isSolutionGhost = true
          solutionColor = solutionGhost.childColor
        }
      }

      // Check if this cell has a player ghost
      let isPlayerGhost = false
      let ghostColor: PuyoColor = PuyoColor.NONE
      if (playerGhost) {
        if (playerGhost.axisX === x && playerGhost.axisY === y) {
          isPlayerGhost = true
          ghostColor = playerGhost.axisColor
        }
        if (playerGhost.childX === x && playerGhost.childY === y) {
          isPlayerGhost = true
          ghostColor = playerGhost.childColor
        }
      }

      if (cellColor !== PuyoColor.NONE) {
        cells.push(
          <PuyoCell key={key} color={cellColor} isGtrZone={isGtrZone} />
        )
      } else if (isPlayerGhost) {
        cells.push(
          <PuyoCell key={key} color={ghostColor} ghost isGtrZone={isGtrZone} />
        )
      } else if (isSolutionGhost) {
        cells.push(
          <PuyoCell key={key} color={solutionColor} solution isGtrZone={isGtrZone} />
        )
      } else {
        cells.push(
          <PuyoCell key={key} color={PuyoColor.NONE} isGtrZone={isGtrZone} />
        )
      }
    }
  }

  return <div className="board">{cells}</div>
}
