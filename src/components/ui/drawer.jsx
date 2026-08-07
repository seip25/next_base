"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const DrawerContext = createContext(null);

export function Drawer({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (val) => {
    if (controlledOpen === undefined) {
      setInternalOpen(val);
    }
    if (onOpenChange) {
      onOpenChange(val);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <DrawerContext.Provider value={{ isOpen, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({ children, onClick, ...props }) {
  const ctx = useContext(DrawerContext);
  return (
    <div
      onClick={(e) => {
        if (ctx) ctx.setOpen(true);
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function DrawerContent({ children, className = "", ...props }) {
  const ctx = useContext(DrawerContext);
  if (!ctx || !ctx.isOpen) return null;

  return (
    <>
      <div
        className="drawer-backdrop open"
        onClick={() => ctx.setOpen(false)}
      />
      <div className={`drawer open ${className}`} {...props}>
        {children}
      </div>
    </>
  );
}

export function DrawerClose({ children, onClick, ...props }) {
  const ctx = useContext(DrawerContext);
  return (
    <div
      onClick={(e) => {
        if (ctx) ctx.setOpen(false);
        if (onClick) onClick(e);
      }}
      {...props}
    >
      {children}
    </div>
  );
}
