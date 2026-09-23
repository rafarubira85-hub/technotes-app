import React, { useState } from 'react';
import { X, CheckCircle2, User, MessageSquare, Calendar } from 'lucide-react';

const getTodayStr = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getYesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CompleteNoteModal({ isOpen, onClose, note, onCompleteNote }) {
  const [resolvedBy, setResolvedBy] = useState(localStorage.getItem('tech_name') || '');
  const [resolvedDate, setResolvedDate] = useState(() => getTodayStr());
  const [resolutionComment, setResolutionComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !note) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resolvedBy.trim()) {
      setError('Por favor indique su nombre de técnico');
      return;
    }

    if (!resolvedDate) {
      setError('Por favor seleccione la fecha de realización');
      return;
    }

    localStorage.setItem('tech_name', resolvedBy.trim());

    setIsSubmitting(true);
    setError('');

    try {
      // Construir timestamp ISO a partir de la fecha seleccionada
      const [y, m, d] = resolvedDate.split('-').map(Number);
      const now = new Date();
      const completionDateTime = new Date(y, m - 1, d, now.getHours(), now.getMinutes(), now.getSeconds());
      const resolvedAtIso = isNaN(completionDateTime.getTime()) 
        ? new Date().toISOString() 
        : completionDateTime.toISOString();

      await onCompleteNote(note.id, {
        resolved_by: resolvedBy.trim(),
        resolution_comment: resolutionComment.trim(),
        resolved_at: resolvedAtIso
      });
      setResolutionComment('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al completar la nota');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
        
        <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold text-base md:text-lg">Marcar Aviso como Atendido</h3>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs md:text-sm">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-200 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500">Aviso seleccionado:</span>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{note.title}</p>
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{note.content}</p>
          </div>

          {/* Selector de Fecha de Realización */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Fecha del trabajo:
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setResolvedDate(getTodayStr())}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium border transition ${
                    resolvedDate === getTodayStr()
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Hoy
                </button>
                <button
                  type="button"
                  onClick={() => setResolvedDate(getYesterdayStr())}
                  className={`px-2 py-0.5 text-[11px] rounded font-medium border transition ${
                    resolvedDate === getYesterdayStr()
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  Ayer
                </button>
              </div>
            </div>
            <input
              type="date"
              value={resolvedDate}
              onChange={(e) => setResolvedDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none font-medium text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Su Nombre (Técnico que resuelve):
            </label>
            <input
              type="text"
              value={resolvedBy}
              onChange={(e) => setResolvedBy(e.target.value)}
              placeholder="Ej: Juan Pérez"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Observación / Comentario final (opcional):
            </label>
            <textarea
              rows={3}
              value={resolutionComment}
              onChange={(e) => setResolutionComment(e.target.value)}
              placeholder="Ej: Se limpió con hidrolimpiadora y desengrasante. Presión dejada a 3.8 bar OK."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-md transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Completar Aviso'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
