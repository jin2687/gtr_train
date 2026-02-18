import { PuyoColor, type TsumoPair } from '../core/types'

const colorClassMap: Record<PuyoColor, string> = {
  [PuyoColor.NONE]: '',
  [PuyoColor.RED]: 'puyo-red',
  [PuyoColor.BLUE]: 'puyo-blue',
  [PuyoColor.GREEN]: 'puyo-green',
  [PuyoColor.YELLOW]: 'puyo-yellow',
}

interface NextQueueProps {
  tsumos: TsumoPair[]
}

export function NextQueue({ tsumos }: NextQueueProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-label">NEXT</div>
      {tsumos.map((pair, i) => (
        <div key={i} className="next-pair">
          <div className="next-cell">
            <div className={`puyo ${colorClassMap[pair.child]}`} />
          </div>
          <div className="next-cell">
            <div className={`puyo ${colorClassMap[pair.axis]}`} />
          </div>
        </div>
      ))}
    </div>
  )
}
