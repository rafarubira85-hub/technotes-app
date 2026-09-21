import React, { useState, useEffect } from 'react';
import { 
  Building2, MapPin, Phone, User, Wrench, AlertTriangle, 
  CheckCircle2, PlusCircle, Clock, ShieldAlert, FileText, Check, ArrowLeft, History, RotateCcw, Trash2, Pencil, ArrowUpDown
} from 'lucide-react';

export default function ClientDetail({ 
  client, 
  onOpenAddNote, 
  onOpenCompleteNote, 
  onReopenNote, 
  onDeleteNote, 
  onOpenEditNote, 
  onOpenEditClient,
  onDeleteClient,
  onBack,
  selectedNoteId 
}) {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'
  const [sortOrder, setSortOrder] = useState('desc'); // 'desc' | 'asc'

  // Si se selecciona un aviso desde el buscador global, cambiar la pestaña activa automáticamente
  useEffect(() => {
    if (selectedNoteId && client && Array.isArray(client.notes)) {
      const foundNote = client.notes.find(n => n.id === selectedNoteId);
      if (foundNote) {
        if (foundNote.status === 'completado') {
          setActiveTab('history');
        } else {
          setActiveTab('pending');
        }
      }
    }
  }, [selectedNoteId, client]);

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

  const rawPendingNotes = client.notes ? client.notes.filter(n => n.status === 'pendiente') : [];
  const rawCompletedNotes = client.notes ? client.notes.filter(n => n.status === 'completado') : [];

  const pendingNotes = [...rawPendingNotes].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

  const completedNotes = [...rawCompletedNotes].sort((a, b) => {
    const dateA = new Date(a.created_at || 0).getTime();
    const dateB = new Date(b.created_at || 0).getTime();
    return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
  });

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
            <div className="flex items-center space-x-3">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">{client.name}</h2>
              <span className="text-xs font-mono font-bold bg-slate-800 text-sky-300 px-2.5 py-1 rounded-md border border-slate-700">
                {client.code}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => onOpenEditClient(client)}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition"
              title="Editar datos del cliente"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDeleteClient(client.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition"
              title="Eliminar cliente"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onOpenAddNote(client.id)}
              className="flex items-center space-x-1 bg-sky-600 hover:bg-sky-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition ml-1 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Aviso</span>
            </button>
          </div>
        </div>

        {/* Ficha técnica y datos de contacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
          {client.address && (
            <div className="flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{client.address}</span>
            </div>
          )}
          {client.equipment_info && (
            <div className="flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>Instalación: <strong>{client.equipment_info}</strong></span>
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
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs">
                <span className="text-slate-500 font-medium">Avisos pendientes ({pendingNotes.length}):</span>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs border transition active:scale-95 shadow-xs ${
                    sortOrder === 'asc'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title={sortOrder === 'desc' ? 'Orden actual: Más recientes primero (Descendente). Clic para ordenar más antiguos primero (Ascendente).' : 'Orden actual: Más antiguos primero (Ascendente). Clic para ordenar más recientes primero (Descendente).'}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>{sortOrder === 'desc' ? '📅 Más recientes (Desc)' : '📅 Más antiguos (Asc)'}</span>
                </button>
              </div>

              {pendingNotes.map((note) => {
                const isHigh = note.priority === 'alta';
                return (
                  <div
                    key={note.id}
                    className={`rounded-xl border p-4 shadow-sm transition space-y-3 ${
                      note.id === selectedNoteId ? 'ring-2 ring-sky-500 shadow-md ' : ''
                    }${
                      isHigh 
                        ? 'bg-rose-50/50 border-rose-200 ring-1 ring-rose-200' 
                        : 'bg-amber-50/40 border-amber-200/80'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <h4 className="font-bold text-slate-900 text-sm md:text-base">{note.title}</h4>
                          {renderCategoryBadge(note.category)}
                          {isHigh && (
                            <span className="text-[10px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-full animate-pulse shadow-xs">
                              ¡PRIORIDAD ALTA!
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => onOpenEditNote(note)}
                          className="text-slate-400 hover:text-sky-600 p-1 transition"
                          title="Editar aviso"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition"
                          title="Eliminar aviso"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
              })}
            </div>
          )
        ) : (
          completedNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm font-medium">No hay avisos resueltos en el historial</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 text-xs">
                <span className="text-slate-500 font-medium">Historial resuelto ({completedNotes.length}):</span>
                <button
                  onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium text-xs border transition active:scale-95 shadow-xs ${
                    sortOrder === 'asc'
                      ? 'bg-amber-100 text-amber-900 border-amber-300'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                  title={sortOrder === 'desc' ? 'Orden actual: Más recientes primero (Descendente). Clic para ordenar más antiguos primero (Ascendente).' : 'Orden actual: Más antiguos primero (Ascendente). Clic para ordenar más recientes primero (Descendente).'}
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                  <span>{sortOrder === 'desc' ? '📅 Más recientes (Desc)' : '📅 Más antiguos (Asc)'}</span>
                </button>
              </div>

              {completedNotes.map((note) => (
                <div key={note.id} className={`bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 opacity-90 ${note.id === selectedNoteId ? 'ring-2 ring-sky-500 shadow-md !opacity-100' : ''}`}>
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
              ))}
            </div>
          )
        )}
      </div>

    </div>
  );
}
