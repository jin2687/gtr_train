interface ControlsProps {
  onMoveLeft: () => void
  onMoveRight: () => void
  onRotateLeft: () => void
  onRotateRight: () => void
  onDrop: () => void
}

export function Controls({
  onMoveLeft,
  onMoveRight,
  onRotateLeft,
  onRotateRight,
  onDrop,
}: ControlsProps) {
  return (
    <div className="controls">
      <button className="ctrl-btn" onPointerDown={onRotateLeft}>
        ↺
      </button>
      <button className="ctrl-btn" onPointerDown={onMoveLeft}>
        ←
      </button>
      <button className="ctrl-btn" onPointerDown={onMoveRight}>
        →
      </button>
      <button className="ctrl-btn" onPointerDown={onRotateRight}>
        ↻
      </button>
      <button className="ctrl-btn ctrl-btn-drop" onPointerDown={onDrop}>
        DROP
      </button>
    </div>
  )
}
