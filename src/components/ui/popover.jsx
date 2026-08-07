"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";

const PopoverContext = createContext(null);

export function Popover({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  return (
    <PopoverContext.Provider value={{ isOpen, toggle, close }}>
      <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, onClick, ...props }) {
  const ctx = useContext(PopoverContext);
  return (
    <div
      onClick={(e) => {
        if (ctx) ctx.toggle();
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function PopoverContent({ children, className = "", ...props }) {
  const ctx = useContext(PopoverContext);
  if (!ctx || !ctx.isOpen) return null;

  return (
    <div className={`popover open ${className}`} {...props}>
      {children}
    </div>
  );
}
