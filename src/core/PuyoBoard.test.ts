import { describe, it, expect } from 'vitest'
import { PuyoBoard } from './PuyoBoard'
import { PuyoColor, BOARD_WIDTH, BOARD_HEIGHT } from './types'

describe('PuyoBoard', () => {
  it('creates an empty grid of correct size', () => {
    const board = new PuyoBoard()
    expect(board.grid.length).toBe(BOARD_HEIGHT)
    expect(board.grid[0].length).toBe(BOARD_WIDTH)
    expect(board.isEmpty()).toBe(true)
  })

  it('drops a puyo into an empty column', () => {
    const board = new PuyoBoard()
    const y = board.dropPuyo(0, PuyoColor.RED)
    expect(y).toBe(0)
    expect(board.getCell(0, 0)).toBe(PuyoColor.RED)
  })

  it('stacks puyos correctly', () => {
    const board = new PuyoBoard()
    board.dropPuyo(0, PuyoColor.RED)
    board.dropPuyo(0, PuyoColor.BLUE)
    board.dropPuyo(0, PuyoColor.GREEN)
    expect(board.getCell(0, 0)).toBe(PuyoColor.RED)
    expect(board.getCell(0, 1)).toBe(PuyoColor.BLUE)
    expect(board.getCell(0, 2)).toBe(PuyoColor.GREEN)
    expect(board.columnHeight(0)).toBe(3)
  })

  it('returns -1 when column is full', () => {
    const board = new PuyoBoard()
    for (let i = 0; i < BOARD_HEIGHT; i++) {
      board.dropPuyo(0, PuyoColor.RED)
    }
    expect(board.dropPuyo(0, PuyoColor.RED)).toBe(-1)
  })

  it('places a vertical pair (rotation 0, child on top)', () => {
    const board = new PuyoBoard()
    const ok = board.placePair(
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { x: 2, rotation: 0 }
    )
    expect(ok).toBe(true)
    expect(board.getCell(2, 0)).toBe(PuyoColor.RED)
    expect(board.getCell(2, 1)).toBe(PuyoColor.BLUE)
  })

  it('places a vertical pair (rotation 2, child below)', () => {
    const board = new PuyoBoard()
    const ok = board.placePair(
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { x: 2, rotation: 2 }
    )
    expect(ok).toBe(true)
    expect(board.getCell(2, 0)).toBe(PuyoColor.BLUE)
    expect(board.getCell(2, 1)).toBe(PuyoColor.RED)
  })

  it('places a horizontal pair (rotation 1, child right)', () => {
    const board = new PuyoBoard()
    const ok = board.placePair(
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { x: 2, rotation: 1 }
    )
    expect(ok).toBe(true)
    expect(board.getCell(2, 0)).toBe(PuyoColor.RED)
    expect(board.getCell(3, 0)).toBe(PuyoColor.BLUE)
  })

  it('places a horizontal pair (rotation 3, child left)', () => {
    const board = new PuyoBoard()
    const ok = board.placePair(
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { x: 2, rotation: 3 }
    )
    expect(ok).toBe(true)
    expect(board.getCell(2, 0)).toBe(PuyoColor.RED)
    expect(board.getCell(1, 0)).toBe(PuyoColor.BLUE)
  })

  it('rejects out of bounds placement', () => {
    const board = new PuyoBoard()
    expect(board.placePair(
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { x: 5, rotation: 1 } // child would be at x=6
    )).toBe(false)
    expect(board.placePair(
      { axis: PuyoColor.RED, child: PuyoColor.BLUE },
      { x: 0, rotation: 3 } // child would be at x=-1
    )).toBe(false)
  })

  it('clones correctly', () => {
    const board = new PuyoBoard()
    board.dropPuyo(0, PuyoColor.RED)
    const cloned = board.clone()
    cloned.dropPuyo(0, PuyoColor.BLUE)
    expect(board.columnHeight(0)).toBe(1)
    expect(cloned.columnHeight(0)).toBe(2)
  })

  it('resets to empty', () => {
    const board = new PuyoBoard()
    board.dropPuyo(0, PuyoColor.RED)
    board.reset()
    expect(board.isEmpty()).toBe(true)
  })
})
