"use client";
import React, { useEffect, useState, useMemo } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

function Provider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

export default Provider;
