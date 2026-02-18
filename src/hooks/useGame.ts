import { useState, useCallback, useEffect } from 'react'
import { PuyoBoard } from '../core/PuyoBoard'
import {
  PuyoColor,
  BOARD_WIDTH,
  BOARD_HEIGHT,
  type TsumoPair,
  type Placement,
  type Rotation,
} from '../core/types'
import { checkLeftGTR, generateSolvableTsumos, type SolverResult } from '../core/GTRSolver'

export interface FallingPiece {
  x: number
  rotation: Rotation
  pair: TsumoPair
}

export interface GhostPosition {
  axisX: number
  axisY: number
  childX: number
  childY: number
  axisColor: PuyoColor
  childColor: PuyoColor
}

interface GameState {
  board: PuyoBoard
  tsumos: TsumoPair[]
  solution: SolverResult
  currentTsumoIndex: number
  fallingPiece: FallingPiece
  successCount: number
  failCount: number
  ghost: GhostPosition | null
}

function computeGhost(
  board: PuyoBoard,
  piece: FallingPiece
): GhostPosition | null {
  const { x, rotation, pair } = piece
  const { dx, dy } = PuyoBoard.childOffset(rotation)
  const childX = x + dx

  if (x < 0 || x >= BOARD_WIDTH) return null
  if (childX < 0 || childX >= BOARD_WIDTH) return null

  let axisY: number
  let childY: number

  if (dx === 0) {
    const h = board.columnHeight(x)
    if (h + 2 > BOARD_HEIGHT) return null
    if (dy > 0) {
      axisY = h
      childY = h + 1
    } else {
      childY = h
      axisY = h + 1
    }
  } else {
    axisY = board.columnHeight(x)
    childY = board.columnHeight(childX)
    if (axisY >= BOARD_HEIGHT || childY >= BOARD_HEIGHT) return null
  }

  return {
    axisX: x,
    axisY,
    childX,
    childY,
    axisColor: pair.axis,
    childColor: pair.child,
  }
}

function computeSolutionGhost(
  board: PuyoBoard,
  tsumos: TsumoPair[],
  solution: SolverResult,
  currentIndex: number
): GhostPosition | null {
  if (currentIndex >= solution.placements.length) return null
  const placement = solution.placements[currentIndex]
  const pair = tsumos[currentIndex]
  return computeGhost(board, {
    x: placement.x,
    rotation: placement.rotation,
    pair,
  })
}

function initGameState(): GameState {
  const { tsumos, solution } = generateSolvableTsumos()
  const board = new PuyoBoard()
  const fallingPiece: FallingPiece = {
    x: 2,
    rotation: 0,
    pair: tsumos[0],
  }
  const ghost = computeSolutionGhost(board, tsumos, solution, 0)
  return {
    board,
    tsumos,
    solution,
    currentTsumoIndex: 0,
    fallingPiece,
    successCount: 0,
    failCount: 0,
    ghost,
  }
}

