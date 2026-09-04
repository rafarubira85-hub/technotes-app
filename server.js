import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// --- CONFIGURACIÓN DE BASE DE DATOS NUBE (SUPABASE) ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zhwtnrxfrupvmmextjcp.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_dJ1X7WRiJ3sfYVN78c3hlw_WXhFRU8O';

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

// Helper para hacer llamadas HTTP a Supabase
async function supabaseFetch(endpoint, options = {}) {
  const url = `${SUPABASE_URL}/rest/v1${endpoint}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Supabase Error (${res.status}): ${errorText}`);
  }
  
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// --- RUTAS API DE CLIENTES ---

// Obtener todos los clientes (con sus avisos)
app.get('/api/clients', async (req, res) => {
  try {
    const { q } = req.query;
    let endpoint = '/clients?select=*,notes(*)&order=name.asc';
    
    if (q && q.trim()) {
      const term = encodeURIComponent(`*${q.trim()}*`);
      endpoint += `&or=(name.ilike.${term},code.ilike.${term},address.ilike.${term},contact_person.ilike.${term})`;
    }

    const clients = await supabaseFetch(endpoint);

    const formattedClients = clients.map(client => {
      const notes = client.notes || [];
      const pendingNotes = notes.filter(n => n.status === 'pendiente');
      const urgentNotes = pendingNotes.filter(n => n.priority === 'alta');

      return {
        ...client,
        pending_notes_count: pendingNotes.length,
        urgent_notes_count: urgentNotes.length
      };
    });

    res.json(formattedClients);
  } catch (error) {
    console.error('Error al obtener clientes desde Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Obtener detalle de un cliente + sus notas
app.get('/api/clients/:id', async (req, res) => {
  try {
    const clients = await supabaseFetch(`/clients?id=eq.${req.params.id}&select=*,notes(*)`);
    if (!clients || clients.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const client = clients[0];
    let notes = client.notes || [];

    // Ordenar notas: pendientes primero, luego prioridad alta, luego fecha
    notes.sort((a, b) => {
      if (a.status === 'pendiente' && b.status !== 'pendiente') return -1;
      if (a.status !== 'pendiente' && b.status === 'pendiente') return 1;

      if (a.priority === 'alta' && b.priority !== 'alta') return -1;
      if (a.priority !== 'alta' && b.priority === 'alta') return 1;

      return new Date(b.created_at) - new Date(a.created_at);
    });

    res.json({ ...client, notes });
  } catch (error) {
    console.error('Error al obtener cliente desde Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Crear nuevo cliente
app.post('/api/clients', async (req, res) => {
  try {
    const { name, code, address, phone, contact_person, equipment_info } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del cliente es obligatorio' });
    }

    let clientCode = code ? code.trim() : '';
    if (!clientCode) {
      const allClients = await supabaseFetch('/clients?select=id');
      const nextId = (allClients.length || 0) + 1;
      clientCode = `CLI-${String(nextId).padStart(3, '0')}`;
    }

    const newClients = await supabaseFetch('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: name.trim(),
        code: clientCode,
        address: address || '',
        phone: phone || '',
        contact_person: contact_person || '',
        equipment_info: equipment_info || ''
      })
    });

    res.status(201).json(newClients[0]);
  } catch (error) {
    console.error('Error al crear cliente en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Actualizar cliente
app.put('/api/clients/:id', async (req, res) => {
  try {
    const { name, code, address, phone, contact_person, equipment_info } = req.body;

    const updatedClients = await supabaseFetch(`/clients?id=eq.${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name: name ? name.trim() : '',
        code: code ? code.trim() : '',
        address: address || '',
        phone: phone || '',
        contact_person: contact_person || '',
        equipment_info: equipment_info || ''
      })
    });

    res.json(updatedClients[0]);
  } catch (error) {
    console.error('Error al actualizar cliente en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Eliminar cliente y sus notas asociadas
app.delete('/api/clients/:id', async (req, res) => {
  try {
    await supabaseFetch(`/clients?id=eq.${req.params.id}`, {
      method: 'DELETE'
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cliente en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// --- RUTAS API DE COPIA DE SEGURIDAD (BACKUP Y RESTORE) ---

app.get('/api/backup', async (req, res) => {
  try {
    const clients = await supabaseFetch('/clients?select=*');
    const notes = await supabaseFetch('/notes?select=*');
    
    const backupData = {
      version: 1,
      exported_at: new Date().toISOString(),
      clients,
      notes
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=technotes_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.json(backupData);
  } catch (error) {
    console.error('Error al generar backup desde Supabase:', error);
    res.status(500).json({ error: 'Error al exportar copia de seguridad' });
  }
});

app.post('/api/restore', async (req, res) => {
  try {
    const { clients, notes } = req.body;
    if (!Array.isArray(clients)) {
      return res.status(400).json({ error: 'El archivo de copia de seguridad no es válido' });
    }

    if (clients.length > 0) {
      await supabaseFetch('/clients', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(clients)
      });
    }

    if (Array.isArray(notes) && notes.length > 0) {
      await supabaseFetch('/notes', {
        method: 'POST',
        headers: { 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(notes)
      });
    }

    res.json({ success: true, clients_count: clients.length, notes_count: notes ? notes.length : 0 });
  } catch (error) {
    console.error('Error al restaurar en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error al restaurar copia de seguridad' });
  }
});

// --- RUTAS API DE NOTAS Y AVISOS ---

// Crear nueva nota/aviso
app.post('/api/notes', async (req, res) => {
  try {
    const { client_id, title, content, priority, category, technician_name } = req.body;
    if (!client_id || !title || !content || !technician_name) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (cliente, título, contenido, técnico)' });
    }

    const newNotes = await supabaseFetch('/notes', {
      method: 'POST',
      body: JSON.stringify({
        client_id,
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'normal',
        category: category || 'general',
        status: 'pendiente',
        technician_name: technician_name.trim()
      })
    });

    res.status(201).json(newNotes[0]);
  } catch (error) {
    console.error('Error al crear nota en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Editar/Actualizar nota/aviso existente
app.put('/api/notes/:id', async (req, res) => {
  try {
    const { title, content, priority, category, technician_name } = req.body;
    if (!title || !content || !technician_name) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const updatedNotes = await supabaseFetch(`/notes?id=eq.${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: title.trim(),
        content: content.trim(),
        priority: priority || 'normal',
        category: category || 'general',
        technician_name: technician_name.trim()
      })
    });

    res.json(updatedNotes[0]);
  } catch (error) {
    console.error('Error al actualizar nota en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Marcar nota como completada / resuelta
app.put('/api/notes/:id/complete', async (req, res) => {
  try {
    const { resolved_by, resolution_comment } = req.body;
    if (!resolved_by || !resolved_by.trim()) {
      return res.status(400).json({ error: 'Debe indicar el nombre del técnico que resuelve la nota' });
    }

    const updatedNotes = await supabaseFetch(`/notes?id=eq.${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'completado',
        resolved_by: resolved_by.trim(),
        resolved_at: new Date().toISOString(),
        resolution_comment: resolution_comment ? resolution_comment.trim() : ''
      })
    });

    res.json(updatedNotes[0]);
  } catch (error) {
    console.error('Error al completar nota en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Reabrir nota
app.put('/api/notes/:id/reopen', async (req, res) => {
  try {
    const updatedNotes = await supabaseFetch(`/notes?id=eq.${req.params.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status: 'pendiente',
        resolved_by: null,
        resolved_at: null,
        resolution_comment: null
      })
    });

    res.json(updatedNotes[0]);
  } catch (error) {
    console.error('Error al reabrir nota en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Eliminar nota
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await supabaseFetch(`/notes?id=eq.${req.params.id}`, {
      method: 'DELETE'
    });
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar nota en Supabase:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

// Servir la carpeta dist del frontend
const possibleDistPaths = [
  path.resolve('dist'),
  path.join(__dirname, 'dist'),
  path.join(__dirname, '../dist')
];

let distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html')));

if (!distPath) {
  console.log('⚡ dist/index.html no encontrado. Compilando frontend automáticamente...');
  try {
    execSync('npx vite build', { stdio: 'inherit' });
    distPath = possibleDistPaths.find(p => fs.existsSync(path.join(p, 'index.html'))) || path.resolve('dist');
  } catch (err) {
    console.error('Error al compilar frontend:', err);
  }
}

app.use(express.static(distPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  res.status(200).send('API de TechNotes activa conectada a Supabase Cloud en puerto ' + PORT);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor TechNotes activo y conectado a Supabase Cloud en puerto ${PORT}`);
});
