"use client";

import React, { useEffect } from "react";
import { toast, ToastContainer } from "./toast";
import { snackbar, SnackbarContainer } from "./snackbar";
import { commandPalette } from "./command";

/**
 * BluebirdProvider initializes global Bluebird JS features and backwards-compatible window methods.
 */
export function BluebirdProvider({ children }) {
  useEffect(() => {
    // 1. Expose window helpers for legacy / imperative code
    if (typeof window !== "undefined") {
      window.toast = toast;
      window.snackbar = snackbar;
      window.bluebird = function (component, options) {
        if (component === "snackbar" || typeof component === "object") {
          snackbar(typeof component === "object" ? component : options);
        } else if (component === "toast") {
          toast(options);
        } else if (component === "command") {
          commandPalette(options?.action || "toggle");
        }
      };
    }

    // 2. Global listener for ripple effects on buttons with `data-ripple` or standard buttons
    const handleGlobalClick = (e) => {
      const btn = e.target.closest("button, a[role='button']");
      if (
        btn &&
        !btn.classList.contains("fab") &&
        !btn.classList.contains("carousel-nav") &&
        !btn.querySelector(".ripple")
      ) {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        const ripple = document.createElement("span");
        ripple.className = "ripple";
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        btn.appendChild(ripple);
        ripple.addEventListener("animationend", () => ripple.remove());
      }
    };

    document.addEventListener("click", handleGlobalClick);
    return () => document.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <>
      {children}
      <ToastContainer />
      <SnackbarContainer />
    </>
  );
}
