import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  PuyoColor,
  type Grid,
  type Placement,
  type TsumoPair,
  type Rotation,
} from './types'

export class PuyoBoard {
  grid: Grid

  constructor(grid?: Grid) {
    this.grid = grid ?? PuyoBoard.createEmptyGrid()
  }

  static createEmptyGrid(): Grid {
    return Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => PuyoColor.NONE)
    )
  }

  clone(): PuyoBoard {
    const newGrid = this.grid.map((row) => [...row])
    return new PuyoBoard(newGrid)
  }

  getCell(x: number, y: number): PuyoColor {
    if (x < 0 || x >= BOARD_WIDTH || y < 0 || y >= BOARD_HEIGHT) {
      return PuyoColor.NONE
    }
    return this.grid[y][x]
  }

  /** Get the height of puyos stacked in column x (0-based from bottom) */
  columnHeight(x: number): number {
    for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.grid[y][x] !== PuyoColor.NONE) {
        return y + 1
      }
    }
    return 0
  }

  /** Drop a single puyo into column x, returns the y it lands at or -1 if full */
  dropPuyo(x: number, color: PuyoColor): number {
    const h = this.columnHeight(x)
    if (h >= BOARD_HEIGHT) return -1
    this.grid[h][x] = color
    return h
  }

  /**
   * Get the child puyo's offset relative to axis for a given rotation.
   * Rotation: 0=up(0,+1), 1=right(+1,0), 2=down(0,-1), 3=left(-1,0)
   */
  static childOffset(rotation: Rotation): { dx: number; dy: number } {
    switch (rotation) {
      case 0: return { dx: 0, dy: 1 }
      case 1: return { dx: 1, dy: 0 }
      case 2: return { dx: 0, dy: -1 }
      case 3: return { dx: -1, dy: 0 }
    }
  }

  /**
   * Place a tsumo pair on the board.
   * Returns true if placement was valid, false otherwise.
   */
  placePair(pair: TsumoPair, placement: Placement): boolean {
    const { x, rotation } = placement
    const { dx, dy } = PuyoBoard.childOffset(rotation)
    const childX = x + dx

    // Validate x range
    if (x < 0 || x >= BOARD_WIDTH) return false
    if (childX < 0 || childX >= BOARD_WIDTH) return false

    if (dx === 0) {
      // Vertical placement: both land in same column
      const h = this.columnHeight(x)
      if (h + 2 > BOARD_HEIGHT) return false

      if (dy > 0) {
        // child on top: axis first, then child
        this.grid[h][x] = pair.axis
        this.grid[h + 1][x] = pair.child
      } else {
        // child below: child first, then axis
        this.grid[h][x] = pair.child
        this.grid[h + 1][x] = pair.axis
      }
    } else {
      // Horizontal placement: each in their own column
      const hAxis = this.columnHeight(x)
      const hChild = this.columnHeight(childX)
      if (hAxis >= BOARD_HEIGHT || hChild >= BOARD_HEIGHT) return false

      this.grid[hAxis][x] = pair.axis
      this.grid[hChild][childX] = pair.child
    }

    return true
  }

  /** Check if the board is empty */
  isEmpty(): boolean {
    for (let y = 0; y < BOARD_HEIGHT; y++) {
      for (let x = 0; x < BOARD_WIDTH; x++) {
        if (this.grid[y][x] !== PuyoColor.NONE) return false
      }
    }
    return true
  }

  /** Reset the board to empty */
  reset(): void {
    this.grid = PuyoBoard.createEmptyGrid()
  }
}
