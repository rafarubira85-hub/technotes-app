import React, { useState, useMemo } from 'react';
import { 
  Search, MapPin, Phone, User, AlertTriangle, CheckCircle2, 
  ChevronRight, Filter, FileText, Clock, ShieldAlert, Sparkles, Building2
} from 'lucide-react';

// Función para normalizar texto (convierte a minúsculas y elimina tildes/acentos)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default function ClientList({ 
  clients, 
  selectedClientId, 
  onSelectClient, 
  searchTerm, 
  setSearchTerm,
  selectedNoteId
}) {
  const [viewMode, setViewMode] = useState('clients'); // 'clients' | 'notes'
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'urgent', 'resueltos'
  const [noteStatusFilter, setNoteStatusFilter] = useState('all'); // 'all', 'pending', 'urgent', 'completed'
  const [technicianFilter, setTechnicianFilter] = useState('all'); // 'all', 'Rafa', 'Rubén'

  // Total de avisos pendientes globales
  const totalPendingNotes = useMemo(() => {
    return clients.reduce((acc, c) => acc + (c.pending_notes_count || 0), 0);
  }, [clients]);

  // Lista de todos los avisos aplanada con datos del cliente
  const allNotes = useMemo(() => {
    const list = [];
    clients.forEach(client => {
      if (Array.isArray(client.notes)) {
        client.notes.forEach(note => {
          list.push({
            ...note,
            client_id: client.id,
            client_name: client.name,
            client_code: client.code,
            client_address: client.address
          });
        });
      }
    });
    // Ordenar: pendientes primero, urgentes primero, luego más recientes
    list.sort((a, b) => {
      if (a.status === 'pendiente' && b.status !== 'pendiente') return -1;
      if (a.status !== 'pendiente' && b.status === 'pendiente') return 1;
      if (a.priority === 'alta' && b.priority !== 'alta') return -1;
      if (a.priority !== 'alta' && b.priority === 'alta') return 1;
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });
    return list;
  }, [clients]);

  // Clientes filtrados
  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      // Filtro por tipo
      if (filterType === 'pending' && client.pending_notes_count === 0) return false;
      if (filterType === 'urgent' && (!client.urgent_notes_count || client.urgent_notes_count === 0)) return false;
      if (filterType === 'resueltos' && (!client.completed_notes_count || client.completed_notes_count === 0)) return false;

      // Búsqueda por texto
      if (!searchTerm.trim()) return true;

      const searchWords = normalizeText(searchTerm).split(/\s+/).filter(Boolean);
      const clientText = normalizeText(
        `${client.name} ${client.code || ''} ${client.address || ''} ${client.contact_person || ''}`
      );

      return searchWords.every(word => clientText.includes(word));
    });
  }, [clients, filterType, searchTerm]);

  // Avisos globales filtrados
  const filteredNotes = useMemo(() => {
    return allNotes.filter(note => {
      // Filtro por estado
      if (noteStatusFilter === 'pending' && note.status !== 'pendiente') return false;
      if (noteStatusFilter === 'urgent' && (note.status !== 'pendiente' || note.priority !== 'alta')) return false;
      if (noteStatusFilter === 'completed' && note.status !== 'completado') return false;

      // Filtro por técnico
      if (technicianFilter !== 'all') {
        const tech = (note.technician_name || '').trim().toLowerCase();
        if (technicianFilter.toLowerCase() !== tech) return false;
      }

      // Búsqueda por texto
      if (!searchTerm.trim()) return true;

      const searchWords = normalizeText(searchTerm).split(/\s+/).filter(Boolean);
      const noteText = normalizeText(
        `${note.title || ''} ${note.description || ''} ${note.solution || ''} ${note.category || ''} ${note.technician_name || ''} ${note.client_name || ''} ${note.client_code || ''} ${note.client_address || ''}`
      );

      return searchWords.every(word => noteText.includes(word));
    });
  }, [allNotes, noteStatusFilter, technicianFilter, searchTerm]);

  const renderCategoryBadge = (cat) => {
    switch (cat) {
      case 'presupuesto':
        return <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 border border-purple-200 px-1.5 py-0.2 rounded">📄 Presupuesto</span>;
      case 'repuesto':
        return <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.2 rounded">📦 Repuesto</span>;
      case 'mantenimiento':
        return <span className="text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200 px-1.5 py-0.2 rounded">🔧 Mantenimiento</span>;
      case 'averia':
      default:
        return <span className="text-[10px] font-semibold bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.2 rounded">⚠️ Avería</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Pestañas de Modo: Clientes vs Buscador Global de Avisos */}
      <div className="flex border-b border-slate-200 bg-slate-100/80 p-1 gap-1">
        <button
          onClick={() => setViewMode('clients')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            viewMode === 'clients'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
          }`}
        >
          <Building2 className="w-4 h-4 text-sky-600" />
          <span>Clientes</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            viewMode === 'clients' ? 'bg-sky-100 text-sky-700' : 'bg-slate-200 text-slate-600'
          }`}>
            {clients.length}
          </span>
        </button>

        <button
          onClick={() => setViewMode('notes')}
          className={`flex-1 py-2 px-3 text-xs md:text-sm font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            viewMode === 'notes'
              ? 'bg-white text-slate-800 shadow-sm border border-slate-200/80'
              : 'text-slate-600 hover:text-slate-800 hover:bg-slate-200/50'
          }`}
        >
          <FileText className="w-4 h-4 text-amber-500" />
          <span>Avisos / Averías</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            totalPendingNotes > 0 
              ? 'bg-amber-100 text-amber-800 font-bold border border-amber-300' 
              : 'bg-slate-200 text-slate-600'
          }`}>
            {totalPendingNotes > 0 ? `${totalPendingNotes} pend.` : allNotes.length}
          </span>
        </button>
      </div>

      {/* Encabezado del buscador y filtros */}
      <div className="p-3 md:p-4 bg-slate-50/70 border-b border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              viewMode === 'clients'
                ? "Buscar por cliente, ciudad o dirección (ej: Lidl Burriana)..."
                : "Buscar en avisos (ej: compresor, fuga R449A, ventilador, Rafa)..."
            }
            className="w-full pl-9 pr-16 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-1.5 py-0.5 rounded transition"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros para modo CLIENTES */}
        {viewMode === 'clients' && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtro:
            </span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'all'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({clients.length})
            </button>
            <button
              onClick={() => setFilterType('pending')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              Con Pendientes ({clients.filter(c => c.pending_notes_count > 0).length})
            </button>
            <button
              onClick={() => setFilterType('urgent')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'urgent'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Urgentes ({clients.filter(c => c.urgent_notes_count > 0).length})
            </button>
            <button
              onClick={() => setFilterType('resueltos')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'resueltos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Resueltos ({clients.filter(c => (c.completed_notes_count || 0) > 0).length})
            </button>
          </div>
        )}

        {/* Filtros para modo AVISOS / AVERÍAS */}
        {viewMode === 'notes' && (
          <div className="space-y-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Estado:
              </span>
              <button
                onClick={() => setNoteStatusFilter('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  noteStatusFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Todos ({allNotes.length})
              </button>
              <button
                onClick={() => setNoteStatusFilter('pending')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  noteStatusFilter === 'pending'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Pendientes ({allNotes.filter(n => n.status === 'pendiente').length})
              </button>
              <button
                onClick={() => setNoteStatusFilter('urgent')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  noteStatusFilter === 'urgent'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Urgentes ({allNotes.filter(n => n.status === 'pendiente' && n.priority === 'alta').length})
              </button>
              <button
                onClick={() => setNoteStatusFilter('completed')}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  noteStatusFilter === 'completed'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                Resueltos ({allNotes.filter(n => n.status === 'completado').length})
              </button>
            </div>

            {/* Filtro por técnico */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Técnico:
              </span>
              {['all', 'Rafa', 'Rubén'].map(tech => (
                <button
                  key={tech}
                  onClick={() => setTechnicianFilter(tech)}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                    technicianFilter === tech
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tech === 'all' ? 'Todos' : tech}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contenido de la lista: MODO CLIENTES */}
      {viewMode === 'clients' && (
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
          {filteredClients.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <p className="text-sm font-medium">No se encontraron clientes</p>
              <p className="text-xs mt-1">Pruebe a cambiar el filtro o la búsqueda</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const isSelected = client.id === selectedClientId;
              const hasUrgent = client.urgent_notes_count > 0;
              const hasPending = client.pending_notes_count > 0;
              const hasCompleted = (client.completed_notes_count || 0) > 0;

              return (
                <button
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className={`w-full text-left p-3.5 transition flex items-start justify-between group ${
                    isSelected
                      ? 'bg-sky-50/80 border-l-4 border-sky-600 pl-3'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="space-y-1 pr-2 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-800 text-sm md:text-base group-hover:text-sky-700 transition">
                        {client.name}
                      </span>
                      <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                        {client.code}
                      </span>
                    </div>

                    {client.address && (
                      <div className="text-xs text-slate-500 flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{client.address}</span>
                      </div>
                    )}

                    {client.equipment_info && (
                      <div className="text-[11px] text-slate-400 italic truncate max-w-xs">
                        ⚙️ {client.equipment_info}
                      </div>
                    )}

                    {/* Estado de avisos */}
                    <div className="pt-1 flex flex-wrap items-center gap-1.5">
                      {hasUrgent ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          <span>{client.urgent_notes_count} aviso(s) urgente(s)</span>
                        </span>
                      ) : hasPending ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>{client.pending_notes_count} aviso(s) pendiente(s)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-slate-400" />
                          <span>Sin pendientes</span>
                        </span>
                      )}

                      {hasCompleted && (
                        <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{client.completed_notes_count} resuelto(s)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center self-center text-slate-300 group-hover:text-sky-600 transition">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Contenido de la lista: MODO AVISOS Y AVERÍAS */}
      {viewMode === 'notes' && (
        <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-280px)] min-h-[300px]">
          {filteredNotes.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium">No se encontraron avisos</p>
              <p className="text-xs mt-1">Pruebe a cambiar el texto de búsqueda o el filtro de estado</p>
            </div>
          ) : (
            filteredNotes.map((note) => {
              const isUrgent = note.priority === 'alta' && note.status === 'pendiente';
              const isCompleted = note.status === 'completado';
              const isSelected = note.id === selectedNoteId;

              return (
                <button
                  key={note.id}
                  onClick={() => onSelectClient(note.client_id, note.id)}
                  className={`w-full text-left p-3.5 transition flex items-start justify-between group ${
                    isSelected
                      ? 'bg-amber-50/80 border-l-4 border-amber-500 pl-3'
                      : isUrgent
                      ? 'bg-rose-50/40 hover:bg-rose-50 border-l-4 border-rose-500 pl-3'
                      : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="space-y-1.5 pr-2 flex-1">
                    {/* Cliente y Código */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        🏢 {note.client_name}
                      </span>
                      {note.client_code && (
                        <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1 py-0.2 rounded border border-slate-200">
                          {note.client_code}
                        </span>
                      )}
                      {renderCategoryBadge(note.category)}
                    </div>

                    {/* Título de la avería */}
                    <h4 className="font-bold text-slate-800 text-sm group-hover:text-sky-700 transition leading-snug">
                      {note.title}
                    </h4>

                    {/* Descripción de la avería */}
                    {note.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {note.description}
                      </p>
                    )}

                    {/* Metadatos: Estado, Técnico y Fecha */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                      {isUrgent ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-300 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-rose-600" />
                          Urgente
                        </span>
                      ) : !isCompleted ? (
                        <span className="inline-flex items-center gap-1 font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Pendiente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Resuelto
                        </span>
                      )}

                      {note.technician_name && (
                        <span className="text-slate-500 font-medium">
                          👤 {note.technician_name}
                        </span>
                      )}

                      {note.created_at && (
                        <span className="text-slate-400">
                          📅 {new Date(note.created_at).toLocaleDateString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center self-center text-slate-300 group-hover:text-sky-600 transition pl-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
