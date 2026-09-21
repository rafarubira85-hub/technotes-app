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
import PtCalculatorModal from './PtCalculatorModal.jsx';
import InfoModal from './InfoModal.jsx';

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

  // Regla P/T, Información y Selección de avisos
  const [isPtModalOpen, setIsPtModalOpen] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [infoModalType, setInfoModalType] = useState(null);

  // PWA Prompt de Instalación
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert("📲 Para instalar TechNotes en tu dispositivo:\n\n• En Android / Chrome: Pulsa el menú de 3 puntos (⋮) arriba a la derecha y selecciona 'Instalar aplicación' o 'Añadir a pantalla de inicio'.\n\n• En iPhone / Safari: Pulsa el botón 'Compartir' (el cuadro con la flecha hacia arriba) y selecciona 'Añadir a pantalla de inicio'.");
    }
  };

  const handleSelectClient = (clientId, noteId = null) => {
    setSelectedClientId(clientId);
    setSelectedNoteId(noteId);
  };

  const handleOpenQr = (title, imageSrc) => {
    setQrTitle(title);
    setQrImageSrc(imageSrc);
    setIsQrOpen(true);
  };

  // Manejar autenticación por PIN (PIN: 2831)
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

  // Cargar clientes iniciales
  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error('Error al cargar clientes:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchClients();
    }
  }, [isAuthenticated]);

  // Cargar detalle del cliente seleccionado
  const fetchClientDetail = async (id) => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedClient(data);
      }
    } catch (err) {
      console.error('Error al cargar detalle del cliente:', err);
    }
  };

  useEffect(() => {
    if (selectedClientId) {
      fetchClientDetail(selectedClientId);
    } else {
      setSelectedClient(null);
    }
  }, [selectedClientId]);

  // Acciones de Cliente
  const handleAddClient = async (clientData) => {
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clientData),
      });
      if (res.ok) {
        const newClient = await res.json();
        await fetchClients();
        setSelectedClientId(newClient.id);
        setIsAddClientOpen(false);
      }
    } catch (err) {
      console.error('Error al crear cliente:', err);
    }
  };

  const handleOpenEditClient = (client) => {
    setClientToEdit(client);
    setIsEditClientOpen(true);
  };

  const handleUpdateClient = async (updatedData) => {
    try {
      const res = await fetch(`/api/clients/${clientToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (res.ok) {
        await fetchClients();
        await fetchClientDetail(clientToEdit.id);
        setIsEditClientOpen(false);
        setClientToEdit(null);
      }
    } catch (err) {
      console.error('Error al actualizar cliente:', err);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Está seguro de eliminar este cliente y todas sus notas asociadas? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSelectedClientId(null);
        setSelectedClient(null);
        await fetchClients();
      }
    } catch (err) {
      console.error('Error al eliminar cliente:', err);
    }
  };

  // Acciones de Notas
  const handleOpenAddNote = (clientId) => {
    setAddNoteClientId(clientId);
    setIsAddNoteOpen(true);
  };

  const handleAddNote = async (noteData) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData),
      });
      if (res.ok) {
        await fetchClients();
        if (selectedClientId) {
          await fetchClientDetail(selectedClientId);
        }
        setIsAddNoteOpen(false);
      }
    } catch (err) {
      console.error('Error al crear nota:', err);
    }
  };

  const handleOpenEditNote = (note) => {
    setNoteToEdit(note);
    setIsEditNoteOpen(true);
  };

  const handleUpdateNote = async (updatedNoteData) => {
    try {
      const res = await fetch(`/api/notes/${noteToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedNoteData),
      });
      if (res.ok) {
        await fetchClients();
        if (selectedClientId) {
          await fetchClientDetail(selectedClientId);
        }
        setIsEditNoteOpen(false);
        setNoteToEdit(null);
      }
    } catch (err) {
      console.error('Error al actualizar nota:', err);
    }
  };

  const handleOpenCompleteNote = (note) => {
    setNoteToComplete(note);
    setIsCompleteNoteOpen(true);
  };

  const handleCompleteNote = async (resolutionData) => {
    try {
      const res = await fetch(`/api/notes/${noteToComplete.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolutionData),
      });
      if (res.ok) {
        await fetchClients();
        if (selectedClientId) {
          await fetchClientDetail(selectedClientId);
        }
        setIsCompleteNoteOpen(false);
        setNoteToComplete(null);
      }
    } catch (err) {
      console.error('Error al completar nota:', err);
    }
  };

  const handleReopenNote = async (noteId) => {
    if (!window.confirm('¿Desea reabrir esta nota y volver a marcarla como pendiente?')) {
      return;
    }

    try {
      const res = await fetch(`/api/notes/${noteId}/reopen`, {
        method: 'PATCH',
      });
      if (res.ok) {
        await fetchClients();
        if (selectedClientId) {
          await fetchClientDetail(selectedClientId);
        }
      }
    } catch (err) {
      console.error('Error al reabrir nota:', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('¿Está seguro de eliminar esta nota? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchClients();
        if (selectedClientId) {
          await fetchClientDetail(selectedClientId);
        }
      }
    } catch (err) {
      console.error('Error al eliminar nota:', err);
    }
  };

  const handleRestoreComplete = async () => {
    await fetchClients();
    if (selectedClientId) await fetchClientDetail(selectedClientId);
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
        onBackToList={() => { setSelectedClientId(null); setSelectedNoteId(null); }}
        onLock={handleLock}
        onOpenQr={handleOpenQr}
        onOpenPtCalculator={() => setIsPtModalOpen(true)}
        onInstallPwa={handleInstallPwa}
        onOpenInfo={(type) => setInfoModalType(type)}
      />

      <main className="max-w-7xl w-full mx-auto p-3 md:p-6 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className={`md:col-span-5 lg:col-span-4 ${selectedClientId ? 'hidden md:block' : 'block'}`}>
          <ClientList
            clients={clients}
            selectedClientId={selectedClientId}
            onSelectClient={handleSelectClient}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedNoteId={selectedNoteId}
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
            onBack={() => { setSelectedClientId(null); setSelectedNoteId(null); }}
            selectedNoteId={selectedNoteId}
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

      <PtCalculatorModal
        isOpen={isPtModalOpen}
        onClose={() => setIsPtModalOpen(false)}
      />

      <InfoModal
        isOpen={!!infoModalType}
        onClose={() => setInfoModalType(null)}
        type={infoModalType}
      />
    </div>
  );
}
