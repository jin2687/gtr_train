import { useGame } from './hooks/useGame'
import { Board } from './components/Board'
import { CurrentPiece } from './components/CurrentPiece'
import { NextQueue } from './components/NextQueue'
import { Controls } from './components/Controls'
import './styles.css'

export default function App() {
  const {
    grid,
    fallingPiece,
    playerGhost,
    solutionGhost,
    nextTsumos,
    successCount,
    failCount,
    currentTsumoIndex,
    totalTsumos,
    moveLeft,
    moveRight,
    rotateRight,
    rotateLeft,
    dropPiece,
  } = useGame()

  return (
    <div className="app">
      <h1 className="app-title">Endless GTR Knock</h1>

      <div className="score-bar">
        <span className="score-success">OK: {successCount}</span>
        <span className="score-fail">NG: {failCount}</span>
        <span className="tsumo-counter">
          {currentTsumoIndex + 1} / {totalTsumos}
        </span>
      </div>

      <div className="game-area">
        <div className="board-wrapper">
          <CurrentPiece piece={fallingPiece} />
          <Board
            grid={grid}
            playerGhost={playerGhost}
            solutionGhost={solutionGhost}
          />
        </div>
        <NextQueue tsumos={nextTsumos} />
      </div>

      <Controls
        onMoveLeft={moveLeft}
        onMoveRight={moveRight}
        onRotateLeft={rotateLeft}
        onRotateRight={rotateRight}
        onDrop={dropPiece}
      />

      <div className="help-text">
        PC: Arrow keys to move, Z/X to rotate, Space/Down to drop
      </div>
    </div>
  )
}
