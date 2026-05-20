import { useState, useEffect, useCallback, useRef } from "react";
import Board from "./Board";
import { checkWinner, isBoardFull } from "../utils/checkWinner";
import { getAIMove } from "../utils/ai";

const emptyBoard = () => Array(9).fill(null);

export default function Game({ darkMode, setDarkMode }){
    const [boards, setBoards] = useState(Array.from({ length: 9 }, emptyBoard));
    const [subBoardWinners, setSubBoardWinners] = useState(Array(9).fill(null));
    const [activeBoard, setActiveBoard] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState("X");
    const [overallWinner, setOverallWinner] = useState(null);
    const [xWins, setXWins] = useState(0);
    const [oWins, setOWins] = useState(0);
    const [gameMode, setGameMode] = useState("pvp");
    const [difficulty, setDifficulty] = useState("intermediate");
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [isGameStarted, setIsGameStarted] = useState(false);

    // Determine if current player is AI
    const isCurrentPlayerAI = () => {
        if (gameMode === "pvp") return false;
        if (gameMode === "pvc") return currentPlayer === "O";
        if (gameMode === "cvc") return true; // Both are AI
        return false;
    };

    const makeMove = (boardIndex, cellIndex, player, currentBoards, currentSubBoardWinners, currentActiveBoard) => {
        const newBoards = currentBoards.map((board, bIndex) =>
            bIndex === boardIndex ? board.map((cell, cIndex) => (cIndex === cellIndex ? player : cell)) : board
        );

        const winner = checkWinner(newBoards[boardIndex]);

        const newWinners = [...currentSubBoardWinners];
        if (winner) {
            newWinners[boardIndex] = winner;
        } else if (isBoardFull(newBoards[boardIndex])) {
            newWinners[boardIndex] = 'D';
        }

        let nextActiveBoard = null;

        const targetBoard = cellIndex;
        const targetPlayable = !newWinners[targetBoard] && !isBoardFull(newBoards[targetBoard]);
        if (targetPlayable) {
            nextActiveBoard = targetBoard;
        }

        const mappedForOverall = newWinners.map((v) => (v === "X" || v === "O" ? v : null));
        const overall = checkWinner(mappedForOverall);

        const allSubBoardsDecided = newWinners.every((v) => v !== null);
        const finalOverall = overall ? overall : allSubBoardsDecided ? "D" : null;

        return { newBoards, newWinners, nextActiveBoard, finalOverall };
    };

    const handleMove = useCallback((boardIndex, cellIndex) => {
        if (overallWinner || !isGameStarted) return;
        
        // In pvc mode, prevent moves when it's AI's turn
        if (gameMode === "pvc" && currentPlayer === "O") return;

        if ((activeBoard !== null && boardIndex !== activeBoard) || boards[boardIndex][cellIndex] || subBoardWinners[boardIndex]) {
            return;
        }

        const { newBoards, newWinners, nextActiveBoard, finalOverall } = makeMove(boardIndex, cellIndex, currentPlayer, boards, subBoardWinners, activeBoard);

        setBoards(newBoards);
        setSubBoardWinners(newWinners);
        setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
        setActiveBoard(nextActiveBoard);
        if (finalOverall) {
            setOverallWinner(finalOverall);
            setActiveBoard(null);
            if (finalOverall === "X") {
                setXWins(xWins + 1);
            } else if (finalOverall === "O") {
                setOWins(oWins + 1);
            }
        }
    }, [boards, subBoardWinners, activeBoard, currentPlayer, overallWinner, gameMode, xWins, oWins, isGameStarted]);

    const isThinkingRef = useRef(false);

    useEffect(() => {
        // Don't run if game not started, game over, already thinking, or not AI's turn
        if (!isGameStarted || overallWinner) return;
        if (gameMode === "pvp" || (gameMode === "pvc" && currentPlayer !== "O")) return;
        if (isThinkingRef.current) return;

        isThinkingRef.current = true;
        setIsAIThinking(true);

        const timeout = setTimeout(() => {
            const aiMove = getAIMove(boards, subBoardWinners, activeBoard, difficulty, currentPlayer);
            if (aiMove && !overallWinner && isGameStarted) {
                const { newBoards, newWinners, nextActiveBoard, finalOverall } = makeMove(
                    aiMove.boardIndex, 
                    aiMove.cellIndex, 
                    currentPlayer, 
                    boards, 
                    subBoardWinners, 
                    activeBoard
                );
                setBoards(newBoards);
                setSubBoardWinners(newWinners);
                setCurrentPlayer((p) => (p === "X" ? "O" : "X"));
                setActiveBoard(nextActiveBoard);
                if (finalOverall) {
                    setOverallWinner(finalOverall);
                    if (finalOverall === "X") {
                        setXWins(xWins + 1);
                    } else if (finalOverall === "O") {
                        setOWins(oWins + 1);
                    }
                }
            }
            setIsAIThinking(false);
            isThinkingRef.current = false;
        }, 600);

        return () => {
            clearTimeout(timeout);
            setIsAIThinking(false);
            isThinkingRef.current = false;
        };
    }, [currentPlayer, gameMode, isGameStarted, overallWinner, boards, subBoardWinners, activeBoard, difficulty, xWins, oWins]);

    function startGame() {
        setBoards(Array.from({ length: 9 }, emptyBoard));
        setSubBoardWinners(Array(9).fill(null));
        setActiveBoard(null);
        setCurrentPlayer("X");
        setOverallWinner(null);
        setIsGameStarted(true);
    }

    function resetGame() {
        setIsAIThinking(false);
        setBoards(Array.from({ length: 9 }, emptyBoard));
        setSubBoardWinners(Array(9).fill(null));
        setActiveBoard(null);
        setCurrentPlayer("X");
        setOverallWinner(null);
        setIsGameStarted(false);
    }

    return (
        <div className="wrapper">
        <div className="sidebar left">
                <div className={`sidebar-card ${isGameStarted ? 'disabled' : ''}`}>
                    <strong style={{fontSize: '16px'}}>Mode</strong>
                    <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px'}}>
                        <label style={{display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer'}}>
                            <input type="radio" name="mode" value="pvp" checked={gameMode === "pvp"} disabled={isGameStarted} onChange={() => {
                                setGameMode("pvp");
                            }} />
                            Player vs Player
                        </label>
                        <label style={{display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer'}}>
                            <input type="radio" name="mode" value="pvc" checked={gameMode === "pvc"} disabled={isGameStarted} onChange={() => {
                                setGameMode("pvc");
                            }} />
                            Player vs AI
                        </label>
                        <label style={{display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer'}}>
                            <input type="radio" name="mode" value="cvc" checked={gameMode === "cvc"} disabled={isGameStarted} onChange={() => {
                                setGameMode("cvc");
                            }} />
                            AI vs AI
                        </label>
                    </div>
                </div>

                {(gameMode === "pvc" || gameMode === "cvc") && (
                    <div className={`sidebar-card ${isGameStarted ? 'disabled' : ''}`}>
                        <strong style={{fontSize: '16px'}}>Difficulty</strong>
                        <div style={{marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px'}}>
                            <label style={{display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer'}}>
                                <input type="radio" name="difficulty" value="easy" checked={difficulty === "easy"} disabled={isGameStarted} onChange={() => setDifficulty("easy")} />
                                Easy
                            </label>
                            <label style={{display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer'}}>
                                <input type="radio" name="difficulty" value="intermediate" checked={difficulty === "intermediate"} disabled={isGameStarted} onChange={() => setDifficulty("intermediate")} />
                                Intermediate
                            </label>
                            <label style={{display: 'flex', gap: '6px', fontSize: '13px', cursor: 'pointer'}}>
                                <input type="radio" name="difficulty" value="hard" checked={difficulty === "hard"} disabled={isGameStarted} onChange={() => setDifficulty("hard")} />
                                Hard
                            </label>
                        </div>
                    </div>
                )}

                {!isGameStarted && (
                    <button className="start-btn" onClick={startGame}>
                        Start Game
                    </button>
                )}
                
                {isGameStarted && !overallWinner && (
                    <button className="reset-btn" onClick={resetGame} style={{width: '100%', marginTop: '8px'}}>
                        Reset Game
                    </button>
                )}

                <div className="sidebar-card" style={{display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between'}}>
                    <label style={{fontSize: '14px'}}>Dark Mode</label>
                    <button 
                        className={`toggle-switch ${darkMode ? 'active' : ''}`}
                        onClick={() => setDarkMode(!darkMode)}
                        style={{cursor: 'pointer'}}
                    />
                </div>
            </div>

            {/* Center - Game */}
            <div className="game-container">
                <h1 className="title">Super Tic-Tac-Toe</h1>
                <p className="status">
                    {overallWinner 
                        ? `Winner: ${overallWinner === 'D' ? 'Tie' : overallWinner}` 
                        : isAIThinking
                        ? `AI is thinking...`
                        : `Current Player: ${currentPlayer}${gameMode === "pvc" && currentPlayer === "O" ? " (AI)" : ""}`
                    }
                </p>
                <Board
                    boards={boards}
                    subBoardWinners={subBoardWinners}
                    activeBoard={activeBoard}
                    onMove={handleMove}
                    disabled={isAIThinking}
                />
                {overallWinner && (
                    <div className="game-overlay">
                        <div className="card">
                            <div className="big">{overallWinner === 'D' ? 'Tie' : overallWinner}</div>
                            <div className="sub">Game over</div>
                            <button className="reset-btn" onClick={resetGame}>Play Again</button>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar - Rules and Win Counts */}
            <div className="sidebar right">
                <div className="sidebar-card">
                    <strong style={{fontSize: '16px'}}>How to Play</strong>
                    <div style={{marginTop: '12px', fontSize: '13px', lineHeight: '1.7'}}>
                        <p>• Play on the 3x3 board</p>
                        <p>• Win a sub-board by getting three in a row</p>
                        <p>• Win the game by winning 3 sub-boards in a row</p>
                        <p>• Where you play on a sub-board decides which sub-board you go next</p>
                    </div>
                </div>
                <div className="sidebar-card">
                    <strong style={{fontSize: '16px'}}>Win Count</strong>
                    <div className="win-counter" style={{color: '#dc2626', borderColor: '#dc2626', marginTop: '12px'}}>
                        X: {xWins}
                    </div>
                    <div className="win-counter" style={{color: '#2563eb', borderColor: '#2563eb'}}>
                        O: {oWins}
                    </div>
                </div>
                {overallWinner && (
                    <button className="reset-btn" onClick={resetGame} style={{width: '100%'}}>
                        Play Again
                    </button>
                )}
            </div>
        </div>
    );
}