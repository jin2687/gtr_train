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
    // Correct GTR: L-shape (RED) + zabuton (BLUE)
    //   col0  col1
    //   [R]         row 2
    //   [R]   [R]   row 1
    //   [B]   [B]   row 0
    board.grid[0][0] = PuyoColor.BLUE   // zabuton
    board.grid[1][0] = PuyoColor.RED    // L-shape
    board.grid[2][0] = PuyoColor.RED    // L-shape top
    board.grid[0][1] = PuyoColor.BLUE   // zabuton
    board.grid[1][1] = PuyoColor.RED    // L-shape
    expect(checkLeftGTR(board)).toBe(true)
  })

  it('detects valid GTR with extra puyo on col1 row2', () => {
    const board = new PuyoBoard()
    // GTR is valid even if col1 row2 has a puyo
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[2][1] = PuyoColor.GREEN  // extra puyo, doesn't break GTR
    expect(checkLeftGTR(board)).toBe(true)
  })

  it('returns false when zabuton colors differ', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.GREEN  // different from col0 zabuton
    board.grid[1][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when zabuton is same color as L-shape', () => {
    const board = new PuyoBoard()
    // All same color = A == B
    board.grid[0][0] = PuyoColor.RED
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.RED
    board.grid[1][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when L-shape colors differ', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.GREEN  // wrong: should be RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })
})

describe('solveGTR', () => {
  it('solves a trivial case with correct GTR shape', () => {
    // Correct GTR needs: col0=[B,A,A], col1=[B,A] = 3xA + 2xB
    // Use: BB pair for zabuton, RR pair for L-shape row 1, R? for col0 row 2
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.BLUE, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
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

  it('solves with specific tsumos and verifies correct GTR shape', () => {
    // Zabuton (BB) comes first so it can land at the bottom,
    // then L-shape puyos stack on top
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.BLUE, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.YELLOW },
      { axis: PuyoColor.YELLOW, child: PuyoColor.YELLOW },
    ]
    const result = solveGTR(tsumos)
    expect(result).not.toBeNull()
    if (result) {
      const board = new PuyoBoard()
      for (let i = 0; i < result.placements.length; i++) {
        board.placePair(tsumos[i], result.placements[i])
      }
      expect(checkLeftGTR(board)).toBe(true)
      // Verify correct GTR shape:
      // Zabuton: col0 row0 and col1 row0 same color
      expect(board.getCell(0, 0)).toBe(board.getCell(1, 0))
      // L-shape: col0 row1, col0 row2, col1 row1 same color
      expect(board.getCell(0, 1)).toBe(board.getCell(0, 2))
      expect(board.getCell(0, 1)).toBe(board.getCell(1, 1))
      // A ≠ B
      expect(board.getCell(0, 0)).not.toBe(board.getCell(0, 1))
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
