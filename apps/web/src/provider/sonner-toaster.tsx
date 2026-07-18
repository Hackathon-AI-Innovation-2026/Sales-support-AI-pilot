"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export function SonnerToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      position="bottom-right"
      richColors
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}
