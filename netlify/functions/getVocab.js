const fetch = require("node-fetch");

exports.handler = async function (event, context) {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    {
                        role: "user",
                        content:
                            "Donne-moi 5 mots anglais utiles du quotidien avec leur traduction en français et une définition simple (format structuré lisible facilement).",
                    },
                ],
            }),
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify({ content: data.choices[0].message.content }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Erreur backend OpenRouter" }),
        };
    }
};
