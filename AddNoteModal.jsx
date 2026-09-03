import React, { useState } from 'react';
import { X, Send, AlertTriangle, User, Tag, FileText } from 'lucide-react';

export default function AddNoteModal({ isOpen, onClose, clientId, clientName, onSubmitNote }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [category, setCategory] = useState('mantenimiento');
  const [technicianName, setTechnicianName] = useState(localStorage.getItem('tech_name') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !technicianName.trim()) {
      setError('Por favor complete el título, la descripción y su nombre de técnico');
      return;
    }

    localStorage.setItem('tech_name', technicianName.trim());

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmitNote({
        client_id: clientId,
        title: title.trim(),
        content: content.trim(),
        priority,
        category,
        technician_name: technicianName.trim(),
      });

      setTitle('');
      setContent('');
      setPriority('normal');
      setCategory('mantenimiento');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar la nota');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header del Modal */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Añadir Aviso para Próxima Visita</h3>
            <p className="text-xs text-slate-300">Cliente: <strong className="text-amber-400">{clientName}</strong></p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs md:text-sm">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-200 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Nombre del Técnico */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-500" /> Su Nombre (Técnico):
            </label>
            <input
              type="text"
              value={technicianName}
              onChange={(e) => setTechnicianName(e.target.value)}
              placeholder="Ej: Carlos Gómez"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              required
            />
          </div>

          {/* Título de la nota */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-500" /> Resumen / Título corto:
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Limpiar condensador exterior, Traer junta 3/4..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              required
            />
          </div>

          {/* Prioridad y Categoría */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-slate-500" /> Prioridad:
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none font-medium"
              >
                <option value="normal">⚡ Normal / Pendiente</option>
                <option value="alta">🔥 Alta / Urgente</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-500" /> Categoría:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none font-medium"
              >
                <option value="mantenimiento">🔧 Mantenimiento</option>
                <option value="repuesto">📦 Repuesto a pedir</option>
                <option value="presupuesto">📄 Pendiente de presupuesto</option>
                <option value="averia">⚠️ Avería / Revisión</option>
                <option value="general">📝 Observación general</option>
              </select>
            </div>
          </div>

          {/* Detalle explicativo */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Detalle de lo que debe hacer el próximo técnico:
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Explique claramente qué se observó, herramientas necesarias o repuestos a traer..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              required
            />
          </div>

          {/* Botones de acción */}
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
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow-md transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Aviso'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