export function useGame() {
  const [state, setState] = useState<GameState>(initGameState)

  const startNewRound = useCallback(() => {
    setState((prev) => {
      const { tsumos, solution } = generateSolvableTsumos()
      const board = new PuyoBoard()
      const fallingPiece: FallingPiece = {
        x: 2,
        rotation: 0,
        pair: tsumos[0],
      }
      const ghost = computeSolutionGhost(board, tsumos, solution, 0)
      return {
        ...prev,
        board,
        tsumos,
        solution,
        currentTsumoIndex: 0,
        fallingPiece,
        ghost,
      }
    })
  }, [])

  const dropPiece = useCallback(() => {
    setState((prev) => {
      const { board, fallingPiece, tsumos, solution, currentTsumoIndex } = prev
      const placement: Placement = {
        x: fallingPiece.x,
        rotation: fallingPiece.rotation,
      }

      const boardCopy = board.clone()
      const valid = boardCopy.placePair(fallingPiece.pair, placement)

      if (!valid) {
        // Invalid placement: count as fail, start new round
        const { tsumos: newTsumos, solution: newSolution } = generateSolvableTsumos()
        const newBoard = new PuyoBoard()
        const newFalling: FallingPiece = {
          x: 2,
          rotation: 0,
          pair: newTsumos[0],
        }
        return {
          ...prev,
          board: newBoard,
          tsumos: newTsumos,
          solution: newSolution,
          currentTsumoIndex: 0,
          fallingPiece: newFalling,
          failCount: prev.failCount + 1,
          ghost: computeSolutionGhost(newBoard, newTsumos, newSolution, 0),
        }
      }

      const nextIndex = currentTsumoIndex + 1

      // Check if GTR is complete
      if (checkLeftGTR(boardCopy)) {
        const { tsumos: newTsumos, solution: newSolution } = generateSolvableTsumos()
        const newBoard = new PuyoBoard()
        const newFalling: FallingPiece = {
          x: 2,
          rotation: 0,
          pair: newTsumos[0],
        }
        return {
          ...prev,
          board: newBoard,
          tsumos: newTsumos,
          solution: newSolution,
          currentTsumoIndex: 0,
          fallingPiece: newFalling,
          successCount: prev.successCount + 1,
          ghost: computeSolutionGhost(newBoard, newTsumos, newSolution, 0),
        }
      }

      // All 4 tsumos used but GTR not complete = fail
      if (nextIndex >= tsumos.length) {
        const { tsumos: newTsumos, solution: newSolution } = generateSolvableTsumos()
        const newBoard = new PuyoBoard()
        const newFalling: FallingPiece = {
          x: 2,
          rotation: 0,
          pair: newTsumos[0],
        }
        return {
          ...prev,
          board: newBoard,
          tsumos: newTsumos,
          solution: newSolution,
          currentTsumoIndex: 0,
          fallingPiece: newFalling,
          failCount: prev.failCount + 1,
          ghost: computeSolutionGhost(newBoard, newTsumos, newSolution, 0),
        }
      }

      // Move to next tsumo
      const newFalling: FallingPiece = {
        x: 2,
        rotation: 0,
        pair: tsumos[nextIndex],
      }
      return {
        ...prev,
        board: boardCopy,
        currentTsumoIndex: nextIndex,
        fallingPiece: newFalling,
        ghost: computeSolutionGhost(boardCopy, tsumos, solution, nextIndex),
      }
    })
  }, [])

  const moveLeft = useCallback(() => {
    setState((prev) => {
      const piece = prev.fallingPiece
      const { dx } = PuyoBoard.childOffset(piece.rotation)
      const newX = piece.x - 1
      const childX = newX + dx
      if (newX < 0 || newX >= BOARD_WIDTH || childX < 0 || childX >= BOARD_WIDTH) {
        return prev
      }
      return {
        ...prev,
        fallingPiece: { ...piece, x: newX },
      }
    })
  }, [])

  const moveRight = useCallback(() => {
    setState((prev) => {
      const piece = prev.fallingPiece
      const { dx } = PuyoBoard.childOffset(piece.rotation)
      const newX = piece.x + 1
      const childX = newX + dx
      if (newX < 0 || newX >= BOARD_WIDTH || childX < 0 || childX >= BOARD_WIDTH) {
        return prev
      }
      return {
        ...prev,
        fallingPiece: { ...piece, x: newX },
      }
    })
  }, [])

  const rotateRight = useCallback(() => {
    setState((prev) => {
      const piece = prev.fallingPiece
      const newRotation = ((piece.rotation + 1) % 4) as Rotation
      const { dx } = PuyoBoard.childOffset(newRotation)
      const childX = piece.x + dx
      // Wall kick
      let x = piece.x
      if (childX < 0) x = piece.x + 1
      else if (childX >= BOARD_WIDTH) x = piece.x - 1
      const finalChildX = x + dx
      if (x < 0 || x >= BOARD_WIDTH || finalChildX < 0 || finalChildX >= BOARD_WIDTH) {
        return prev
      }
      return {
        ...prev,
        fallingPiece: { ...piece, x, rotation: newRotation },
      }
    })
  }, [])

  const rotateLeft = useCallback(() => {
    setState((prev) => {
      const piece = prev.fallingPiece
      const newRotation = ((piece.rotation + 3) % 4) as Rotation
      const { dx } = PuyoBoard.childOffset(newRotation)
      const childX = piece.x + dx
      let x = piece.x
      if (childX < 0) x = piece.x + 1
      else if (childX >= BOARD_WIDTH) x = piece.x - 1
      const finalChildX = x + dx
      if (x < 0 || x >= BOARD_WIDTH || finalChildX < 0 || finalChildX >= BOARD_WIDTH) {
        return prev
      }
      return {
        ...prev,
        fallingPiece: { ...piece, x, rotation: newRotation },
      }
    })
  }, [])

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          moveLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          moveRight()
          break
        case 'ArrowUp':
        case 'x':
          e.preventDefault()
          rotateRight()
          break
        case 'z':
          e.preventDefault()
          rotateLeft()
          break
        case 'ArrowDown':
        case ' ':
          e.preventDefault()
          dropPiece()
          break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [moveLeft, moveRight, rotateRight, rotateLeft, dropPiece])

  // Compute the player's ghost (landing preview)
  const playerGhost = computeGhost(state.board, state.fallingPiece)

  // Get next tsumos for display
  const nextTsumos = state.tsumos.slice(
    state.currentTsumoIndex + 1,
    state.currentTsumoIndex + 4
  )

  return {
    grid: state.board.grid,
    fallingPiece: state.fallingPiece,
    playerGhost,
    solutionGhost: state.ghost,
    nextTsumos,
    successCount: state.successCount,
    failCount: state.failCount,
    currentTsumoIndex: state.currentTsumoIndex,
    totalTsumos: state.tsumos.length,
    moveLeft,
    moveRight,
    rotateRight,
    rotateLeft,
    dropPiece,
    startNewRound,
  }
}
