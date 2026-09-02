import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import ClientList from './ClientList.jsx';
import ClientDetail from './ClientDetail.jsx';
import AddClientModal from './AddClientModal.jsx';
import EditClientModal from './EditClientModal.jsx';
import AddNoteModal from './AddNoteModal.jsx';
import CompleteNoteModal from './CompleteNoteModal.jsx';

export default function App() {
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modales
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState(null);
  const [isAddNoteOpen, setIsAddNoteOpen] = useState(false);
  const [addNoteClientId, setAddNoteClientId] = useState(null);
  const [isCompleteNoteOpen, setIsCompleteNoteOpen] = useState(false);
  const [noteToComplete, setNoteToComplete] = useState(null);

  // Cargar lista de clientes
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) throw new Error('Error al cargar clientes');
      const data = await res.json();
      setClients(data);
      if (data.length > 0 && !selectedClientId) {
        setSelectedClientId(data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cargar detalle del cliente seleccionado
  const fetchClientDetail = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (!res.ok) throw new Error('Error al obtener detalle');
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

  // Guardar nuevo cliente
  const handleAddClient = async (clientData) => {
    const res = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear cliente');
    await fetchClients();
    setSelectedClientId(data.id);
  };

  // Actualizar cliente
  const handleUpdateClient = async (clientId, updatedData) => {
    const res = await fetch(`/api/clients/${clientId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar');
    await fetchClients();
    if (selectedClientId === clientId) {
      await fetchClientDetail(clientId);
    }
  };

  // Eliminar cliente
  const handleDeleteClient = async (client) => {
    if (!window.confirm(`¿Está seguro de eliminar el cliente "${client.name}"? Se borrarán también todos sus avisos.`)) return;
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedClientId(null);
        setSelectedClient(null);
        await fetchClients();
      }
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
    }
  };

  const handleOpenEditClient = (client) => {
    setClientToEdit(client);
    setIsEditClientOpen(true);
  };

  // Guardar nota
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

  const handleOpenAddNote = (clientId) => {
    setAddNoteClientId(clientId);
    setIsAddNoteOpen(true);
  };

  // Resolver nota
  const handleCompleteNote = async (noteId, completionData) => {
    const res = await fetch(`/api/notes/${noteId}/complete`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completionData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al completar nota');
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

  const handleRestoreComplete = async () => {
    await fetchClients();
    if (selectedClientId) await fetchClientDetail(selectedClientId);
  };

  const totalPendingNotes = clients.reduce((acc, c) => acc + (c.pending_notes_count || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        onOpenAddClient={() => setIsAddClientOpen(true)}
        totalClients={clients.length}
        totalPending={totalPendingNotes}
        onRestoreComplete={handleRestoreComplete}
      />

      <main className="max-w-7xl w-full mx-auto p-3 md:p-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className={`md:col-span-5 lg:col-span-4 ${selectedClientId ? 'hidden md:block' : 'block'}`}>
          <ClientList
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={(id) => setSelectedClientId(id)}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </div>

        <div className={`md:col-span-7 lg:col-span-8 ${!selectedClientId ? 'hidden md:block' : 'block'}`}>
          <ClientDetail
            client={selectedClient}
            onOpenAddNote={handleOpenAddNote}
            onOpenCompleteNote={handleOpenCompleteNote}
            onReopenNote={handleReopenNote}
            onDeleteNote={handleDeleteNote}
            onOpenEditClient={handleOpenEditClient}
            onDeleteClient={handleDeleteClient}
            onBack={() => setSelectedClientId(null)}
          />
        </div>
      </main>

      <AddClientModal
        isOpen={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSubmitClient={handleAddClient}
      />

      <EditClientModal
        isOpen={isEditClientOpen}
        onClose={() => setIsEditClientOpen(false)}
        client={clientToEdit}
        onUpdateClient={handleUpdateClient}
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
