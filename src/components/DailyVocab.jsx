import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

function DailyVocab() {
    const [words, setWords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [model, setModel] = useState(() => localStorage.getItem("model") || "mistralai/mistral-7b-instruct");
    const BASE_PROMPT =
        "Donne-moi exactement 5 mots anglais utiles du quotidien dans ce format :\n\nMot anglais → traduction française : définition simple.\nPas de numérotation, juste 5 lignes au bon format.";
    const [contextPrompt, setContextPrompt] = useState(() => localStorage.getItem("contextPrompt") || "");

    const handleModelChange = (e) => {
        const selectedModel = e.target.value;
        setModel(selectedModel);
        localStorage.setItem("model", selectedModel);
    };

    const handleContextChange = (e) => {
        const newPrompt = e.target.value;
        setContextPrompt(newPrompt);
        localStorage.setItem("contextPrompt", newPrompt);
    };

    const fetchWordData = async (attempt = 1) => {
        setLoading(true);
        try {
            const res = await fetch("/.netlify/functions/getVocab", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    prompt: `${BASE_PROMPT}${contextPrompt ? "\n\n" + contextPrompt : ""}`,
                }),
            });
            const data = await res.json();

            const text = data.content;
            const lines = text.split("\n").filter((l) => l.trim().length > 0);
            console.log(`🧪 Tentative ${attempt} — lignes analysées :`, lines);

            const parsers = [
                line => {
                    const match = line.match(/^\d+\.\s*(.+?)\s*→\s*(.+?)\s*:\s*(.+)$/);
                    return match && {
                        word: match[1].trim(),
                        translation: match[2].trim(),
                        definition: match[3].trim(),
                    };
                },
                line => {
                    const match = line.match(/^(.+?)\s*\((.+?)\)\s*:\s*(.+)$/);
                    return match && {
                        word: match[1].trim(),
                        translation: match[2].trim(),
                        definition: match[3].trim(),
                    };
                },
                line => {
                    const match = line.match(/^(.+?)\s*→\s*(.+?)\s*-\s*(.+)$/);
                    return match && {
                        word: match[1].trim(),
                        translation: match[2].trim(),
                        definition: match[3].trim(),
                    };
                },
                line => {
                    const match = line.match(/^(.+?)\s*:\s*(.+?)\s*-\s*(.+)$/);
                    return match && {
                        word: match[1].trim(),
                        translation: match[2].trim(),
                        definition: match[3].trim(),
                    };
                },
                line => {
                    const match = line.match(/^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)$/);
                    return match && {
                        word: match[1].trim(),
                        translation: match[2].trim(),
                        definition: match[3].trim(),
                    };
                }
            ];

            let parsed = [];

            for (const parser of parsers) {
                const results = lines
                    .map(parser)
                    .filter(Boolean)
                    .filter(({ word, translation, definition }) =>
                        /[a-zA-Z]/.test(word) &&
                        /[a-zA-Z]/.test(translation) &&
                        /[a-zA-Z]/.test(definition)
                    );
                if (results.length >= 3) {
                    parsed = results;
                    break;
                }
            }

            if (parsed.length === 0) {
                if (attempt < 5) {
                    console.warn(`❌ Aucun mot trouvé. Nouvelle tentative (${attempt + 1}/5)...`);
                    return await fetchWordData(attempt + 1);
                } else {
                    toast.error("Aucun mot n’a pu être extrait après 5 tentatives.");
                    setWords([]);
                }
            } else {
                setWords(parsed);
            }
        } catch (err) {
            console.error("Erreur lors de la récupération des mots :", err);
            toast.error("Erreur lors de la récupération du vocabulaire.");
            setWords([]);
        } finally {
            setLoading(false);
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        fetchWordData();
    }, []);

    return (
        <div style={{padding: "2rem", fontFamily: "Arial"}}>
            <h1 style={{fontSize: "2rem", marginBottom: "1rem"}}>
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
                    Aucun mot n’a pu être trouvé.
                </div>
            ) : (
                words.map(({word, translation, definition}, index) => (
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
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                height: "100%",
                                gap: "1rem"
                            }}
                        >
                            <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "center"}}>
                                <div style={{textAlign: "center"}}>
                                    <strong>{word}</strong> → {translation}
                                </div>
                                <div style={{textAlign: "center", marginTop: "0.5rem"}}>
                                    <em>{definition}</em>
                                </div>
                            </div>
                            <button
                                onClick={() => speak(word)}
                                style={{
                                    padding: "0.5rem",
                                    borderRadius: "50%",
                                    border: "none",
                                    backgroundColor: "#3498db",
                                    color: "#fff",
                                    cursor: "pointer",
                                    fontSize: "1rem"
                                }}
                                title="Écouter le mot"
                            >
                                🔊
                            </button>
                        </div>
                    </div>
                ))
            )}
            <button onClick={() => fetchWordData(1)} style={{marginTop: "1rem"}}>
                🔁 Rafraîchir
            </button>

            <div style={{marginBottom: "1rem", marginTop: "1rem"}}>
                <label style={{fontWeight: "bold"}}>🧠 Modèle :</label>
                <select value={model} onChange={handleModelChange} style={{marginLeft: "1rem"}}>
                    <option value="mistralai/mistral-7b-instruct">Mistral 7B</option>
                    <option value="openai/gpt-3.5-turbo">GPT-3.5</option>
                    <option value="openai/gpt-4">GPT-4</option>
                </select>
            </div>

            <div style={{marginBottom: "1rem"}}>
                <label style={{fontWeight: "bold", display: "block"}}>📋 Contexte personnalisé :</label>
                <textarea
                    rows="4"
                    style={{width: "100%", padding: "0.5rem"}}
                    placeholder="Exemple : Donne des mots liés à la cuisine ou au voyage."
                    value={contextPrompt}
                    onChange={handleContextChange}
                />
            </div>


            {/* Le conteneur à afficher pour les toasts */}
            <ToastContainer position="top-center"/>
        </div>
    );
}

export default DailyVocab;
