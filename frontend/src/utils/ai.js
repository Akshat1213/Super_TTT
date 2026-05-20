import { checkWinner, isBoardFull } from './checkWinner.js';

/**
 * Get all valid moves for a given state
 */
function getValidMoves(boards, subBoardWinners, activeBoard) {
  const moves = [];
  
  if (activeBoard !== null) {
    // Can only play in the active board
    const board = boards[activeBoard];
    for (let i = 0; i < 9; i++) {
      if (board[i] === null && !subBoardWinners[activeBoard]) {
        moves.push({ boardIndex: activeBoard, cellIndex: i });
      }
    }
  } else {
    // Can play in any open board
    for (let b = 0; b < 9; b++) {
      if (subBoardWinners[b]) continue; // Skip won/full boards
      const board = boards[b];
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          moves.push({ boardIndex: b, cellIndex: i });
        }
      }
    }
  }
  
  return moves;
}

/**
 * Easy AI: Random valid move
 */
export function getEasyMove(boards, subBoardWinners, activeBoard) {
  const moves = getValidMoves(boards, subBoardWinners, activeBoard);
  if (moves.length === 0) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Intermediate AI: Try to win, block opponent, or random
 */
export function getIntermediateMove(boards, subBoardWinners, activeBoard, player) {
  const moves = getValidMoves(boards, subBoardWinners, activeBoard);
  if (moves.length === 0) return null;

  const opponent = player === 'X' ? 'O' : 'X';

  for (const move of moves) {
    // Try to win on this move
    const testBoard = [...boards[move.boardIndex]];
    testBoard[move.cellIndex] = player;
    if (checkWinner(testBoard) === player) {
      return move;
    }
  }

  for (const move of moves) {
    // Block opponent from winning
    const testBoard = [...boards[move.boardIndex]];
    testBoard[move.cellIndex] = opponent;
    if (checkWinner(testBoard) === opponent) {
      return move;
    }
  }

  // Otherwise random
  return moves[Math.floor(Math.random() * moves.length)];
}

/**
 * Hard AI: Minimax with alpha-beta pruning
 */
const macroLines = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function evaluateBoard(boards, subBoardWinners, maxPlayer = 'X') {
  const opponent = maxPlayer === 'X' ? 'O' : 'X';
  const mapped = subBoardWinners.map(v => (v === 'X' || v === 'O' ? v : null));
  const winner = checkWinner(mapped);

  if (winner === maxPlayer) return 1000;
  if (winner === opponent) return -1000;

  let score = 0;

  // Macro board line potentials
  for (const [a, b, c] of macroLines) {
    const line = [mapped[a], mapped[b], mapped[c]];
    const maxCount = line.filter(v => v === maxPlayer).length;
    const oppCount = line.filter(v => v === opponent).length;

    if (maxCount > 0 && oppCount === 0) {
      score += maxCount === 2 ? 40 : 10;
    }
    if (oppCount > 0 && maxCount === 0) {
      score -= oppCount === 2 ? 35 : 8;
    }
  }

  // Sub-board control and local threats
  subBoardWinners.forEach((winner, index) => {
    const board = boards[index];
    if (winner === maxPlayer) {
      score += 60;
    } else if (winner === opponent) {
      score -= 60;
    } else if (winner !== 'D') {
      for (const [a, b, c] of macroLines) {
        const line = [board[a], board[b], board[c]];
        const maxCount = line.filter(v => v === maxPlayer).length;
        const oppCount = line.filter(v => v === opponent).length;
        if (maxCount > 0 && oppCount === 0) score += maxCount;
        if (oppCount > 0 && maxCount === 0) score -= oppCount;
      }
    }
  });

  return score;
}

function minimax(boards, subBoardWinners, activeBoard, depth, isMaximizing, alpha, beta, maxPlayer = 'X', maxDepth = 4) {
  const score = evaluateBoard(boards, subBoardWinners, maxPlayer);

  if (score >= 1000) return { score: score + (maxDepth - depth), move: null };
  if (score <= -1000) return { score: score - (maxDepth - depth), move: null };
  if (depth === maxDepth) return { score, move: null };

  const allFull = subBoardWinners.every(v => v !== null);
  if (allFull) return { score, move: null };

  const moves = getValidMoves(boards, subBoardWinners, activeBoard);
  if (moves.length === 0) return { score, move: null };

  let bestMove = null;

  if (isMaximizing) {
    let maxScore = -Infinity;
    for (const move of moves) {
      const newBoards = boards.map((b, idx) =>
        idx === move.boardIndex ? b.map((c, cidx) => cidx === move.cellIndex ? maxPlayer : c) : b
      );
      const winner = checkWinner(newBoards[move.boardIndex]);
      const newWinners = [...subBoardWinners];
      if (winner) {
        newWinners[move.boardIndex] = winner;
      } else if (isBoardFull(newBoards[move.boardIndex])) {
        newWinners[move.boardIndex] = 'D';
      }

      const nextActiveBoard = !winner && !newWinners[move.cellIndex] && !isBoardFull(newBoards[move.cellIndex]) ? move.cellIndex : null;
      const result = minimax(newBoards, newWinners, nextActiveBoard, depth + 1, false, alpha, beta, maxPlayer, maxDepth);
      
      if (result.score > maxScore) {
        maxScore = result.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, result.score);
      if (beta <= alpha) break;
    }
    return { score: maxScore, move: bestMove };
  } else {
    let minScore = Infinity;
    for (const move of moves) {
      const opponent = maxPlayer === 'X' ? 'O' : 'X';
      const newBoards = boards.map((b, idx) =>
        idx === move.boardIndex ? b.map((c, cidx) => cidx === move.cellIndex ? opponent : c) : b
      );
      const winner = checkWinner(newBoards[move.boardIndex]);
      const newWinners = [...subBoardWinners];
      if (winner) {
        newWinners[move.boardIndex] = winner;
      } else if (isBoardFull(newBoards[move.boardIndex])) {
        newWinners[move.boardIndex] = 'D';
      }

      const nextActiveBoard = !winner && !newWinners[move.cellIndex] && !isBoardFull(newBoards[move.cellIndex]) ? move.cellIndex : null;
      const result = minimax(newBoards, newWinners, nextActiveBoard, depth + 1, true, alpha, beta, maxPlayer, maxDepth);
      
      if (result.score < minScore) {
        minScore = result.score;
        bestMove = move;
      }
      beta = Math.min(beta, result.score);
      if (beta <= alpha) break;
    }
    return { score: minScore, move: bestMove };
  }
}

export function getHardMove(boards, subBoardWinners, activeBoard, currentPlayer = 'X') {
  const result = minimax(boards, subBoardWinners, activeBoard, 0, true, -Infinity, Infinity, currentPlayer);
  return result.move;
}

export function getAIMove(boards, subBoardWinners, activeBoard, difficulty, currentPlayer = 'X') {
  if (difficulty === 'easy') {
    return getEasyMove(boards, subBoardWinners, activeBoard);
  } else if (difficulty === 'intermediate') {
    return getIntermediateMove(boards, subBoardWinners, activeBoard, currentPlayer);
  } else if (difficulty === 'hard') {
    return getHardMove(boards, subBoardWinners, activeBoard, currentPlayer);
  }
  return null;
}