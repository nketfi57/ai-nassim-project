import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { studentName, messages, difficulty, parentNote } = await req.json();

    const diffInstructions = {
      Facile: "L'élève a des difficultés. Sois ultra-pédagogue, décompose au maximum, utilise des mots simples et donne des indices évidents sans jamais donner la réponse finale.",
      Moyen: "Niveau standard. Pousse l'élève à réfléchir en lui posant des questions de logique par étapes.",
      Difficile: "L'élève est très fort. Hausse le niveau : sois très exigeant sur la rigueur, donne des indices subtils et pousse-le dans ses retranchements."
    };

    const currentDiff = diffInstructions[difficulty as "Facile" | "Moyen" | "Difficile"] || diffInstructions.Moyen;
    const parentConstraint = parentNote ? `CONSIGNE PARENTALE COMPLÉMENTAIRE : "${parentNote}". Respecte cette consigne discrètement.` : "";

    const systemContext = studentName === "Tim"
      ? `CONTEXTE SYSTÈME: Tu es un mentor scolaire à l'écoute pour Tim, 14 ans, en classe de 3ème. Accompagne-le durant sa scolarité. Niveau d'accompagnement actuel : ${currentDiff}. ${parentConstraint} RÈGLES SÉCURITÉ : 1. NE DONNE JAMAIS LA RÉPONSE FINALE. 2. Pose uniquement des questions par étapes pour le faire progresser.`
      : `CONTEXTE SYSTÈME: Tu es une mentore scolaire bienveillante pour Julia, 11 ans, en classe de 6ème. Accompagne-la durant sa scolarité. Niveau d'accompagnement actuel : ${currentDiff}. ${parentConstraint} RÈGLES SÉCURITÉ : 1. NE DONNE JAMAIS LA RÉPONSE FINALE. 2. Utilise des exemples concrets de la vie courante.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Clé API manquante" }, { status: 500 });
    }

    const cleanMessages = messages[0]?.role === 'assistant' ? messages.slice(1) : messages;

    const contents = cleanMessages.map((m: { role: string, content: string, imageUrl?: string }, index: number) => {
      const role = m.role === 'assistant' ? 'model' : 'user';
      const parts = [];

      if (m.content) {
        if (index === 0) {
          parts.push({ text: `${systemContext}\n\n[Début des échanges] Élève: ${m.content}` });
        } else {
          parts.push({ text: m.content });
        }
      }

      if (m.imageUrl && m.imageUrl.includes("base64,")) {
        const base64Data = m.imageUrl.split("base64,")[1];
        parts.push({
          inlineData: { mimeType: "image/jpeg", data: base64Data }
        });
      }

      return { role, parts };
    });

    // Modèle corrigé en 1.5-flash
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu analyser le message.";
    return NextResponse.json({ reply });

  } catch (error) {
    return NextResponse.json({ error: "Erreur de liaison serveur" }, { status: 500 });
  }
}