import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "" });

export async function POST(req: Request) {
  try {
    const { studentName, messages, difficulty, parentNote } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "Clé GROQ_API_KEY manquante" }, { status: 500 });
    }

    const diffInstructions = {
      Facile: "L'élève a des difficultés. Sois ultra-pédagogue, décompose au maximum, utilise des mots simples et donne des indices évidents sans jamais donner la réponse finale.",
      Moyen: "Niveau standard. Pousse l'élève à réfléchir en lui posant des questions de logique par étapes.",
      Difficile: "L'élève est très fort. Hausse le niveau : sois très exigeant sur la rigueur, donne des indices subtils et pousse-le dans ses retranchements."
    };

    const currentDiff = diffInstructions[difficulty as "Facile" | "Moyen" | "Difficile"] || diffInstructions.Moyen;
    const parentConstraint = parentNote ? `CONSIGNE PARENTALE : "${parentNote}".` : "";

    const systemContext = `Tu es un mentor scolaire pour ${studentName}. Tu as la capacité de lire les textes et d'analyser les images d'exercices qu'on t'envoie. RÈGLES DE SÉCURITÉ ABSOLUES : 1. NE DONNE JAMAIS LA RÉPONSE FINALE. 2. Pose uniquement des questions par étapes pour faire progresser l'élève. Niveau actuel : ${currentDiff}. ${parentConstraint}`;

    const cleanMessages = messages[0]?.role === 'assistant' ? messages.slice(1) : messages;
    
    const lastMessage = cleanMessages[cleanMessages.length - 1];
    const hasImage = lastMessage?.imageUrl && typeof lastMessage.imageUrl === 'string' && lastMessage.imageUrl.length > 50;

    // Utilisation obligatoire du modèle Vision si une image est détectée
    const modelToUse = hasImage ? "llama-3.2-11b-vision-preview" : "llama-3.3-70b-versatile";

    const formattedMessages = cleanMessages.map((m: any, index: number) => {
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      const isLast = index === cleanMessages.length - 1;

      if (isLast && m.imageUrl && typeof m.imageUrl === 'string' && m.imageUrl.length > 50) {
        let base64Data = m.imageUrl;
        
        // Nettoyage strict du préfixe Data URI pour Groq
        if (base64Data.includes("base64,")) {
          base64Data = base64Data.split("base64,")[1];
        }
        
        // Nettoyage des espaces, retours à la ligne et caractères parasites
        base64Data = base64Data.replace(/[\r\n\s]+/g, "");

        return {
          role: "user",
          content: [
            { type: "text", text: m.content || "Voici la photo de mon exercice, analyse-la pour m'aider." },
            { 
              type: "image_url", 
              image_url: { 
                url: `data:image/jpeg;base64,${base64Data}` 
              } 
            }
          ]
        };
      }

      if (m.imageUrl && !isLast) {
        return { role, content: (m.content || "") + " [Photo de l'exercice déjà reçue et analysée]" };
      }

      return { role, content: m.content || "" };
    });

    formattedMessages.unshift({ role: "system", content: systemContext });

    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: modelToUse,
      temperature: 0.5, // Baissé pour plus de rigueur sur l'analyse d'image
      max_tokens: 1024,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Erreur Groq Vision :", error);
    return NextResponse.json({ error: "Erreur Groq Vision : " + error.message }, { status: 500 });
  }
}