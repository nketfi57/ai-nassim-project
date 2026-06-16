import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, difficulty, studentName, parentNote } = await req.json();

    const systemContext = `
      Tu es PLATEROTI AI, un mentor scolaire bienveillant pour ${studentName}.
      Ton rôle premier est d'accompagner l'élève dans ses devoirs, de lui donner des pistes de réflexion et de l'aider à comprendre par lui-même.
      
      CONSIGNES DE NIVEAU : ${difficulty}. 
      NOTE PARENTALE : ${parentNote || "Aucune consigne particulière."}.

      CAPACITÉS ADDITIONNELLES :
      - Si l'élève te le demande expressément (ex: "fais-moi une fiche sur...") ou si tu juges qu'un résumé est nécessaire pour débloquer une situation, génère une fiche de révision structurée (titres, points clés, gras).
      - Si l'élève te demande un quizz (ex: "interroge-moi sur..."), pose les questions une par une. Analyse ses réponses avant de valider et de poser la suivante.
      - En dehors de ces demandes, reste dans ton rôle de mentor conversationnel : guide, questionne, encourage.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    
    // On structure l'envoi pour Google Gemini
    const contents = [
      { role: "user", parts: [{ text: systemContext }] },
      ...messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }))
    ];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Je n'ai pas pu répondre, désolé.";
    
    return NextResponse.json({ reply });

  } catch (error) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}