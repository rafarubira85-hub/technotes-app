import React, { useState } from 'react';
import { X, Copy, Check, Truck, Building2, MapPin, FileBadge2 } from 'lucide-react';

export default function InfoModal({ isOpen, onClose, type }) {
  const [copiedField, setCopiedField] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const isNacex = type === 'nacex';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className={`p-4 flex items-center justify-between text-white ${
          isNacex ? 'bg-gradient-to-r from-amber-600 to-orange-600' : 'bg-gradient-to-r from-blue-700 to-indigo-800'
        }`}>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-white/15 rounded-xl shadow-inner">
              {isNacex ? <Truck className="w-5 h-5 text-white" /> : <Building2 className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                {isNacex ? 'Información NACEX' : 'Dirección y Datos EPTA'}
              </h3>
              <p className="text-[11px] text-white/80">
                {isNacex ? 'Datos de cuenta y abonado para envíos' : 'Datos fiscales y dirección de entrega'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-xl transition text-white/90 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {isNacex ? (
            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-2">
                <span className="text-xs uppercase font-bold text-amber-800 tracking-wider">Número de Abonado</span>
                <div className="text-2xl font-black font-mono text-slate-800 tracking-tight bg-white px-4 py-2 rounded-lg border border-amber-300 shadow-inner">
                  2828/02460
                </div>
                <p className="text-xs text-slate-500">
                  Indica este número al solicitar una recogida o realizar un envío con Nacex.
                </p>
              </div>

              <button
                onClick={() => handleCopy('2828/02460', 'abonado')}
                className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition"
              >
                {copiedField === 'abonado' ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>¡Abonado copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-white" />
                    <span>Copiar número de abonado</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Tarjeta Dirección */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  <span>Dirección</span>
                </div>
                <p className="text-sm font-semibold text-slate-800 leading-snug">
                  Avenida de Italia 10, 28821, Coslada (Comunidad de Madrid)
                </p>
                <button
                  onClick={() => handleCopy('Avenida de Italia 10, 28821, Coslada (Comunidad de Madrid)', 'direccion')}
                  className="mt-1 inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  {copiedField === 'direccion' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'direccion' ? '¡Dirección copiada!' : 'Copiar dirección'}</span>
                </button>
              </div>

              {/* Tarjeta CIF */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-500 uppercase tracking-wide">
                  <FileBadge2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>CIF</span>
                </div>
                <p className="text-base font-mono font-bold text-slate-800">
                  A28310613
                </p>
                <button
                  onClick={() => handleCopy('A28310613', 'cif')}
                  className="mt-1 inline-flex items-center space-x-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  {copiedField === 'cif' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedField === 'cif' ? '¡CIF copiado!' : 'Copiar CIF'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie con botón cerrar */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
