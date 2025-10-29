"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SandpackProvider } from "@codesandbox/sandpack-react";
import { useWorkspace } from "@/store/useWorkspace";

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

export default Provider;
