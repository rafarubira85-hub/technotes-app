import React, { useState } from 'react';
import { 
  Building2, MapPin, Phone, User, Wrench, AlertTriangle, 
  CheckCircle2, PlusCircle, Clock, ShieldAlert, FileText, Check, ArrowLeft, History, RotateCcw, Trash2 
} from 'lucide-react';

export default function ClientDetail({ client, onOpenAddNote, onOpenCompleteNote, onReopenNote, onDeleteNote, onBack }) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

  if (!client) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Building2 className="w-12 h-12 text-slate-300 stroke-[1.5]" />
        <div>
          <p className="text-base font-semibold text-slate-600">Seleccione un cliente de la lista</p>
          <p className="text-xs text-slate-400 mt-1">Consulte los avisos antes de iniciar su trabajo o deje observaciones para la próxima visita.</p>
        </div>
      </div>
    );
  }

  const pendingNotes = client.notes ? client.notes.filter(n => n.status === 'pendiente') : [];
  const completedNotes = client.notes ? client.notes.filter(n => n.status === 'completado') : [];
  const hasUrgent = pendingNotes.some(n => n.priority === 'alta');

  const renderCategoryBadge = (cat) => {
    switch (cat) {
      case 'presupuesto':
        return (
          <span className="text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 px-2 py-0.5 rounded uppercase">
            📄 Pendiente de presupuesto
          </span>
        );
      case 'repuesto':
        return (
          <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded uppercase">
            📦 Repuesto a pedir
          </span>
        );
      case 'mantenimiento':
        return (
          <span className="text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded uppercase">
            🔧 Mantenimiento
          </span>
        );
      case 'averia':
        return (
          <span className="text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded uppercase">
            ⚠️ Avería / Revisión
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded uppercase">
            📝 {cat || 'General'}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      
      {/* Cabecera del Cliente */}
      <div className="bg-slate-900 text-white p-4 md:p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            {onBack && (
              <button 
                onClick={onBack}
                className="md:hidden inline-flex items-center space-x-1 text-xs text-slate-300 hover:text-white mb-2 bg-slate-800 px-2 py-1 rounded"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a la lista</span>
              </button>
            )}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                {client.code}
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{client.name}</h2>
            </div>
          </div>

          <button
            onClick={() => onOpenAddNote(client.id)}
            className="flex items-center space-x-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 rounded-lg text-xs md:text-sm shadow-md transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Añadir Aviso</span>
          </button>
        </div>

        {/* Ficha técnica rápida */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-800 text-slate-300">
          {client.address && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{client.address}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center space-x-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <a href={`tel:${client.phone}`} className="hover:underline text-sky-400 font-semibold">{client.phone}</a>
            </div>
          )}
          {client.contact_person && (
            <div className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Contacto: <strong>{client.contact_person}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Alerta Destacada para el Técnico si hay urgentes */}
      {hasUrgent && (
        <div className="bg-rose-50 border-b border-rose-200 p-3.5 flex items-start space-x-3 text-rose-900 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="font-bold text-rose-700">¡AVISO URGENTE PARA ESTA VISITA!</strong>
            <p className="mt-0.5 text-rose-800">Hay observaciones de alta prioridad dejadas por un compañero anterior. Por favor, revíselas a continuación.</p>
          </div>
        </div>
      )}

      {/* Selector de Pestañas (Pendientes vs Historial) */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 text-xs font-semibold px-4 pt-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`py-2.5 px-4 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'pending'
              ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Avisos Pendientes ({pendingNotes.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-2.5 px-4 flex items-center space-x-2 border-b-2 transition ${
            activeTab === 'history'
              ? 'border-sky-600 text-sky-700 bg-white rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-slate-400" />
          <span>Historial Resuelto ({completedNotes.length})</span>
        </button>
      </div>

      {/* Contenido principal de notas */}
      <div className="p-4 overflow-y-auto flex-1 max-h-[calc(100vh-320px)] space-y-3">
        {activeTab === 'pending' ? (
          pendingNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">¡Todo al día con este cliente!</p>
              <p className="text-xs text-slate-500">No hay observaciones ni avisos pendientes registrados.</p>
              <button
                onClick={() => onOpenAddNote(client.id)}
                className="mt-3 inline-flex items-center space-x-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Añadir la primera nota</span>
              </button>
            </div>
          ) : (
            pendingNotes.map((note) => {
              const isHigh = note.priority === 'alta';
              return (
                <div
                  key={note.id}
                  className={`rounded-xl border p-4 shadow-sm transition space-y-3 ${
                    isHigh 
                      ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-200' 
                      : 'bg-amber-50/40 border-amber-200/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isHigh ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'
                          }`}
                        >
                          {isHigh ? '🔥 Alta Prioridad' : '⚡ Aviso Pendiente'}
                        </span>
                        {renderCategoryBadge(note.category)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-base">{note.title}</h3>
                    </div>

                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 transition"
                      title="Eliminar nota"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs md:text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white/80 p-3 rounded-lg border border-slate-200/60">
                    {note.content}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs border-t border-slate-200/60">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Anotado por: <strong className="text-slate-800">{note.technician_name}</strong></span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(note.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <button
                      onClick={() => onOpenCompleteNote(note)}
                      className="inline-flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition shadow-sm active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      <span>Marcar como Atendido</span>
                    </button>
                  </div>
                </div>
              );
            })
          )
        ) : (
          completedNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm font-medium">No hay avisos resueltos en el historial</p>
            </div>
          ) : (
            completedNotes.map((note) => (
              <div key={note.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 opacity-90">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      ✓ RESUELTO
                    </span>
                    <h4 className="font-semibold text-slate-800 text-sm mt-1 line-through decoration-slate-400">{note.title}</h4>
                  </div>
                  <button
                    onClick={() => onReopenNote(note.id)}
                    className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center space-x-1 bg-sky-50 px-2 py-1 rounded border border-sky-200"
                    title="Reabrir nota"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reabrir</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 bg-white p-2.5 rounded border border-slate-200">
                  {note.content}
                </p>

                {note.resolution_comment && (
                  <div className="text-xs bg-emerald-50 text-emerald-900 p-2.5 rounded border border-emerald-200">
                    <strong>Comentario de resolución:</strong> {note.resolution_comment}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Nota original: <strong>{note.technician_name}</strong></span>
                  <span>Atendido por: <strong className="text-slate-700">{note.resolved_by}</strong> ({new Date(note.resolved_at).toLocaleDateString('es-ES')})</span>
                </div>
              </div>
            ))
          )
        )}
      </div>

    </div>
  );
}
