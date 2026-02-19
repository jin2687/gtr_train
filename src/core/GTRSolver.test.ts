import { describe, it, expect } from 'vitest'
import { PuyoBoard } from './PuyoBoard'
import { PuyoColor, type TsumoPair } from './types'
import { checkLeftGTR, solveGTR, generateSolvableTsumos } from './GTRSolver'

describe('checkLeftGTR', () => {
  it('returns false for empty board', () => {
    const board = new PuyoBoard()
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('detects valid left GTR with col2', () => {
    const board = new PuyoBoard()
    // Correct GTR: L-shape (RED) + zabuton (BLUE) + base (GREEN)
    //   col0  col1  col2
    //   [R]               row 2
    //   [R]   [R]   [B]   row 1
    //   [B]   [B]   [G]   row 0
    board.grid[0][0] = PuyoColor.BLUE   // zabuton
    board.grid[1][0] = PuyoColor.RED    // L-shape
    board.grid[2][0] = PuyoColor.RED    // L-shape top
    board.grid[0][1] = PuyoColor.BLUE   // zabuton
    board.grid[1][1] = PuyoColor.RED    // L-shape
    board.grid[0][2] = PuyoColor.GREEN  // base color C
    board.grid[1][2] = PuyoColor.BLUE   // zabuton extends to col2
    expect(checkLeftGTR(board)).toBe(true)
  })

  it('returns false without col2 puyos (old GTR without base)', () => {
    const board = new PuyoBoard()
    // Only cols 0-1 filled - missing col2
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('detects valid GTR with extra puyo on col1 row2', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[2][1] = PuyoColor.GREEN  // extra puyo on col1 row2
    board.grid[0][2] = PuyoColor.GREEN  // base color C
    board.grid[1][2] = PuyoColor.BLUE   // zabuton extends
    expect(checkLeftGTR(board)).toBe(true)
  })

  it('returns false when zabuton colors differ', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.GREEN  // different from col0 zabuton
    board.grid[1][1] = PuyoColor.RED
    board.grid[0][2] = PuyoColor.YELLOW
    board.grid[1][2] = PuyoColor.BLUE
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when zabuton is same color as L-shape', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.RED
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.RED
    board.grid[1][1] = PuyoColor.RED
    board.grid[0][2] = PuyoColor.GREEN
    board.grid[1][2] = PuyoColor.RED
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when L-shape colors differ', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.GREEN  // wrong: should be RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[0][2] = PuyoColor.YELLOW
    board.grid[1][2] = PuyoColor.BLUE
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when col2 row0 is same as L-shape color', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[0][2] = PuyoColor.RED    // C == A, invalid
    board.grid[1][2] = PuyoColor.BLUE
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when col2 row0 is same as zabuton color', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[0][2] = PuyoColor.BLUE   // C == B, invalid
    board.grid[1][2] = PuyoColor.BLUE
    expect(checkLeftGTR(board)).toBe(false)
  })

  it('returns false when col2 row1 is not zabuton color', () => {
    const board = new PuyoBoard()
    board.grid[0][0] = PuyoColor.BLUE
    board.grid[1][0] = PuyoColor.RED
    board.grid[2][0] = PuyoColor.RED
    board.grid[0][1] = PuyoColor.BLUE
    board.grid[1][1] = PuyoColor.RED
    board.grid[0][2] = PuyoColor.GREEN
    board.grid[1][2] = PuyoColor.RED    // should be BLUE (zabuton)
    expect(checkLeftGTR(board)).toBe(false)
  })
})

describe('solveGTR', () => {
  it('solves a case with correct GTR shape including col2', () => {
    // Need: 3xA(RED) + 3xB(BLUE) + 1xC(GREEN) = 7 puyos, 1 extra(BLUE)
    // BB→zabuton, RR→L-shape col0, RB→col1 row1+extra, GB→col2
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.BLUE, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { axis: PuyoColor.GREEN, child: PuyoColor.BLUE },
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

  it('returns null for impossible tsumos (all same color)', () => {
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
    ]
    const result = solveGTR(tsumos)
    expect(result).toBeNull()
  })

  it('returns null for tsumos with only 2 colors (need 3 distinct)', () => {
    // Only RED and BLUE - can't satisfy C ≠ A and C ≠ B
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
    ]
    const result = solveGTR(tsumos)
    expect(result).toBeNull()
  })

  it('solves with specific tsumos and verifies correct GTR shape', () => {
    const tsumos: TsumoPair[] = [
      { axis: PuyoColor.BLUE, child: PuyoColor.GREEN },
      { axis: PuyoColor.BLUE, child: PuyoColor.BLUE },
      { axis: PuyoColor.RED, child: PuyoColor.RED },
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
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
      const colorA = board.getCell(0, 1) // L-shape
      const colorB = board.getCell(0, 0) // zabuton
      const colorC = board.getCell(2, 0) // base
      // L-shape: col0 row1, col0 row2, col1 row1 all same
      expect(board.getCell(0, 2)).toBe(colorA)
      expect(board.getCell(1, 1)).toBe(colorA)
      // Zabuton: col0 row0, col1 row0, col2 row1 all same
      expect(board.getCell(1, 0)).toBe(colorB)
      expect(board.getCell(2, 1)).toBe(colorB)
      // A ≠ B ≠ C
      expect(colorA).not.toBe(colorB)
      expect(colorC).not.toBe(colorA)
      expect(colorC).not.toBe(colorB)
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
