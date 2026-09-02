import React from 'react';
import { Wrench, Plus, UserPlus, ClipboardList, ShieldAlert } from 'lucide-react';

export default function Header({ onOpenAddClient, totalClients, totalPending }) {
  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-lg shadow-sky-900/50">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              TechNotes <span className="text-xs bg-sky-500/20 text-sky-300 font-semibold px-2 py-0.5 rounded-full border border-sky-500/30">Local</span>
            </h1>
            <p className="text-xs text-slate-400">Cuaderno de avisos pendientes para técnicos</p>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center space-x-3 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-300 flex items-center gap-1">
              <ClipboardList className="w-3.5 h-3.5 text-slate-400" />
              <strong>{totalClients}</strong> clientes
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-400 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <strong>{totalPending}</strong> avisos pendientes
            </span>
          </div>

          <button
            onClick={onOpenAddClient}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white px-3 py-2 rounded-lg text-xs md:text-sm font-semibold shadow-sm transition active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden md:inline">Nuevo Cliente</span>
            <span className="md:hidden">Nuevo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
