"use client";
import React, { useState, useRef, useEffect } from "react";
import { saveMessage, getHistory, getStudentConfig } from "../lib/chatService"; 

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

interface TutorChatProps {
  studentName: "Tim" | "Julia";
  onBack: () => void;
}

export default function TutorChat({ studentName, onBack }: TutorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const [parentNote, setParentNote] = useState("");
  const [difficulty, setDifficulty] = useState("Moyen");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadChatHistory = async () => {
      setIsLoading(true);
      const config = await getStudentConfig(studentName);
      setParentNote(config.parentNote);
      setDifficulty(config.difficulty);

      const history = await getHistory(studentName);
      if (history && history.length > 0) {
        const formatted = history.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          imageUrl: msg.imageUrl
        }));
        setMessages(formatted);
      } else {
        setMessages([
          {
            role: "assistant",
            content: `Salut ${studentName} ! Je suis ton mentor personnel. Quel exercice ou leçon veux-tu travailler aujourd'hui ? Tu peux m'envoyer un message ou une photo !`,
          },
        ]);
      }
      setIsLoading(false);
    };

    loadChatHistory();
  }, [studentName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedImage || isLoading) return;

    const userMessage = input || "Voici mon exercice en photo :";
    const imageToSend = selectedImage;
    
    setInput("");
    setSelectedImage(null);

    const updatedMessages = [...messages, { role: "user" as const, content: userMessage, imageUrl: imageToSend || undefined }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      saveMessage(studentName, "user", userMessage, imageToSend || undefined).catch(console.error);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          studentName, 
          messages: updatedMessages,
          difficulty,
          parentNote
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant" as const, content: data.reply }]);
        saveMessage(studentName, "assistant", data.reply).catch(console.error);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant" as const, content: `❌ Erreur : ${data.error}` }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[85vh] max-w-3xl mx-auto bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-800/80 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Retour
          </button>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="font-semibold text-white">Espace Mentor - {studentName}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 font-mono">
            Niveau : {difficulty}
          </span>
        </div>
      </div>

      {/* Messages Zone */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
              msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50"
            }`}>
              {msg.imageUrl && (
                <img src={msg.imageUrl} alt="Exercice" className="max-w-xs max-h-48 rounded-lg mb-2 object-cover" />
              )}
              <p className="whitespace-pre-line text-sm leading-relaxed">{msg.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-2xl rounded-tl-none p-4 max-w-[80%] flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm italic">Analyse en cours...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Zone */}
      <div className="p-4 bg-slate-800/40 border-t border-slate-700/50 space-y-3">
        {selectedImage && (
          <div className="relative inline-block bg-slate-700 p-1 rounded-lg">
            <img src={selectedImage} alt="Aperçu" className="h-16 w-16 object-cover rounded" />
            <button onClick={() => setSelectedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">✕</button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition-colors">📸</button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={`Pose ta question, ${studentName}...`}
            className="flex-1 bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl px-4 py-3 border border-slate-700 focus:outline-none focus:border-indigo-500 text-sm"
          />
          <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-3 rounded-xl transition-all text-sm">Envoyer</button>
        </div>
      </div>
    </div>
  );
}