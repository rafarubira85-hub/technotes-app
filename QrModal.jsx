import React from 'react';
import { X, QrCode } from 'lucide-react';

export default function QrModal({ isOpen, onClose, title, imageSrc }) {
  if (!isOpen || !imageSrc) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4 text-center text-white relative">
        
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center space-x-2 text-sky-400 pt-1">
          <QrCode className="w-6 h-6" />
          <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>

        {/* Contenedor del QR */}
        <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200 inline-block mx-auto">
          <img
            src={imageSrc}
            alt={title}
            className="w-64 h-64 object-contain mx-auto rounded-lg"
          />
        </div>

        <p className="text-xs text-slate-400">
          Acerque la cámara del teléfono o lector para escanear el código QR.
        </p>

        {/* Acciones */}
        <div className="pt-1">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition border border-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
