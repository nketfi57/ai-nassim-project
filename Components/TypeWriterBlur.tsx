"use client";
import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function TypewriterBlur({ text }: { text: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const chars = containerRef.current.querySelectorAll(".motion-char");
      
      // On reset l'état initial pour éviter les flashs visuels
      gsap.killTweensOf(chars);
      
      // Animation Typewriter avec simulation de Motion Blur (Flou de mouvement en entrée)
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
          stagger: 0.012, // Vitesse de frappe de l'IA (Ajustable)
          duration: 0.35, 
          ease: "power2.out"
        }
      );
    }
  }, [text]);

  // Découpage du texte en caractères uniques tout en conservant les espaces HTML
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