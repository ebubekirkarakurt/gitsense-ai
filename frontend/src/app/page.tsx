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
    <main className="flex-1 p-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-2">GitSense</h1>
      <p className="text-gray-500 mb-6">
        Git diff'ini yapıştır, AI commit mesajı üretsin.
      </p>

      <div className="mb-4">
        <label className="block text-sm text-gray-500 mb-2">Dosya yükle</label>
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
          className="text-sm"
        />
      </div>

      <textarea
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        placeholder="git diff çıktısını buraya yapıştır..."
        className="w-full h-48 border rounded-lg p-4 text-sm font-mono placeholder-gray-400 focus:outline-none focus:border-blue-500 mb-4 resize-none"
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
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <code className="text-sm text-green-600">{suggestion}</code>
            <button
              onClick={() => navigator.clipboard.writeText(suggestion)}
              className="ml-4 text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded transition"
            >
              Kopyala
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
