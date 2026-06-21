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
    <main className="min-h-screen bg-gray-950 text-white p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">GitSense</h1>
      <p className="text-gray-400 mb-6">
        Git diff'ini yapıştır, AI commit mesajı üretsin.
      </p>

      <input
        type="file"
        accept=".txt"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (event) => setDiff(event.target?.result as string);
          reader.readAsText(file);
        }}
        className="mb-4 text-sm text-gray-400"
      />

      <textarea
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        placeholder="git diff çıktısını buraya yapıştır..."
        className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 mb-4"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !diff}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition mb-8"
      >
        {loading ? "Analiz ediliyor..." : "Analiz Et"}
      </button>

      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div
            key={index}
            className="bg-gray-900 border border-gray-700 rounded-lg p-4 flex justify-between items-center"
          >
            <code className="text-green-400 text-sm">{suggestion}</code>
            <button
              onClick={() => navigator.clipboard.writeText(suggestion)}
              className="ml-4 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded transition"
            >
              Kopyala
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
