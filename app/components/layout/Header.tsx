"use client";

import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Search,
  Settings,
  User,
  LogOut,
  CheckCircle2,
  Menu,
} from "lucide-react";

interface HeaderProps {
  sidebarAbierto: boolean;
  onAbrirSidebar: () => void;
}

export default function Header({
  sidebarAbierto,
  onAbrirSidebar,
}: HeaderProps) {
  const [notificacionesOpen, setNotificacionesOpen] = useState(false);
  const [usuarioOpen, setUsuarioOpen] = useState(false);
  const [tieneNotificaciones, setTieneNotificaciones] = useState(true);

  const notificacionesRef = useRef<HTMLDivElement>(null);
  const usuarioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        notificacionesRef.current &&
        !notificacionesRef.current.contains(target)
      ) {
        setNotificacionesOpen(false);
      }

      if (
        usuarioRef.current &&
        !usuarioRef.current.contains(target)
      ) {
        setUsuarioOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificacionesOpen(false);
        setUsuarioOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleNotificaciones = () => {
    setNotificacionesOpen((prev) => !prev);
    setUsuarioOpen(false);
  };

  const toggleUsuario = () => {
    setUsuarioOpen((prev) => !prev);
    setNotificacionesOpen(false);
  };

  return (
    <header className="h-16 shrink-0 border-b border-slate-200 bg-white">
      <div className="flex h-full items-center justify-between px-6 lg:px-8">
        {/* Izquierda */}
        <div className="flex items-center gap-3">
          {!sidebarAbierto && (
            <button
              type="button"
              onClick={onAbrirSidebar}
              title="Mostrar menú"
              aria-label="Mostrar menú"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-600 focus:outline-none focus:ring-4 focus:ring-violet-500/10"
            >
              <Menu className="h-4 w-4" />
            </button>
          )}

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Sistema de gestión
            </p>

            <p className="text-xs text-slate-400">
              Administración empresarial
            </p>
          </div>
        </div>

        {/* Derecha */}
        <div className="flex items-center gap-2">
          {/* Buscar */}
          <button
            type="button"
            aria-label="Buscar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notificaciones */}
          <div ref={notificacionesRef} className="relative">
            <button
              type="button"
              aria-label="Notificaciones"
              aria-expanded={notificacionesOpen}
              onClick={toggleNotificaciones}
              className={`relative flex h-9 w-9 items-center justify-center rounded-lg transition ${
                notificacionesOpen
                  ? "bg-violet-50 text-violet-600"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              <Bell className="h-4 w-4" />

              {tieneNotificaciones && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-violet-500 ring-2 ring-white" />
              )}
            </button>

            {/* Panel de notificaciones */}
            {notificacionesOpen && (
              <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Notificaciones
                    </p>

                    <p className="text-xs text-slate-400">
                      Actividad reciente
                    </p>
                  </div>

                  {tieneNotificaciones && (
                    <button
                      type="button"
                      onClick={() => setTieneNotificaciones(false)}
                      className="text-xs font-medium text-violet-600 transition hover:text-violet-700"
                    >
                      Marcar como leídas
                    </button>
                  )}
                </div>

                {tieneNotificaciones ? (
                  <div className="divide-y divide-slate-100">
                    <div className="flex gap-3 px-4 py-3.5 transition hover:bg-slate-50">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700">
                          Sistema disponible
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-slate-400">
                          El sistema de gestión se encuentra operativo.
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Hace unos momentos
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <Bell className="h-4 w-4 text-slate-400" />
                    </div>

                    <p className="mt-3 text-sm font-medium text-slate-600">
                      No tienes notificaciones
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Todo está al día.
                    </p>
                  </div>
                )}

                <div className="border-t border-slate-100 px-4 py-2.5">
                  <button
                    type="button"
                    className="w-full text-center text-xs font-medium text-violet-600 transition hover:text-violet-700"
                  >
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="mx-2 h-7 w-px bg-slate-200" />

          {/* Usuario */}
          <div ref={usuarioRef} className="relative">
            <button
              type="button"
              aria-label="Menú de usuario"
              aria-expanded={usuarioOpen}
              onClick={toggleUsuario}
              className={`flex items-center gap-3 rounded-xl px-2 py-1.5 transition ${
                usuarioOpen
                  ? "bg-slate-50"
                  : "hover:bg-slate-50"
              }`}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-semibold text-white">
                JV
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-slate-700">
                  Usuario
                </p>

                <p className="text-[11px] text-slate-400">
                  Administrador
                </p>
              </div>

              <ChevronDown
                className={`hidden h-4 w-4 text-slate-400 transition sm:block ${
                  usuarioOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Menú de usuario */}
            {usuarioOpen && (
              <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-700">
                    Usuario
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Administrador
                  </p>
                </div>

                <div className="p-1.5">
                  <button
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    <User className="h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                    <span>Mi perfil</span>
                  </button>

                  <button
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                  >
                    <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                    <span>Configuración</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 p-1.5">
                  <button
                    type="button"
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}