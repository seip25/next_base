"use client";

import { useEffect } from "react";

export function ClientScripts({ scripts = [] }) {
  useEffect(() => {
    scripts.map((script) => {
      import(`${script}`);
    });
  }, [scripts]);
  return null;
}
