"use client";

import React, { useState, useEffect, useRef } from "react";

const COMMAND_PALETTE_EVENT = "bluebird_command_palette_event";

export function commandPalette(action = "toggle") {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_EVENT, { detail: { action } }));
  }
}

export function CommandPalette({ open: controlledOpen, onOpenChange, children }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);

  const setOpen = (val) => {
    if (controlledOpen === undefined) {
      setInternalOpen(val);
    }
    if (onOpenChange) {
      onOpenChange(val);
    }
  };

  useEffect(() => {
    const handleKeyEvent = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(!isOpen);
      }
      if (e.key === "Escape" && isOpen) {
        setOpen(false);
      }
    };

    const handleCustomEvent = (e) => {
      const action = e.detail?.action || "toggle";
      if (action === "open") setOpen(true);
      else if (action === "close") setOpen(false);
      else setOpen(!isOpen);
    };

    window.addEventListener("keydown", handleKeyEvent);
    window.addEventListener(COMMAND_PALETTE_EVENT, handleCustomEvent);

    return () => {
      window.removeEventListener("keydown", handleKeyEvent);
      window.removeEventListener(COMMAND_PALETTE_EVENT, handleCustomEvent);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="command-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="command-dialog">
        <div className="command-input-wrapper">
          <span>🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="command-input"
            placeholder="Type a command or search documentation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd>ESC</kbd>
        </div>
        <div className="command-list">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, { search, setOpen });
            }
            return child;
          })}
        </div>
      </div>
    </div>
  );
}

export function CommandGroup({ title, children, search, setOpen }) {
  return (
    <div className="command-group">
      {title && <div className="command-group-title">{title}</div>}
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { search, setOpen });
        }
        return child;
      })}
    </div>
  );
}

export function CommandItem({ children, onSelect, search = "", setOpen, ...props }) {
  const text = typeof children === "string" ? children : "";
  if (search && text && !text.toLowerCase().includes(search.toLowerCase())) {
    return null;
  }

  return (
    <div
      className="command-item"
      onClick={(e) => {
        if (onSelect) onSelect(e);
        if (setOpen) setOpen(false);
      }}
      {...props}
    >
      <span>{children}</span>
      <kbd>↵</kbd>
    </div>
  );
}
