import { useState, useEffect } from "react";
import Game from "./components/Game";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="app-root">
      <Game darkMode={darkMode} setDarkMode={setDarkMode} />
    </div>
  );
}
