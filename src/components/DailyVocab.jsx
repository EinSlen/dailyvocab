import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function DailyVocab() {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchWordData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/.netlify/functions/getVocab");
            const data = await res.json();

            const text = data.content;
            const lines = text.split("\n").filter((l) => l.trim().length > 0);
            console.log("🧪 Lignes analysées :", lines);

            const parsed = lines
                .map((line) => {
                    const match = line.match(/^\d+\.\s*(.+?)\s*→\s*(.+?)\s*:\s*(.+)$/);
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

            if (parsed.length === 0) {
                toast.error("Aucun mot n’a pu être extrait du texte.");
            }

            setWords(parsed);
        } catch (err) {
            console.error("Erreur lors de la récupération des mots :", err);
            toast.error("Erreur lors de la récupération du vocabulaire.");
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
            ) : words.length === 0 ? (
                <div
                    style={{
                        padding: "1rem",
                        border: "1px solid #e74c3c",
                        borderRadius: "8px",
                        background: "#fdecea",
                        color: "#c0392b",
                        textAlign: "center",
                        fontWeight: "bold"
                    }}
                >
                    Aucun mot n’a pu être trouvé aujourd’hui.
                </div>
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

            {/* Le conteneur à afficher pour les toasts */}
            <ToastContainer position="top-center" />
        </div>
    );
}

export default DailyVocab;
