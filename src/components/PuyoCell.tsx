import { PuyoColor } from '../core/types'

const colorClassMap: Record<PuyoColor, string> = {
  [PuyoColor.NONE]: '',
  [PuyoColor.RED]: 'puyo-red',
  [PuyoColor.BLUE]: 'puyo-blue',
  [PuyoColor.GREEN]: 'puyo-green',
  [PuyoColor.YELLOW]: 'puyo-yellow',
}

interface PuyoCellProps {
  color: PuyoColor
  ghost?: boolean
  solution?: boolean
  isGtrZone?: boolean
}

export function PuyoCell({ color, ghost, solution, isGtrZone }: PuyoCellProps) {
  const zoneClass = isGtrZone ? ' gtr-zone' : ''
  const cellClass = `cell${zoneClass}`

  if (color === PuyoColor.NONE) {
    return <div className={cellClass} />
  }

  let puyoClass = `puyo ${colorClassMap[color]}`
  if (ghost) puyoClass += ' puyo-ghost'
  if (solution) puyoClass += ' puyo-solution'

  return (
    <div className={cellClass}>
      <div className={puyoClass} />
    </div>
  )
}
