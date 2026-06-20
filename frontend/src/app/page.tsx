"use client";

import { useState } from "react";

export default function Home() {
  const [diff, setDiff] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!diff) return;
    setLoading(true);

    const response = await fetch("http://localhost:3001/api/commit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ diff }),
    });

    const data = await response.json();
    setSuggestions(data.suggestions || []);

    setLoading(false);
  };

  return (
    <main>
      <h1>GitSense</h1>
      <textarea
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        placeholder="git diff çıktısını buraya yapıştır..."
      />
      <button onClick={handleSubmit}>Analiz Et</button>
      {suggestions.map((suggestion, index) => (
        <div key={index}>
          <p>{suggestion}</p>
          <button onClick={() => navigator.clipboard.writeText(suggestion)}>
            Kopyala
          </button>
        </div>
      ))}
    </main>
  );
}
