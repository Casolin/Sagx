import React, { useEffect, useState } from "react";
import { enable, disable } from "darkreader";
import { ThemeContext } from "./ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      enable({
        brightness: 100,
        contrast: 90,
        sepia: 0,
        grayscale: 0,
        darkSchemeBackgroundColor: "#111111",
        darkSchemeTextColor: "#e6e6e6",
      });
      localStorage.setItem("theme", "dark");
    } else {
      disable();
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggle = () => setDark((p) => !p);

  return (
    <ThemeContext.Provider value={{ dark, setDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
