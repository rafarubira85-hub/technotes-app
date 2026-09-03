import React, { useState, useEffect } from 'react';
import Header from './Header.jsx';
import ClientList from './ClientList.jsx';
import ClientDetail from './ClientDetail.jsx';
import AddClientModal from './AddClientModal.jsx';
import EditClientModal from './EditClientModal.jsx';
import AddNoteModal from './AddNoteModal.jsx';
import EditNoteModal from './EditNoteModal.jsx';
import CompleteNoteModal from './CompleteNoteModal.jsx';
import PinAccessModal from './PinAccessModal.jsx';
import QrModal from './QrModal.jsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('technotes_auth') === 'true';
  });

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
  const [isEditNoteOpen, setIsEditNoteOpen] = useState(false);
  const [noteToEdit, setNoteToEdit] = useState(null);
  const [isCompleteNoteOpen, setIsCompleteNoteOpen] = useState(false);
  const [noteToComplete, setNoteToComplete] = useState(null);

  // Modal QR
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [qrTitle, setQrTitle] = useState('');
  const [qrImageSrc, setQrImageSrc] = useState('');

  const handleOpenQr = (title, imageSrc) => {
    setQrTitle(title);
    setQrImageSrc(imageSrc);
    setIsQrOpen(true);
  };

  // Guardar copia permanente en el dispositivo para evitar pérdida por reinicio de Render
  const saveLocalBackup = async () => {
    try {
      const res = await fetch('/api/backup');
      if (res.ok) {
        const backupData = await res.json();
        localStorage.setItem('technotes_permanent_backup', JSON.stringify(backupData));
      }
    } catch (err) {}
  };

  // Manejar autenticación por PIN (PIN configurado: 2831)
  const handleAuthenticate = (inputPin) => {
    if (inputPin === '2831') {
      setIsAuthenticated(true);
      localStorage.setItem('technotes_auth', 'true');
      return true;
    }
    return false;
  };

  const handleLock = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('technotes_auth');
  };

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

  // Auto-Sincronización Silenciosa al abrir la app (Restaura notas automáticamente si Render se reinició)
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoSyncWithServer = async () => {
      try {
        const localBackupStr = localStorage.getItem('technotes_permanent_backup');
        if (!localBackupStr) {
          await fetchClients();
          return;
        }

        const localBackup = JSON.parse(localBackupStr);
        if (!localBackup || !Array.isArray(localBackup.clients)) {
          await fetchClients();
          return;
        }

        // Comprobar clientes en el servidor
        const res = await fetch('/api/clients');
        const serverClients = await res.json();
        
        const localNotesCount = localBackup.notes ? localBackup.notes.length : 0;
        const serverNotesCount = serverClients.reduce((acc, c) => acc + (c.pending_notes_count || 0), 0);

        // Si tenemos más notas o clientes guardados en el dispositivo que en el servidor, restaurar silenciosamente
        if (localNotesCount > serverNotesCount || localBackup.clients.length > serverClients.length) {
          console.log('🔄 Auto-Sincronizando base de datos permanente...');
          await fetch('/api/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localBackup)
          });
        }
      } catch (err) {
        console.error('AutoSync error:', err);
      } finally {
        await fetchClients();
      }
    };

    autoSyncWithServer();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedClientId) {
      fetchClientDetail(selectedClientId);
    } else {
      setSelectedClient(null);
    }
  }, [selectedClientId, isAuthenticated]);

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
    await saveLocalBackup();
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
    await saveLocalBackup();
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
        await saveLocalBackup();
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
    await saveLocalBackup();
  };

  const handleOpenAddNote = (clientId) => {
    setAddNoteClientId(clientId);
    setIsAddNoteOpen(true);
  };

  // Editar nota
  const handleOpenEditNote = (note) => {
    setNoteToEdit(note);
    setIsEditNoteOpen(true);
  };

  const handleUpdateNote = async (noteId, updatedData) => {
    const res = await fetch(`/api/notes/${noteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al actualizar nota');
    await fetchClients();
    if (selectedClientId) {
      await fetchClientDetail(selectedClientId);
    }
    await saveLocalBackup();
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
    await saveLocalBackup();
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
      await saveLocalBackup();
    }
  };

  // Eliminar nota
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota?')) return;
    const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchClients();
      if (selectedClientId) await fetchClientDetail(selectedClientId);
      await saveLocalBackup();
    }
  };

  const handleRestoreComplete = async () => {
    await fetchClients();
    if (selectedClientId) await fetchClientDetail(selectedClientId);
    await saveLocalBackup();
  };

  const totalPendingNotes = clients.reduce((acc, c) => acc + (c.pending_notes_count || 0), 0);

  // Pantalla de bloqueo PIN si no está autenticado
  if (!isAuthenticated) {
    return <PinAccessModal onAuthenticate={handleAuthenticate} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header
        onOpenAddClient={() => setIsAddClientOpen(true)}
        totalClients={clients.length}
        totalPending={totalPendingNotes}
        onRestoreComplete={handleRestoreComplete}
        selectedClientId={selectedClientId}
        onBackToList={() => setSelectedClientId(null)}
        onLock={handleLock}
        onOpenQr={handleOpenQr}
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
            onOpenEditNote={handleOpenEditNote}
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

      <EditNoteModal
        isOpen={isEditNoteOpen}
        onClose={() => setIsEditNoteOpen(false)}
        note={noteToEdit}
        onUpdateNote={handleUpdateNote}
      />

      <CompleteNoteModal
        isOpen={isCompleteNoteOpen}
        onClose={() => setIsCompleteNoteOpen(false)}
        note={noteToComplete}
        onCompleteNote={handleCompleteNote}
      />

      <QrModal
        isOpen={isQrOpen}
        onClose={() => setIsQrOpen(false)}
        title={qrTitle}
        imageSrc={qrImageSrc}
      />
    </div>
  );
}
