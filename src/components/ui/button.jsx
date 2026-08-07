"use client";

import React from "react";

/**
 * Button component with built-in Bluebird CSS classes & optional Material Ripple effect.
 */
export function Button({
  children,
  className = "",
  variant,
  size,
  glow,
  ripple = true,
  onClick,
  ...props
}) {
  const handleClick = (e) => {
    if (ripple) {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const sizePx = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - sizePx / 2;
      const y = e.clientY - rect.top - sizePx / 2;

      const rippleSpan = document.createElement("span");
      rippleSpan.className = "ripple";
      rippleSpan.style.width = rippleSpan.style.height = `${sizePx}px`;
      rippleSpan.style.left = `${x}px`;
      rippleSpan.style.top = `${y}px`;

      btn.appendChild(rippleSpan);
      rippleSpan.addEventListener("animationend", () => rippleSpan.remove());
    }

    if (onClick) {
      onClick(e);
    }
  };

  const classNames = [
    className,
    variant,
    size ? `btn-${size}` : "",
    glow ? (glow.startsWith("glow-") ? glow : `glow-${glow}`) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classNames} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
