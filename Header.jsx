import React, { useRef } from 'react';
import { Wrench, Plus, Users, AlertCircle, Download, Upload, List, Lock, QrCode, FolderOpen, Gauge, Smartphone, Package } from 'lucide-react';
import { QR_ALFAFAR, QR_VALENCIA } from './qrData.js';

// Enlace directo a la carpeta compartida de OneDrive / SharePoint para DOCUMENTACIÓN
const ONEDRIVE_URL = "https://eptait-my.sharepoint.com/:f:/g/personal/rafael_rubira_epta-iberia_com/IgCFmnnXz4vNRLBtWwSValqxARRCqqjrU21Y-aqpKbzG2R0?e=KHsvcp";

// Enlace directo al archivo de Control de Inventario en SharePoint / Excel
const INVENTARIO_URL = "https://eptait-my.sharepoint.com/:x:/r/personal/adriancoronado_coronado_epta-iberia_com/_layouts/15/Doc.aspx?sourcedoc=%7B73864401-F7E7-4748-B537-4F363D2B2017%7D&file=Control_Inventario_UNIFICADO.xlsx&fromShare=true&action=default&mobileredirect=true";

export default function Header({ onOpenAddClient, totalClients, totalPending, onRestoreComplete, selectedClientId, onBackToList, onLock, onOpenQr, onOpenPtCalculator, onInstallPwa }) {
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
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-30 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 py-2 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        
        {/* Fila 1: Logo + Acciones en móvil */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center space-x-2">
            <div className="bg-sky-600 p-1.5 rounded-xl text-white shadow-inner flex-shrink-0">
              <Wrench className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                TechNotes
                <span className="text-[10px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                  PRO
                </span>
              </h1>
            </div>
          </div>

          {/* Botones de acción compactos para móvil */}
          <div className="flex items-center space-x-1.5 md:hidden">
            <button
              onClick={handleExportBackup}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg border border-slate-700 transition"
              title="Descargar copia"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg border border-slate-700 transition"
              title="Restaurar copia"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={onLock}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 rounded-lg border border-slate-700 transition"
              title="Bloquear app"
            >
              <Lock className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenAddClient}
              className="flex items-center space-x-1 bg-sky-600 hover:bg-sky-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-xs shadow-md transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Cliente</span>
            </button>
          </div>
        </div>

        {/* Fila 2: Botones de acceso rápido */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-1.5 w-full md:w-auto py-0.5">
          {/* Fila superior de botones: Clientes (en móvil) + QR VALENCIA + QR ALFAFAR */}
          <div className="flex items-center gap-1.5 w-full md:w-auto">
            {selectedClientId && (
              <button
                onClick={onBackToList}
                className="md:hidden flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold px-2.5 py-1.5 rounded-lg text-xs border border-sky-500/40 transition active:scale-95 shadow-sm flex-shrink-0"
                title="Volver a la lista de clientes"
              >
                <List className="w-3.5 h-3.5 text-sky-400" />
                <span>Clientes</span>
              </button>
            )}

            <button
              onClick={() => onOpenQr('QR VALENCIA', QR_VALENCIA)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold px-2.5 py-1.5 rounded-lg border border-sky-500/40 transition active:scale-95 shadow-sm"
              title="Abrir QR Valencia"
            >
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              <span>QR VALENCIA</span>
            </button>

            <button
              onClick={() => onOpenQr('QR ALFAFAR', QR_ALFAFAR)}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/40 transition active:scale-95 shadow-sm"
              title="Abrir QR Alfafar"
            >
              <QrCode className="w-3.5 h-3.5 text-amber-400" />
              <span>QR ALFAFAR</span>
            </button>
          </div>

          {/* Fila inferior: CÓDIGO REFRIGERANTE, ONE DRIVE, INVENTARIO, REGLA P/T e INSTALAR APP */}
          <div className="flex items-center gap-1.5 w-full md:w-auto flex-wrap">
            <button
              onClick={() => onOpenQr('CÓDIGO REFRIGERANTE', 'refrigerante')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold px-2.5 py-1.5 rounded-lg border border-emerald-500/40 transition active:scale-95 shadow-sm"
              title="Abrir Códigos de Refrigerante"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>CÓDIGO REFRIGERANTE</span>
            </button>

            <a
              href={ONEDRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-bold px-2.5 py-1.5 rounded-lg border border-blue-500/40 transition active:scale-95 shadow-sm"
              title="Abrir Documentación en OneDrive"
            >
              <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
              <span>ONE DRIVE</span>
            </a>

            <a
              href={INVENTARIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold px-2.5 py-1.5 rounded-lg border border-purple-500/40 transition active:scale-95 shadow-sm"
              title="Abrir Control de Inventario en Excel"
            >
              <Package className="w-3.5 h-3.5 text-purple-400" />
              <span>INVENTARIO</span>
            </a>

            <button
              onClick={onOpenPtCalculator}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 font-bold px-2.5 py-1.5 rounded-lg border border-cyan-500/40 transition active:scale-95 shadow-sm"
              title="Abrir Regla P/T Frigorífica"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>REGLA P/T</span>
            </button>

            <button
              onClick={onInstallPwa}
              className="flex-1 md:flex-initial inline-flex items-center justify-center space-x-1 text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-bold px-2.5 py-1.5 rounded-lg border border-indigo-500/40 transition active:scale-95 shadow-sm"
              title="Instalar aplicación en móvil o PC"
            >
              <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
              <span>INSTALAR APP</span>
            </button>
          </div>
        </div>

        {/* Acciones para escritorio */}
        <div className="hidden md:flex items-center space-x-2.5">
          <div className="flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span><strong className="text-white">{totalClients}</strong> clientes</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center space-x-1.5 text-amber-400">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span><strong className="text-amber-300">{totalPending}</strong> avisos</span>
            </div>
          </div>

          <button
            onClick={handleExportBackup}
            className="inline-flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition"
            title="Descargar copia de seguridad"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Copia</span>
          </button>

          <button
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            className="inline-flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition"
            title="Restaurar copia de seguridad"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar</span>
          </button>

          <button
            onClick={onLock}
            className="inline-flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 font-medium px-2.5 py-2 rounded-lg border border-slate-700 transition"
            title="Bloquear app"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenAddClient}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-2 rounded-lg text-xs md:text-sm shadow-md transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Nuevo Cliente</span>
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          className="hidden"
        />

      </div>
    </header>
  );
}
