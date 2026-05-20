import SubBoard from "./SubBoard";

export default function Board({
  boards,
  subBoardWinners,
  activeBoard,
  onMove,
  disabled,
}) {
  return (
    <div className="board-grid">
      {boards.map((cells, boardIndex) => (
        <SubBoard
          key={boardIndex}
          boardIndex={boardIndex}
          cells={cells}
          winner={subBoardWinners[boardIndex]}
          isActive={!subBoardWinners[boardIndex] && (activeBoard === null || activeBoard === boardIndex)}
          onCellClick={disabled ? undefined : onMove}
        />
      ))}
    </div>
  );
}