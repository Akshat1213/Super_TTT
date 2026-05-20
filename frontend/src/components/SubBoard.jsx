import Cell from "./Cell";

export default function SubBoard({
    boardIndex,
    cells,
    winner,
    isActive,
    onCellClick,
}) {
    const classes = ['subboard'];
    if (isActive && !winner) classes.push('active');
    if (winner) classes.push('winner');

    return (
        <div className={classes.join(' ')}>
            {cells.map((value, cellIndex) => (
                <Cell
                    key={cellIndex}
                    value={value}
                    disabled={!isActive || value !== null || winner}
                    onClick={() => onCellClick(boardIndex, cellIndex)}
                />
            ))}

            {winner && (
                <div className="winner-overlay">{winner === 'D' ? 'Tie' : winner}</div>
            )}
        </div>
    );
}