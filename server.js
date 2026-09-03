import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { db, initDB } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Inicializar BD local
initDB();

// --- FUNCIONES DE RESTAURACIÓN Y SINCRONIZACIÓN PERSISTENTE ---

function getFullDatabaseState() {
  const clients = db.prepare('SELECT * FROM clients').all();
  const notes = db.prepare('SELECT * FROM notes').all();
  return {
    version: 1,
    exported_at: new Date().toISOString(),
    clients,
    notes
  };
}

function restoreFromBackupData(backupData) {
  if (!backupData || !Array.isArray(backupData.clients)) return;
  const { clients, notes } = backupData;

  db.exec('BEGIN TRANSACTION;');

  const insertClient = db.prepare(`
    INSERT OR REPLACE INTO clients (id, name, code, address, phone, contact_person, equipment_info, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of clients) {
    insertClient.run(c.id, c.name, c.code || '', c.address || '', c.phone || '', c.contact_person || '', c.equipment_info || '', c.created_at || new Date().toISOString());
  }

  if (Array.isArray(notes)) {
    const insertNote = db.prepare(`
      INSERT OR REPLACE INTO notes (id, client_id, title, content, priority, category, status, technician_name, resolved_by, resolved_at, resolution_comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const n of notes) {
      insertNote.run(n.id, n.client_id, n.title, n.content, n.priority || 'normal', n.category || 'general', n.status || 'pendiente', n.technician_name, n.resolved_by || null, n.resolved_at || null, n.resolution_comment || null, n.created_at || new Date().toISOString());
    }
  }

  db.exec('COMMIT;');
}

// Cargar copia persistente desde el archivo database_state.json o GitHub al arrancar el servidor
async function syncFromGitHubOnStartup() {
  try {
    const localStatePath = path.join(__dirname, 'database_state.json');
    if (fs.existsSync(localStatePath)) {
      const fileData = fs.readFileSync(localStatePath, 'utf8');
      const backupData = JSON.parse(fileData);
      restoreFromBackupData(backupData);
      console.log('✅ Base de datos sincronizada desde database_state.json');
    }

    const rawUrl = 'https://raw.githubusercontent.com/rafarubira85-hub/technotes-app/main/database_state.json';
    const res = await fetch(rawUrl);
    if (res.ok) {
      const cloudData = await res.json();
      if (cloudData && Array.isArray(cloudData.clients)) {
        restoreFromBackupData(cloudData);
        console.log('☁️ Base de datos sincronizada desde GitHub Cloud en tiempo real');
      }
    }
  } catch (err) {
    console.error('Error en syncFromGitHubOnStartup:', err.message);
  }
}

syncFromGitHubOnStartup();

// --- RUTAS API DE CLIENTES ---

