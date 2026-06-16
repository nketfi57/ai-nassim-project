"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { User, GraduationCap, ShieldCheck } from "lucide-react"; // Import des icônes

interface LoginCardProps {
  onLoginSuccess: (name: "Tim" | "Julia") => void;
}

export default function LoginCard({ onLoginSuccess }: LoginCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.from(cardRef.current, { opacity: 0, y: 30, scale: 0.98, duration: 1, ease: "power4.out" });
    tl.from(".gsap-reveal", { opacity: 0, y: 15, stagger: 0.06, duration: 0.5, ease: "power3.out" }, "-=0.7");
  }, { scope: containerRef });

  const handleSelectStudent = (name: "Tim" | "Julia") => {
    gsap.to(cardRef.current, {
      opacity: 0,
      y: -30,
      scale: 0.95,
      duration: 0.6,
      ease: "power3.in",
      onComplete: () => onLoginSuccess(name)
    });
  };

  return (
    <div ref={containerRef} className="w-full max-w-[400px]">
      <div ref={cardRef} className="w-full rounded-3xl bg-black/40 p-8 shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-3xl">
        <div className="flex justify-center mb-6 gsap-reveal">
          <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20 shadow-md">
            <ShieldCheck size={24} />
          </div>
        </div>

        <h1 className="text-center text-2xl font-semibold tracking-tight text-white gsap-reveal">Mainframe OS</h1>
        <p className="text-center text-xs text-white/50 mt-1 mb-8 gsap-reveal">Choisis ton profil d'accès</p>

        <div className="space-y-4 pt-2">
          {/* Bouton Tim */}
          <div className="gsap-reveal">
            <button 
              onClick={() => handleSelectStudent("Tim")}
              className="w-full h-14 flex items-center gap-4 bg-gradient-to-r from-purple-600/40 to-indigo-600/40 hover:from-purple-500/50 hover:to-indigo-500/50 border border-purple-500/20 text-white rounded-xl px-5 transition duration-200 shadow-lg"
            >
              <User size={24} className="text-purple-200" />
              <div className="text-left">
                <div className="font-semibold text-sm">Session de Tim</div>
                <div className="text-xs text-white/60">Mentor IA Rigoureux (3ème)</div>
              </div>
            </button>
          </div>

          {/* Bouton Julia */}
          <div className="gsap-reveal">
            <button 
              onClick={() => handleSelectStudent("Julia")}
              className="w-full h-14 flex items-center gap-4 bg-gradient-to-r from-cyan-400/30 to-blue-500/30 hover:from-cyan-300/40 hover:to-blue-400/40 border border-cyan-500/20 text-white rounded-xl px-5 transition duration-200 shadow-lg"
            >
              <GraduationCap size={24} className="text-cyan-200" />
              <div className="text-left">
                <div className="font-semibold text-sm">Session de Julia</div>
                <div className="text-xs text-white/60">Mentor IA Pédagogue (6ème)</div>
              </div>
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-white/10 pt-5 text-center gsap-reveal">
          <span className="text-[9px] font-bold tracking-widest text-white/30 uppercase">🔒 SECURE CORE ACCESS</span>
        </div>
      </div>
    </div>
  );
}