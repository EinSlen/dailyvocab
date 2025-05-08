const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("❌ Clé API manquante.");
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Clé API manquante." }),
            };
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "user",
                        content:
                            "Donne-moi exactement 5 mots anglais utiles du quotidien dans ce format :\n\nMot anglais → traduction française : définition simple.\nPas de numérotation, juste 5 lignes au bon format.",
                    },
                ],
            }),
        });

        const data = await response.json();
        console.log("🔍 Réponse OpenRouter :", JSON.stringify(data, null, 2));

        if (!data.choices || !data.choices[0]?.message?.content) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: "Réponse invalide d’OpenRouter." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ content: data.choices[0].message.content }),
        };
    } catch (err) {
        console.error("💥 Erreur backend OpenRouter :", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur backend OpenRouter" }),
        };
    }
};
