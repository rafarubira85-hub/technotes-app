import React, { useState, useEffect } from 'react';
import { X, QrCode, ZoomIn, ZoomOut, ExternalLink, Image as ImageIcon } from 'lucide-react';

export default function QrModal({ isOpen, onClose, title, imageSrc }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
    }
  }, [isOpen, title]);

  if (!isOpen || !imageSrc) return null;

  const handleClose = () => {
    setZoomLevel(1);
    onClose();
  };

  const isQr = title ? title.toLowerCase().includes('qr') : false;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 text-center text-white relative max-h-[92vh] flex flex-col my-auto">
        
        {/* Botón Cerrar */}
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-center space-x-2 text-sky-400 pt-1">
          {isQr ? <QrCode className="w-6 h-6" /> : <ImageIcon className="w-6 h-6 text-emerald-400" />}
          <h3 className="text-lg sm:text-xl font-bold text-white pr-6">{title}</h3>
        </div>

        {/* Botones de control de Zoom */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={() => setZoomLevel(prev => Math.min(prev + 0.4, 3))}
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-sky-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition active:scale-95"
            title="Aumentar zoom"
          >
            <ZoomIn className="w-3.5 h-3.5" />
            <span>Ampliar (+50%)</span>
          </button>

          {zoomLevel > 1 && (
            <button
              onClick={() => setZoomLevel(1)}
              className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition active:scale-95"
              title="Restablecer tamaño normal"
            >
              <ZoomOut className="w-3.5 h-3.5" />
              <span>Tamaño Normal</span>
            </button>
          )}

          <a
            href={imageSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-medium px-3 py-1.5 rounded-lg border border-slate-700 transition active:scale-95"
            title="Abrir imagen completa en nueva pestaña"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Imagen Completa</span>
          </a>
        </div>

        {/* Contenedor de la Imagen con Scroll y Zoom */}
        <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-inner border border-slate-200 overflow-auto max-h-[62vh] flex-1 flex items-center justify-center touch-pan-x touch-pan-y">
          <div className="transition-transform duration-200 ease-out origin-center" style={{ transform: `scale(${zoomLevel})` }}>
            <img
              src={imageSrc}
              alt={title}
              className={`${isQr ? 'w-64 h-64 object-contain' : 'max-w-full h-auto object-contain min-w-[240px]'} rounded-lg select-none`}
              style={{ touchAction: 'manipulation' }}
            />
          </div>
        </div>

        <p className="text-xs text-slate-400">
          {isQr ? 'Acerque la cámara del teléfono o lector para escanear.' : '💡 Puedes pulsar en "Ampliar" o deslizar/hacer zoom con dos dedos en tu móvil para consultar los códigos.'}
        </p>

        {/* Acciones */}
        <div className="pt-1">
          <button
            onClick={handleClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition border border-slate-700"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
