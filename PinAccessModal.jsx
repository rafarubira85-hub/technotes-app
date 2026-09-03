import React, { useState } from 'react';
import { Lock, KeyRound, ArrowRight } from 'lucide-react';

export default function PinAccessModal({ onAuthenticate }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAuthenticate(pin.trim())) {
      setError('');
    } else {
      setError('PIN o contraseña incorrecta');
      setPin('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 text-center text-white">
        
        {/* Icono de Seguridad */}
        <div className="mx-auto bg-sky-600/20 text-sky-400 p-4 rounded-2xl w-16 h-16 flex items-center justify-center border border-sky-500/30">
          <Lock className="w-8 h-8 stroke-[2.2]" />
        </div>

        {/* Título */}
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            TechNotes <span className="text-xs bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full uppercase">PRO</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium">
            Acceso privado para técnicos. Introduzca su PIN de empresa.
          </p>
        </div>

        {/* Formulario de PIN */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 p-3 rounded-xl text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="relative">
            <KeyRound className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN de acceso"
              className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none text-center font-mono text-lg tracking-widest transition"
              autoFocus
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center space-x-2 text-sm"
          >
            <span>Acceder a la Aplicación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
