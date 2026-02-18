import { describe, it, expect } from 'vitest'
import { PuyoBoard } from './PuyoBoard'
import { PuyoColor, type TsumoPair } from './types'
import { checkLeftGTR, solveGTR, generateSolvableTsumos } from './GTRSolver'

describe('checkLeftGTR', () => {
  it('returns false for empty board', () => {
    const board = new PuyoBoard()
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('detects valid left GTR', () => {
    const board = new PuyoBoard()
    // Column 0: 3x RED (rows 0,1,2)
    board.grid[0][0] = PuyoColor.RED
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    // Column 1: BLUE at row 0, RED at rows 1,2
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[2][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(true)
  })

  it('returns false when zabuton is same color as A', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.RED
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    // zabuton is also RED = invalid
    board.grid[0][1] = PuyoColor.RED
    board.grid[1][1] = PuyoColor.RED
    board.grid[2][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when column 0 colors differ', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.RED
    board.grid[1][0] = PuyoColor.BLUE // wrong
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.GREEN
    board.grid[1][1] = PuyoColor.RED
    board.grid[2][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when column 1 top two differ from column 0', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.RED
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.GREEN // wrong
    board.grid[2][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })
})

describe('solveGTR', () => {
  it('solves a trivial case: 4 same-color pairs + 1 different', () => {
    // 3 RED pairs vertically on col 0 = 6 REDs, but we only need 5 REDs + 1 other
    // Actually: we need col0=[A,A,A], col1=[B,A,A] = 5xA + 1xB
    // Let's use: RR, RR, RB where R placed col0 and B+R placed col1
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
    ]
    const result = solveGTR(tsumos)
    expect(result).not.toBeNull()
    if (result) {
      // Verify solution: apply placements to board and check
      const board = new PuyoBoard()
      for (let i = 0; i < result.placements.length; i++) {
        board.placePair(tsumos[i], result.placements[i])
      }
      expect(checkLeftGTR(board)).toBe(true)
    }
  })

  it('returns null for impossible tsumos', () => {
    // All same color - can never satisfy A ≠ B condition
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
    ]
    const result = solveGTR(tsumos)
    expect(result).toBeNull()
  })

  it('solves with specific tsumos and verifies board state', () => {
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.GREEN, child: PuyoColor.GREEN },
      { axis: PuyoColor.GREEN, child: PuyoColor.YELLOW },
      { axis: PuyoColor.GREEN, child: PuyoColor.GREEN },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
    ]
    const result = solveGTR(tsumos)
    expect(result).not.toBeNull()
    if (result) {
      const board = new PuyoBoard()
      for (let i = 0; i < result.placements.length; i++) {
        board.placePair(tsumos[i], result.placements[i])
      }
      expect(checkLeftGTR(board)).toBe(true)
    }
  })
})

describe('generateSolvableTsumos', () => {
  it('generates a solvable set of tsumos', () => {
    const { tsumos, solution } = generateSolvableTsumos()
    expect(tsumos.length).toBe(4)
    expect(solution.placements.length).toBeGreaterThan(0)

    // Verify solution is actually valid
    const board = new PuyoBoard()
    for (let i = 0; i < solution.placements.length; i++) {
      board.placePair(tsumos[i], solution.placements[i])
    }
    expect(checkLeftGTR(board)).toBe(true)
  })
})
