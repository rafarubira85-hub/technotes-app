import React, { useState } from 'react';
import { Search, MapPin, Phone, User, AlertTriangle, CheckCircle2, ChevronRight, Filter } from 'lucide-react';

// Función para normalizar texto (convierte a minúsculas y elimina tildes/acentos)
const normalizeText = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

export default function ClientList({ clients, selectedClientId, onSelectClient, searchTerm, setSearchTerm }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'urgent'

  const filteredClients = clients.filter(client => {
    // Filtro por tipo
    if (filterType === 'pending' && client.pending_notes_count === 0) return false;
    if (filterType === 'urgent' && (!client.urgent_notes_count || client.urgent_notes_count === 0)) return false;

    // Búsqueda por texto
    if (!searchTerm.trim()) return true;

    // Dividir la búsqueda del usuario en palabras clave independientes e ignorar acentos
    const searchWords = normalizeText(searchTerm).split(/\s+/).filter(Boolean);

    // Texto completo combinando nombre, código y dirección sin acentos
    const clientText = normalizeText(
      `${client.name} ${client.code || ''} ${client.address || ''} ${client.contact_person || ''}`
    );

    // Verificar que TODAS las palabras buscadas estén en el cliente
    return searchWords.every(word => clientText.includes(word));
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* Encabezado del buscador */}
      <div className="p-3 md:p-4 bg-slate-50/70 border-b border-slate-200 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, ciudad o dirección (ej: Lidl Burriana, Castellon)..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filtros rápidos */}
        <div className="flex items-center space-x-1 text-xs">
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
        </div>
      </div>

      {/* Lista de clientes */}
      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[calc(100vh-250px)] min-h-[300px]">
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
                  <div className="pt-1 flex items-center space-x-2">
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
                      <span className="inline-flex items-center space-x-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Sin pendientes</span>
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
    </div>
  );
}
