"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function DynamicBackground() {
  const swirlRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Rotation continue de tout le fond pour créer le vortex de couleur
    gsap.to(swirlRef.current, {
      rotation: 360,
      duration: 25,
      repeat: -1,
      ease: "none"
    });

    // 2. Mouvements internes des vagues de couleurs (Vitesse boostée !)
    if (swirlRef.current) {
      const blobs = swirlRef.current.querySelectorAll(".aurora-blob");
      blobs.forEach((blob, i) => {
        gsap.to(blob, {
          x: "random(-120, 120)",
          y: "random(-120, 120)",
          scale: "random(1.2, 1.5)",
          duration: "random(4, 6)", // Super rapide pour voir le mouvement fluide
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.4
        });
      });
    }

    // 3. Animation des micro-particules qui montent vers le haut (Effet magique)
    if (particlesRef.current) {
      const particles = particlesRef.current.querySelectorAll(".tech-particle");
      particles.forEach((p) => {
        gsap.to(p, {
          y: "-105vh",
          x: "random(-80, 80)",
          opacity: "random(0.1, 0.7)",
          scale: "random(0.4, 1.4)",
          duration: "random(6, 10)",
          repeat: -1,
          ease: "none",
          delay: "random(0, 7)"
        });
      });
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#04020d]">
      
      {/* LE VORTEX (Le dégradé liquide géant qui tourne) */}
      <div 
        ref={swirlRef} 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] filter blur-[65px] opacity-75 pointer-events-none"
      >
        {/* Violet Électrique */}
        <div className="aurora-blob absolute top-[20%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-fuchsia-600" />
        
        {/* Cyan Néon */}
        <div className="aurora-blob absolute bottom-[20%] right-[20%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-emerald-400" />
        
        {/* Rose Magma */}
        <div className="aurora-blob absolute top-[15%] right-[25%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-pink-500 via-rose-500 to-orange-500" />
        
        {/* Bleu Outremer de cohésion */}
        <div className="aurora-blob absolute bottom-[15%] left-[25%] w-[45vw] h-[45vw] rounded-full bg-blue-800" />
      </div>

      {/* LES PARTICULES (Les petites lucioles qui bougent en permanence) */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none z-10">
        <div className="tech-particle absolute bottom-[-50px] left-[10%] w-3 h-3 bg-cyan-400 rounded-full filter blur-[1px]" />
        <div className="tech-particle absolute bottom-[-50px] left-[25%] w-2 h-2 bg-white rounded-full" />
        <div className="tech-particle absolute bottom-[-50px] left-[45%] w-4 h-4 bg-purple-400 rounded-full filter blur-[2px]" />
        <div className="tech-particle absolute bottom-[-50px] left-[60%] w-2 h-2 bg-pink-400 rounded-full" />
        <div className="tech-particle absolute bottom-[-50px] left-[75%] w-3 h-3 bg-blue-400 rounded-full filter blur-[1px]" />
        <div className="tech-particle absolute bottom-[-50px] left-[90%] w-5 h-5 bg-purple-300 rounded-full filter blur-[3px]" />
      </div>

      {/* Grille tech Apple + Filtre de contraste */}
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff01_1px,transparent_1px),linear-gradient(to_bottom,#ffffff01_1px,transparent_1px)] bg-[size:40px_40px]"></div>
    </div>
  );
}