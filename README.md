# Super Tic-Tac-Toe

Super Tic-Tac-Toe is a React + Vite web game that extends classic Tic-Tac-Toe into a larger 3x3 grid of sub-boards. Players compete to win three sub-boards in a row, while each move determines the next active sub-board.

## Features

- Local Player vs Player mode
- Player vs AI and AI vs AI modes
- Difficulty settings: `easy`, `intermediate`, and `hard`
- Sub-board win/draw detection
- Macro-board win/draw detection
- Responsive game board with dark mode

## Project structure

- `frontend/`
  - `src/`
    - `components/`
      - `Game.jsx` — main game logic, mode switching, AI turn handling
      - `Board.jsx` — renders the 3x3 board of sub-boards
      - `SubBoard.jsx` — renders each sub-board and active highlighting
      - `Cell.jsx` — individual cell component
    - `utils/`
      - `ai.js` — AI move logic for all difficulty levels
      - `checkWinner.js` — winner and board-full utility functions
  - `package.json` — project scripts and dependencies
  - `vite.config.js` — Vite build config
  - `tailwind.config.js` — Tailwind CSS config

## AI difficulty logic

- `easy`: selects a random valid move
- `intermediate`: attempts an immediate win, then blocks an opponent win, otherwise chooses randomly
- `hard`: uses minimax search with alpha-beta pruning and a heuristic board evaluation

## Getting started

### Prerequisites

- Node.js 20+ recommended
- npm, pnpm, or yarn installed

### Install dependencies

```bash
cd frontend
pnpm install
```

### Run development server

```bash
cd frontend
pnpm dev
```

Then open the address shown in the terminal (typically `http://localhost:5173`).

### Build for production

```bash
cd frontend
pnpm build
```

### Preview production build

```bash
cd frontend
pnpm preview
```

## Notes

- Difficulty can only be changed before the game starts.
- In `pvc` mode, the AI plays as `O`.
- The `hard` AI evaluates macro-board control as well as local sub-board threats.

## License

This repository does not include a license file. Add one if you want to publish or share the project publicly.
