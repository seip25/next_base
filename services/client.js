"use client";

import { useEffect } from "react";

/**
 * Client-side script loader wrapper for Next.js App Router.
 * Dynamically loads vanilla JavaScript libraries that depend on the `window` object
 * (e.g., Bootstrap, BeerCSS) to prevent "window is not defined" SSR errors.
 *
 * @param {Object} props
 * @param {string[]} props.scripts - Array of module paths to dynamically import.
 * @returns {null} Renders nothing to the DOM.
 */
export function ClientScripts({ scripts = [] }) {
  useEffect(() => {
    scripts.map(async (script) => {
      const module = await import(`${script}`);
      if (module.default) {
        module.default();
      }
    });
  }, [scripts]);
  return null;
}