// Obtener todos los clientes (con conteo de avisos pendientes) - Orden alfabético estable
app.get('/api/clients', (req, res) => {
  try {
    const { q } = req.query;
    let query = `
      SELECT 
        c.*,
        COUNT(CASE WHEN n.status = 'pendiente' THEN 1 END) as pending_notes_count,
        COUNT(CASE WHEN n.status = 'pendiente' AND n.priority = 'alta' THEN 1 END) as urgent_notes_count
      FROM clients c
      LEFT JOIN notes n ON c.id = n.client_id
    `;
    const params = [];

    if (q && q.trim()) {
      query += ` WHERE c.name LIKE ? OR c.code LIKE ? OR c.address LIKE ? OR c.contact_person LIKE ?`;
      const term = `%${q.trim()}%`;
      params.push(term, term, term, term);
    }

    query += ` GROUP BY c.id ORDER BY c.name ASC`;

    const clients = db.prepare(query).all(...params);
    res.json(clients);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener detalle de un cliente + sus notas
app.get('/api/clients/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    const notes = db.prepare(`
      SELECT * FROM notes 
      WHERE client_id = ? 
      ORDER BY 
        CASE WHEN status = 'pendiente' THEN 0 ELSE 1 END,
        CASE WHEN priority = 'alta' THEN 0 WHEN priority = 'normal' THEN 1 ELSE 2 END,
        created_at DESC
    `).all(req.params.id);

    res.json({ ...client, notes });
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear nuevo cliente
app.post('/api/clients', (req, res) => {
  try {
    const { name, code, address, phone, contact_person, equipment_info } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'El nombre del cliente es obligatorio' });
    }

    let clientCode = code ? code.trim() : '';
    if (!clientCode) {
      const maxIdRow = db.prepare('SELECT MAX(id) as maxId FROM clients').get();
      const nextId = (maxIdRow.maxId || 0) + 1;
      clientCode = `CLI-${String(nextId).padStart(3, '0')}`;
    }

    const stmt = db.prepare(`
      INSERT INTO clients (name, code, address, phone, contact_person, equipment_info)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name.trim(), clientCode, address || '', phone || '', contact_person || '', equipment_info || '');

    const newClient = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newClient);
  } catch (error) {
    console.error('Error al crear cliente:', error);
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ error: 'Ya existe un cliente con este código' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar cliente
app.put('/api/clients/:id', (req, res) => {
  try {
    const { name, code, address, phone, contact_person, equipment_info } = req.body;
    const stmt = db.prepare(`
      UPDATE clients 
      SET name = ?, code = ?, address = ?, phone = ?, contact_person = ?, equipment_info = ?
      WHERE id = ?
    `);
    stmt.run(name, code, address, phone, contact_person, equipment_info, req.params.id);

    const updated = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar cliente y sus notas asociadas
app.delete('/api/clients/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --- RUTAS API DE COPIA DE SEGURIDAD (BACKUP Y RESTORE) ---

// Exportar copia de seguridad completa (JSON)
app.get('/api/backup', (req, res) => {
  try {
    const backupData = getFullDatabaseState();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=technotes_backup_${new Date().toISOString().split('T')[0]}.json`);
    res.json(backupData);
  } catch (error) {
    console.error('Error al generar backup:', error);
    res.status(500).json({ error: 'Error al exportar la copia de seguridad' });
  }
});

// Restaurar copia de seguridad completa
app.post('/api/restore', (req, res) => {
  try {
    const { clients, notes } = req.body;
    if (!Array.isArray(clients)) {
      return res.status(400).json({ error: 'El archivo de copia de seguridad no es válido' });
    }

    restoreFromBackupData(req.body);
    res.json({ success: true, clients_count: clients.length, notes_count: notes ? notes.length : 0 });
  } catch (error) {
    console.error('Error al restaurar backup:', error);
    res.status(500).json({ error: 'Error al restaurar la copia de seguridad: ' + error.message });
  }
});

// --- RUTAS API DE NOTAS Y AVISOS ---

// Crear nueva nota/aviso
app.post('/api/notes', (req, res) => {
  try {
    const { client_id, title, content, priority, category, technician_name } = req.body;
    if (!client_id || !title || !content || !technician_name) {
      return res.status(400).json({ error: 'Faltan campos obligatorios (cliente, título, contenido, técnico)' });
    }

    const stmt = db.prepare(`
      INSERT INTO notes (client_id, title, content, priority, category, status, technician_name)
      VALUES (?, ?, ?, ?, ?, 'pendiente', ?)
    `);
    const result = stmt.run(
      client_id,
      title.trim(),
      content.trim(),
      priority || 'normal',
      category || 'general',
      technician_name.trim()
    );

    const newNote = db.prepare('SELECT * FROM notes WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newNote);
  } catch (error) {
    console.error('Error al crear nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Marcar nota como completada / resuelta
app.put('/api/notes/:id/complete', (req, res) => {
  try {
    const { resolved_by, resolution_comment } = req.body;
    if (!resolved_by || !resolved_by.trim()) {
      return res.status(400).json({ error: 'Debe indicar el nombre del técnico que resuelve la nota' });
    }

    const stmt = db.prepare(`
      UPDATE notes 
      SET status = 'completado',
          resolved_by = ?,
          resolved_at = CURRENT_TIMESTAMP,
          resolution_comment = ?
      WHERE id = ?
    `);
    stmt.run(resolved_by.trim(), resolution_comment ? resolution_comment.trim() : '', req.params.id);

    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error al completar nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Reabrir nota
app.put('/api/notes/:id/reopen', (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE notes 
      SET status = 'pendiente', resolved_by = NULL, resolved_at = NULL, resolution_comment = NULL
      WHERE id = ?
    `);
    stmt.run(req.params.id);
    const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error al reabrir nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar nota
app.delete('/api/notes/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar nota:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Detectar y servir la carpeta dist del frontend
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
  res.status(200).send('API de TechNotes activa en puerto ' + PORT);
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor TechNotes activo en puerto ${PORT}`);
});
