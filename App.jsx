import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import ClientList from './components/ClientList.jsx';
import ClientDetail from './components/ClientDetail.jsx';
import AddClientModal from './components/AddClientModal.jsx';
import AddNoteModal from './components/AddNoteModal.jsx';
import CompleteNoteModal from './components/CompleteNoteModal.jsx';

export default function App() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [addNoteClientId, setAddNoteClientId] = useState(null);
  const [isCompleteNoteOpen, setIsCompleteNoteOpen] = useState(false);
  const [noteToComplete, setNoteToComplete] = useState(null);

  // Estados de carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar lista de clientes
  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Error al cargar la lista de clientes');
      const data = await res.json();
      setClients(data);

      // Si no hay cliente seleccionado y hay lista, seleccionar el primero
      if (data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Cargar detalle del cliente seleccionado
  const fetchClientDetail = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error('Error al obtener detalle del cliente');
      const data = await res.json();
      setSelectedClient(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      fetchClientDetail(selectedClientId);
    } else {
      setSelectedClient(null);
    }
  }, [selectedClientId]);

  // Manejar creación de nuevo cliente
  const handleAddClient = async (clientData) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar cliente');

    await fetchClients();
    setSelectedClientId(data.id);
  };

  // Manejar creación de nueva nota/aviso
  const handleAddNote = async (noteData) => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al guardar nota');

    await fetchClients();
    if (selectedClientId === noteData.client_id) {
      await fetchClientDetail(noteData.client_id);
    }
  };

  // Abrir modal para añadir nota
  const handleOpenAddNote = (clientId) => {
    setAddNoteClientId(clientId);
    setIsAddNoteOpen(true);
  };

  // Manejar resolución de nota
  const handleCompleteNote = async (noteId, completionData) => {
    const res = await fetch(`/api/notes/${noteId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al completar la nota');

    await fetchClients();
    if (selectedClientId) {
      await fetchClientDetail(selectedClientId);
    }
  };

  const handleOpenCompleteNote = (note) => {
    setNoteToComplete(note);
    setIsCompleteNoteOpen(true);
  };

  // Reabrir nota
  const handleReopenNote = async (noteId) => {
    const res = await fetch(`/api/notes/${noteId}/reopen`, { method: 'PUT' });
    if (res.ok) {
      await fetchClients();
      if (selectedClientId) await fetchClientDetail(selectedClientId);
    }
  };

  // Eliminar nota
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota?')) return;
    const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchClients();
      if (selectedClientId) await fetchClientDetail(selectedClientId);
    }
  };

  const totalPendingNotes = clients.reduce((acc, c) => acc + (c.pending_notes_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      
      {/* Header Superior */}
      <Header
        onOpenAddClient={() => setIsAddClientOpen(true)}
        totalClients={clients.length}
        totalPending={totalPendingNotes}
      />

      {/* Contenedor Principal Responsive */}
      <main className="max-w-7xl w-full mx-auto p-3 md:p-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Columna Izquierda: Lista de Clientes (En móvil se oculta si hay cliente seleccionado) */}
        <div className={`md:col-span-5 lg:col-span-4 ${selectedClientId ? 'hidden md:block' : 'block'}`}>
          <ClientList
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={(id) => setSelectedClientId(id)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        {/* Columna Derecha: Detalle del Cliente Seleccionado y sus Avisos */}
        <div className={`md:col-span-7 lg:col-span-8 ${!selectedClientId ? 'hidden md:block' : 'block'}`}>
          <ClientDetail
            client={selectedClient}
            onOpenAddNote={handleOpenAddNote}
            onOpenCompleteNote={handleOpenCompleteNote}
            onReopenNote={handleReopenNote}
            onDeleteNote={handleDeleteNote}
            onBack={() => setSelectedClientId(null)}
          />
        </div>

      </main>

      {/* Modales */}
      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSubmitClient={handleAddClient}
      />

      <AddNoteModal
        isOpen={isAddNoteOpen}
        onClose={() => setIsAddNoteOpen(false)}
        clientId={addNoteClientId}
        clientName={selectedClient ? selectedClient.name : ''}
        onSubmitNote={handleAddNote}
      />

      <CompleteNoteModal
        isOpen={isCompleteNoteOpen}
        onClose={() => setIsCompleteNoteOpen(false)}
        note={noteToComplete}
        onCompleteNote={handleCompleteNote}
      />

    </div>
  );
}
