export const BOARD_WIDTH = 6
export const BOARD_HEIGHT = 13

export const PuyoColor = {
  NONE: 0,
  RED: 1,
  BLUE: 2,
  GREEN: 3,
  YELLOW: 4,
} as const

export type PuyoColor = (typeof PuyoColor)[keyof typeof PuyoColor]

export const PUYO_COLORS = [
  PuyoColor.RED,
  PuyoColor.BLUE,
  PuyoColor.GREEN,
  PuyoColor.YELLOW,
] as const

/** A pair of puyos (axis + child) */
export interface TsumoPair {
  axis: PuyoColor
  child: PuyoColor
}

/** Rotation: 0=up, 1=right, 2=down, 3=left (child relative to axis) */
export type Rotation = 0 | 1 | 2 | 3

/** A placement command for a tsumo pair */
export interface Placement {
  x: number       // column of axis puyo (0-based)
  rotation: Rotation
}

/** Grid is stored as grid[y][x], y=0 is bottom row */
export type Grid = PuyoColor[][]
