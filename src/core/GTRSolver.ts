import { PuyoBoard } from './PuyoBoard'
import {
  BOARD_WIDTH,
  PuyoColor,
  type Placement,
  type Rotation,
  type TsumoPair,
} from './types'

/**
 * Left GTR success condition:
 *
 * Judgment area: columns 0-1, rows 0-2 (bottom-left 2x3)
 *
 *   col0  col1
 *  +----+----+
 *  | A  | A  |  row 2
 *  | A  | A  |  row 1
 *  | A  | B  |  row 0
 *  +----+----+
 *
 * - Column 0 (x=0): bottom 3 cells are same color A
 * - Column 1 (x=1): bottom cell is color B (zabuton), top 2 are color A
 * - A ≠ B
 */
export function checkLeftGTR(board: PuyoBoard): boolean {
  const a0 = board.getCell(0, 0)
  const a1 = board.getCell(0, 1)
  const a2 = board.getCell(0, 2)
  const b0 = board.getCell(1, 0)
  const b1 = board.getCell(1, 1)
  const b2 = board.getCell(1, 2)

  // All must be filled
  if (
    a0 === PuyoColor.NONE ||
    a1 === PuyoColor.NONE ||
    a2 === PuyoColor.NONE ||
    b0 === PuyoColor.NONE ||
    b1 === PuyoColor.NONE ||
    b2 === PuyoColor.NONE
  ) {
    return false
  }

  const colorA = a0

  // Column 0: all three must be colorA
  if (a1 !== colorA || a2 !== colorA) return false

  // Column 1: bottom is colorB, top two are colorA
  if (b1 !== colorA || b2 !== colorA) return false

  // colorB (zabuton) must differ from colorA
  if (b0 === colorA) return false

  return true
}

/** Generate all valid placements for a tsumo pair */
function generatePlacements(pair: TsumoPair): Placement[] {
  const placements: Placement[] = []
  const rotations: Rotation[] = [0, 1, 2, 3]

  for (const rotation of rotations) {
    const { dx } = PuyoBoard.childOffset(rotation)
    for (let x = 0; x < BOARD_WIDTH; x++) {
      const childX = x + dx
      if (childX < 0 || childX >= BOARD_WIDTH) continue
      // Skip duplicate: rotation 2 (child below) in same column as rotation 0 (child above)
      // They produce different stacking so both are valid
      // However, if axis == child, rotations 0 and 2 are identical, and 1 and 3 are identical
      if (pair.axis === pair.child) {
        if (rotation === 2 || rotation === 3) continue
      }
      placements.push({ x, rotation })
    }
  }

  return placements
}

export interface SolverResult {
  placements: Placement[]
}

/**
 * DFS solver: given up to 4 tsumo pairs, find a sequence of placements
 * that results in a valid left GTR.
 *
 * We only care about the 2x3 judgment area for success.
 * Uses pruning: if any column in the judgment area already exceeds
 * what's needed, we can skip.
 */
export function solveGTR(
  tsumos: TsumoPair[],
  board?: PuyoBoard
): SolverResult | null {
  const startBoard = board ?? new PuyoBoard()
  const result: Placement[] = []

  function dfs(index: number, currentBoard: PuyoBoard): boolean {
    // Check if GTR is already complete
    if (checkLeftGTR(currentBoard)) {
      return true
    }

    // No more tsumos to place
    if (index >= tsumos.length) {
      return false
    }

    const pair = tsumos[index]
    const placements = generatePlacements(pair)

    for (const placement of placements) {
      const boardCopy = currentBoard.clone()
      const valid = boardCopy.placePair(pair, placement)
      if (!valid) continue

      // Pruning: check if placement area columns are not overfilled
      // Column 0 should have at most 3, Column 1 should have at most 3
      // for the GTR area. But we allow other columns to fill freely.
      const h0 = boardCopy.columnHeight(0)
      const h1 = boardCopy.columnHeight(1)
      if (h0 > 3 || h1 > 3) {
        // If GTR area columns are already too tall, skip unless GTR is already done
        if (!checkLeftGTR(boardCopy)) continue
      }

      result.push(placement)
      if (dfs(index + 1, boardCopy)) {
        return true
      }
      result.pop()
    }

    return false
  }

  if (dfs(0, startBoard)) {
    return { placements: result }
  }

  return null
}

/** Generate a random tsumo pair */
export function randomTsumo(): TsumoPair {
  const colors = [PuyoColor.RED, PuyoColor.BLUE, PuyoColor.GREEN, PuyoColor.YELLOW]
  return {
    axis: colors[Math.floor(Math.random() * 4)],
    child: colors[Math.floor(Math.random() * 4)],
  }
}

/**
 * Generate 4 tsumo pairs that are guaranteed to have a GTR solution.
 * Keeps generating until a solvable set is found.
 */
export function generateSolvableTsumos(): {
  tsumos: TsumoPair[]
  solution: SolverResult
} {
  for (;;) {
    const tsumos = Array.from({ length: 4 }, () => randomTsumo())
    const solution = solveGTR(tsumos)
    if (solution) {
      return { tsumos, solution }
    }
  }
}
