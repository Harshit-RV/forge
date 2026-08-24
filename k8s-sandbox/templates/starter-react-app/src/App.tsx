import { useState } from "react";

export function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="app">
      <span className="badge">sandbox</span>
      <h1>Forge</h1>
      <p className="hint">
        This React app is running inside its own Kubernetes pod, served by Vite
        and exposed through a Forge preview URL.
      </p>
      <button onClick={() => setCount((value) => value + 1)}>
        count is {count}
      </button>
    </main>
  );
}
