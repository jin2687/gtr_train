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
 * Judgment area: columns 0-1, rows 0-2 (bottom-left)
 *
 *   col0  col1
 *  +----+----+
 *  | A  |    |  row 2   ← L-shape top
 *  | A  | A  |  row 1   ← L-shape bottom
 *  | B  | B  |  row 0   ← zabuton (cushion)
 *  +----+----+
 *
 * - L-shape color A: col0 rows 1-2, col1 row 1 (3 connected)
 * - Zabuton color B: col0 row 0, col1 row 0 (2 connected)
 * - A ≠ B
 */
export function checkLeftGTR(board: PuyoBoard): boolean {
  const c00 = board.getCell(0, 0) // col0 row0 = B (zabuton)
  const c01 = board.getCell(0, 1) // col0 row1 = A (L-shape)
  const c02 = board.getCell(0, 2) // col0 row2 = A (L-shape top)
  const c10 = board.getCell(1, 0) // col1 row0 = B (zabuton)
  const c11 = board.getCell(1, 1) // col1 row1 = A (L-shape)

  // All 5 cells must be filled
  if (
    c00 === PuyoColor.NONE ||
    c01 === PuyoColor.NONE ||
    c02 === PuyoColor.NONE ||
    c10 === PuyoColor.NONE ||
    c11 === PuyoColor.NONE
  ) {
    return false
  }

  // L-shape color A: col0 rows 1-2 and col1 row 1 must match
  const colorA = c01
  if (c02 !== colorA || c11 !== colorA) return false

  // Zabuton color B: col0 row 0 and col1 row 0 must match
  if (c00 !== c10) return false

  // A ≠ B
  if (colorA === c00) return false

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
