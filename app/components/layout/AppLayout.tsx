"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarInicializado, setSidebarInicializado] = useState(false);

  useEffect(() => {
    const estadoGuardado = localStorage.getItem("sidebar-open");

    if (estadoGuardado !== null) {
      setSidebarOpen(estadoGuardado === "true");
    }

    setSidebarInicializado(true);
  }, []);

  useEffect(() => {
    if (!sidebarInicializado) {
      return;
    }

    localStorage.setItem("sidebar-open", String(sidebarOpen));
  }, [sidebarOpen, sidebarInicializado]);

  function alternarSidebar() {
    setSidebarOpen((actual) => !actual);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          abierto={sidebarOpen}
          onCerrar={() => setSidebarOpen(false)}
        />

        {/* Contenido principal */}
        <main className="min-w-0 flex-1">
          <Header
            sidebarAbierto={sidebarOpen}
            onAbrirSidebar={alternarSidebar}
          />

          <div className="px-6 pb-6 pt-3 lg:px-8 lg:pb-8 lg:pt-3">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}