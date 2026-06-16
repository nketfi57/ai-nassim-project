"use client";

import React, { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { saveMessage, getHistory, getStudentConfig } from "../lib/chatService";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  isNew?: boolean;
}

interface DashboardProps {
  studentName: "Tim" | "Julia";
}

// ==========================================
// COMPOSANT MOTION BLUR
// ==========================================
function TypewriterBlur({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const chars = containerRef.current.querySelectorAll(".motion-char");
      
      gsap.killTweensOf(chars);
      
      gsap.fromTo(chars,
        {
          opacity: 0,
          filter: "blur(12px)",
          y: 6,
          scale: 0.9,
          transformOrigin: "center left"
        },
        {
          opacity: 1,
          filter: "blur(0px)",
          y: 0,
          scale: 1,
          stagger: 0.012,
          duration: 0.35,
          ease: "power2.out"
        }
      );
    }
  }, [text]);

  return (
    <div ref={containerRef} className="inline-block whitespace-pre-line leading-relaxed font-sans">
      {text.split("").map((char, index) => (
        <span key={index} className="motion-char inline-block will-change-[transform,opacity,filter]">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}

// ==========================================
// COMPOSANT PRINCIPAL DASHBOARD
// ==========================================
export default function Dashboard({ studentName }: DashboardProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
 
  const [parentNote, setParentNote] = useState("Aucune consigne configurée.");
  const [difficulty, setDifficulty] = useState("Moyen");
 
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const leftGridRef = useRef<HTMLDivElement>(null);
  const rightCard1Ref = useRef<HTMLDivElement>(null);
  const rightCard2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      const config = await getStudentConfig(studentName);
      setParentNote(config.parentNote || "Aucune consigne parentale active.");
      setDifficulty(config.difficulty || "Moyen");

      const history = await getHistory(studentName);
      if (history && history.length > 0) {
        setMessages(history.map((msg: any) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
          imageUrl: msg.imageUrl,
          isNew: false
        })));
      } else {
        setMessages([{
          role: "assistant",
          content: `Salut ${studentName} ! Je suis ton mentor personnel. Quel exercice ou leçon veux-tu travailler aujourd'hui ?`,
          isNew: true
        }]);
      }
      setIsLoading(false);
    };

    loadDashboardData();

    gsap.fromTo(leftGridRef.current, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(rightCard1Ref.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, delay: 0.15, ease: "power2.out" });
    gsap.fromTo(rightCard2Ref.current, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.4, delay: 0.25, ease: "power2.out" });
  }, [studentName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage = input || "Voici mon exercice en photo :";
    const imageToSend = selectedImage;
    
    // Mise à jour de l'état
    const newUserMsg: Message = { role: "user", content: userMessage, imageUrl: imageToSend || undefined, isNew: false };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    setInput("");
    setSelectedImage(null);
    setIsLoading(true);

    try {
      await saveMessage(studentName, "user", userMessage, imageToSend || undefined);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, messages: updatedMessages, difficulty, parentNote }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply, isNew: true }]);
        await saveMessage(studentName, "assistant", data.reply);
      } else if (data.error) {
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Erreur API : ${data.error}`, isNew: false }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-screen max-w-6xl mx-auto px-4 justify-center">
      <div className="flex items-center justify-between w-full mb-3 px-1 text-xs font-mono">
        <div className="text-slate-400 bg-slate-900/40 px-3 py-1 rounded border border-slate-800/40">Session active : {studentName}</div>
        <div className="text-slate-500 tracking-widest text-[10px]">MAINFRAME OS</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full items-stretch">
        <div ref={leftGridRef} className="lg:col-span-2 flex flex-col h-[76vh] bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          
          <div className="flex items-center justify-between px-5 py-4 bg-slate-800/80 border-b border-slate-700/50">
            <div className="flex items-center gap-2.5">
              <button onClick={() => window.location.reload()} className="text-slate-400 hover:text-white text-xs cursor-pointer">← Déconnexion</button>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="font-semibold text-sm text-white">Espace Mentor - {studentName}</h2>
            </div>
            <div>
              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/40 font-mono">Niveau : {difficulty}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[78%] rounded-2xl p-3.5 text-xs shadow-md leading-relaxed ${
                  msg.role === "user" ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/50"
                }`}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Devoir" className="max-w-xs max-h-40 rounded-lg mb-2 object-cover" />}
                  
                  {msg.role === "assistant" && msg.isNew ? (
                    <TypewriterBlur text={msg.content} />
                  ) : (
                    <p className="whitespace-pre-line">{msg.content}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-2xl rounded-tl-none p-3 text-xs italic flex items-center gap-2.5">
                  <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <span>Génération de la réponse...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-3 bg-slate-800/40 border-t border-slate-700/50 flex flex-col gap-2">
            {selectedImage && (
              <div className="relative inline-block bg-slate-700 p-1 rounded-lg w-12 h-12">
                <img src={selectedImage} alt="Miniature" className="h-full w-full object-cover rounded" />
                <button onClick={() => setSelectedImage(null)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center">✕</button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
              <button onClick={() => fileInputRef.current?.click()} className="p-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-xs cursor-pointer">📸</button>
              
              <div className="relative flex-1 flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={`Pose ta question, ${studentName}...`}
                  className="w-full bg-slate-950 text-slate-100 placeholder-slate-500 rounded-xl pl-4 pr-36 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500"
                />
                <div className="absolute right-3 flex items-center gap-1 text-[10px] text-slate-500/70 select-none pointer-events-none">
                  <span>Fait avec amour par</span>
                  <span className="font-black bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent uppercase tracking-wider text-[11px] animate-pulse">
                    Nassim
                  </span>
                </div>
              </div>
              <button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md active:scale-95 cursor-pointer">Envoyer</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div ref={rightCard1Ref} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 flex-1 shadow-xl">
            <div className="flex items-center gap-2 text-cyan-400 border-b border-slate-800 pb-2"><span>🎯</span><span className="text-[10px] font-bold uppercase font-mono">OBJECTIF</span></div>
            <p className="text-white font-semibold text-xs mt-3 leading-relaxed">
              {studentName === "Tim" ? "Brevet des Collèges : Focalisation sur le Théorème de Thalès." : "Validation complète des leçons de conjugaison de 6ème."}
            </p>
          </div>

          <div ref={rightCard2Ref} className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 flex-1 shadow-xl">
            <div className="flex items-center gap-2 text-pink-400 border-b border-slate-800 pb-2"><span>📝</span><span className="text-[10px] font-bold uppercase font-mono">Note du parent</span></div>
            <div className="text-slate-300 text-xs mt-3 italic leading-relaxed bg-slate-950/20 p-2.5 rounded-xl border border-slate-800/40 shadow-inner">
              "{parentNote}"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}