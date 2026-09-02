import React, { useRef } from 'react';
import { Wrench, Plus, Users, AlertCircle, Download, Upload, List } from 'lucide-react';

export default function Header({ onOpenAddClient, totalClients, totalPending, onRestoreComplete, selectedClientId, onBackToList }) {
  const fileInputRef = useRef(null);

  const handleExportBackup = () => {
    window.location.href = '/api/backup';
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      if (!backupData.clients || !Array.isArray(backupData.clients)) {
        alert('El archivo seleccionado no es una copia de seguridad válida.');
        return;
      }

      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`✅ Copia de seguridad restaurada con éxito.\nSe recuperaron ${data.clients_count} clientes y ${data.notes_count} avisos.`);
        if (onRestoreComplete) onRestoreComplete();
      } else {
        alert('❌ Error al restaurar copia: ' + (data.error || 'Desconocido'));
      }
    } catch (err) {
      alert('❌ Error al leer el archivo de copia de seguridad: ' + err.message);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Logotipo y Título */}
        <div className="flex items-center space-x-3">
          <div className="bg-sky-600 p-2 rounded-xl text-white shadow-inner">
            <Wrench className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              TechNotes
              <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Cuaderno digital de avisos y clientes para técnicos
            </p>
          </div>
        </div>

        {/* Resumen e Indicadores */}
        <div className="flex items-center space-x-2 md:space-x-3 flex-wrap">
          <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-white">{totalClients}</strong> clientes</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-amber-300">{totalPending}</strong> avisos pendientes</span>
            </div>
          </div>

          {/* Botones de Copia de Seguridad */}
          <div className="flex items-center space-x-1.5">
            <button
              onClick={handleExportBackup}
              className="inline-flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition"
              title="Descargar copia de seguridad en tu equipo o móvil"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Copia</span>
            </button>

            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="inline-flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition"
              title="Restaurar copia de seguridad previamente guardada"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar</span>
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {/* Botón Nuevo Cliente */}
          <button
            onClick={onOpenAddClient}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-2 rounded-lg text-xs md:text-sm shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Nuevo Cliente</span>
            <span className="sm:hidden">+ Cliente</span>
          </button>

          {/* Botón CLIENTES arriba en la cabecera (Destacado para móvil) */}
          {selectedClientId && (
            <button
              onClick={onBackToList}
              className="md:hidden flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold px-3 py-2 rounded-lg text-xs border border-sky-500/40 transition active:scale-95 shadow-sm"
              title="Volver a la lista de clientes"
            >
              <List className="w-4 h-4 text-sky-400" />
              <span>Clientes</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
