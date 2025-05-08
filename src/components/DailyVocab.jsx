import { useEffect, useState } from "react";

function DailyVocab() {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWordData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/.netlify/functions/getVocab");
            const data = await res.json();
            console.log(data);

            const text = data.content;

            // Parsing du texte généré par le LLM
            const lines = text.split("\n").filter((l) => l.trim().length > 0);
            const parsed = lines
                .map((line) => {
                    const match = line.match(/^\d+\.?\s*(.+?)\s*→\s*(.+?)\s*:\s*(.+)$/);
                    if (match) {
                        return {
                            word: match[1].trim(),
                            translation: match[2].trim(),
                            definition: match[3].trim(),
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            setWords(parsed);
        } catch (err) {
            console.error("Erreur lors de la récupération des mots :", err);
            setWords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWordData();
    }, []);

    return (
        <div style={{ padding: "2rem", fontFamily: "Arial" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>
                Vocabulaire du jour
            </h1>
            {loading ? (
                <p>Chargement...</p>
            ) : (
                words.map(({ word, translation, definition }, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: "1rem",
                            padding: "1rem",
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            background: "#f9f9f9",
                            color: "#000",
                        }}
                    >
                        <strong>{word}</strong> → {translation}
                        <br />
                        <em>{definition}</em>
                    </div>
                ))
            )}
            <button onClick={fetchWordData} style={{ marginTop: "1rem" }}>
                🔁 Rafraîchir
            </button>
        </div>
    );
}

export default DailyVocab;
