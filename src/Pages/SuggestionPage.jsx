// src/Pages/SuggestionPage.jsx
export default function SuggestionPage() {
  const [list, setList] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("suggestions");
    if (raw) setList(JSON.parse(raw));
  }, []);

  const exportTxt = () => {
    const text = list.map((l, i) => `${i + 1}. ${l.text}  (${l.date})`).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "suggestions.txt";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📥 Saran Viewer</h1>
      <button onClick={exportTxt} className="glass-button px-4 py-2 rounded-full mb-6">Export .txt</button>
      <div className="space-y-3 max-w-3xl mx-auto">
        {list.length ? (
          list.map((l, i) => (
            <div key={i} className="glass-card rounded-lg p-4">
              <div className="text-xs text-white/60 mb-1">{l.date}</div>
              <div>{l.text}</div>
            </div>
          ))
        ) : (
          <p className="text-white/60">Belum ada saran.</p>
        )}
      </div>
    </div>
  );
}

