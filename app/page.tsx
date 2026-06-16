"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import DynamicBackground from "../Components/DynamicBackground";
import LoginCard from "../Components/LoginCard";
import Dashboard from "../Components/Dashboard";
import { getAllMessagesForAdmin, saveStudentConfig, getStudentConfig } from "../lib/chatService";

export default function Home() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeStudent, setActiveStudent] = useState<"Tim" | "Julia" | null>(null);

  // États Espace Admin Épuré
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [adminError, setAdminError] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  
  const [timNote, setTimNote] = useState("");
  const [timDiff, setTimDiff] = useState("Moyen");
  const [juliaNote, setJuliaNote] = useState("");
  const [juliaDiff, setJuliaDiff] = useState("Moyen");

  const adminOverlayRef = useRef<HTMLDivElement>(null);
  const adminBoxRef = useRef<HTMLDivElement>(null);
  const passwordModalRef = useRef<HTMLDivElement>(null);

  const handleLoginSuccess = (studentName: "Tim" | "Julia") => {
    setActiveStudent(studentName);
    setIsAuthorized(true);
  };

  useEffect(() => {
    async function loadConfigs() {
      const timConf = await getStudentConfig("Tim");
      setTimNote(timConf.parentNote || "");
      setTimDiff(timConf.difficulty || "Moyen");

      const juliaConf = await getStudentConfig("Julia");
      setJuliaNote(juliaConf.parentNote || "");
      setJuliaDiff(juliaConf.difficulty || "Moyen");
    }
    loadConfigs();
  }, [showAdminPanel]);

  // CINÉMATIQUE GSAP LUXE & PREMIUM (SANS EFFET GADGET)
  useEffect(() => {
    if (showAdminPanel) {
      gsap.fromTo(adminOverlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(adminBoxRef.current, 
        { scale: 0.96, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out", clearProps: "transform" }
      );
      setTimeout(() => {
        gsap.from(".clean-stagger", { opacity: 0, y: 10, stagger: 0.08, duration: 0.3, ease: "power2.out" });
      }, 30);
    }
  }, [showAdminPanel]);

  useEffect(() => {
    if (showPasswordModal) {
      gsap.fromTo(passwordModalRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" }
      );
    }
  }, [showPasswordModal]);

  const handleAdminAccess = async () => {
    if (passwordInput === "Melissa01") {
      setAdminError("");
      setPasswordInput("");
      setShowPasswordModal(false);
      setShowAdminPanel(true);
      const logs = await getAllMessagesForAdmin();
      setAllMessages(logs);
    } else {
      setAdminError("Code de vérification incorrect.");
      gsap.fromTo(passwordModalRef.current, { x: -6 }, { x: 6, duration: 0.06, repeat: 3, yoyo: true, onComplete: () => gsap.set(passwordModalRef.current, { x: 0 }) });
    }
  };

  const handleSaveConfig = async (student: "Tim" | "Julia") => {
    if (student === "Tim") {
      await saveStudentConfig("Tim", timNote, timDiff);
    } else {
      await saveStudentConfig("Julia", juliaNote, juliaDiff);
    }
    const indicator = document.getElementById(`status-${student}`);
    if (indicator) {
      gsap.fromTo(indicator, { opacity: 0.3 }, { opacity: 1, duration: 0.2, repeat: 2, yoyo: true });
    }
  };

  return (
    <main className={`relative min-h-screen w-full flex overflow-hidden bg-[#04020d] transition-all duration-500 ${
      !isAuthorized ? "items-center justify-center" : "items-start justify-stretch"
    }`}>
      <DynamicBackground />

      <div className="flex-1 w-full flex items-center justify-center z-10">
        {!isAuthorized ? (
          <LoginCard onLoginSuccess={handleLoginSuccess} />
        ) : (
          activeStudent && <Dashboard studentName={activeStudent} />
        )}
      </div>

      {/* BOUTON CACHÉ LOGO ROND "N" */}
      <div className="absolute bottom-5 left-5 z-50">
        <button onClick={() => setShowPasswordModal(true)} className="w-10 h-10 rounded-full bg-slate-900/90 border border-slate-800 flex items-center justify-center text-white font-medium text-xs hover:border-slate-600 transition-all cursor-pointer active:scale-95">
          N
        </button>
      </div>

      {/* INTERFACE ADMIN EXECUTIVE (STYLE PREMIUM ULTRA CLEAN) */}
      {showAdminPanel && (
        <div ref={adminOverlayRef} className="fixed inset-0 bg-slate-950/60 backdrop-blur-lg z-[100] flex items-center justify-center p-4">
          <div ref={adminBoxRef} className="w-full max-w-4xl bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
            
            {/* Top Bar Minimaliste */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold text-slate-100 tracking-tight">Espace de Supervision Parentale</h2>
                <p className="text-[11px] text-slate-400">Suivi pédagogique et ajustement des profils d'apprentissage.</p>
              </div>
              <button onClick={() => gsap.to(adminBoxRef.current, { opacity: 0, y: 15, duration: 0.2, onComplete: () => setShowAdminPanel(false) })} className="text-xs bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer font-medium">Quitter</button>
            </div>

            {/* Formulaire Épuré */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Panneau Tim */}
              <div className="clean-stagger bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <h3 className="font-semibold text-xs text-indigo-400 tracking-wide">Tim — Classe de 3ème</h3>
                  <div id="status-Tim" className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-medium">Niveau d'accompagnement de l'IA :</label>
                  <select value={timDiff} onChange={(e) => setTimDiff(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none">
                    <option value="Facile">Accompagnement maximal (Indices explicites)</option>
                    <option value="Moyen">Autonomie standard (Logique & Méthode)</option>
                    <option value="Difficile">Exigence supérieure (Perfectionnement)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-medium">Note et objectifs du parent :</label>
                  <textarea value={timNote} onChange={(e) => setTimNote(e.target.value)} className="w-full h-16 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 resize-none outline-none font-sans" placeholder="Renseigner les points de vigilance ou les notions à retravailler..." />
                </div>
                <button onClick={() => handleSaveConfig("Tim")} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs py-2 rounded-lg text-slate-100 font-medium transition-colors cursor-pointer">Enregistrer les consignes</button>
              </div>

              {/* Panneau Julia */}
              <div className="clean-stagger bg-slate-950/40 p-4 border border-slate-800 rounded-xl space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-900 pb-1.5">
                  <h3 className="font-semibold text-xs text-pink-400 tracking-wide">Julia — Classe de 6ème</h3>
                  <div id="status-Julia" className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-medium">Niveau d'accompagnement de l'IA :</label>
                  <select value={juliaDiff} onChange={(e) => setJuliaDiff(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 outline-none">
                    <option value="Facile">Accompagnement maximal (Indices explicites)</option>
                    <option value="Moyen">Autonomie standard (Logique & Méthode)</option>
                    <option value="Difficile">Exigence supérieure (Perfectionnement)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-slate-400 font-medium">Note et objectifs du parent :</label>
                  <textarea value={juliaNote} onChange={(e) => setJuliaNote(e.target.value)} className="w-full h-16 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-300 resize-none outline-none font-sans" placeholder="Renseigner les points de vigilance ou les notions à retravailler..." />
                </div>
                <button onClick={() => handleSaveConfig("Julia")} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs py-2 rounded-lg text-slate-100 font-medium transition-colors cursor-pointer">Enregistrer les consignes</button>
              </div>
            </div>

            {/* Visionneuse Clean */}
            <div className="clean-stagger space-y-1.5">
              <h3 className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Historique récent des sessions</h3>
              <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-3 h-40 overflow-y-auto custom-scrollbar space-y-2 text-xs">
                {allMessages.length === 0 ? (
                  <p className="text-slate-500 italic text-center pt-12">Aucun historique disponible dans la base de données.</p>
                ) : (
                  allMessages.map((msg, i) => (
                    <div key={i} className="border-b border-slate-900 pb-1.5 flex gap-2 last:border-0 font-sans">
                      <span className={`font-semibold text-[11px] px-1.5 py-0.5 rounded ${msg.studentName === 'Tim' ? 'bg-indigo-950/50 text-indigo-400' : 'bg-pink-950/50 text-pink-400'}`}>{msg.studentName}</span>
                      <span className="text-slate-400 font-medium">{msg.role === 'user' ? 'Élève' : 'Mentor IA'} :</span>
                      <span className="text-slate-300 flex-1">{msg.content}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROTECTION CODE RESTE INCHANGÉ */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-[110]">
          <div ref={passwordModalRef} className="bg-slate-900 border border-slate-800 p-5 rounded-xl max-w-sm w-full space-y-3">
            <h3 className="font-medium text-xs text-slate-200 uppercase tracking-wide">Authentification requise</h3>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
              placeholder="Code d'accès"
              className="w-full bg-slate-950 border border-slate-800 text-center text-white rounded-lg py-2 text-xs focus:outline-none"
              autoFocus
            />
            {adminError && <p className="text-[10px] text-red-400 text-center font-medium">{adminError}</p>}
            <div className="flex justify-end gap-2 text-xs pt-1">
              <button onClick={() => { setShowPasswordModal(false); setAdminError(""); }} className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer">Annuler</button>
              <button onClick={handleAdminAccess} className="bg-indigo-600 text-white font-medium px-3 py-1 rounded-lg cursor-pointer">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}