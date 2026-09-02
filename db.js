import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Permitir ruta personalizada por variable de entorno (para discos persistentes en Render/Railway)
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

// Asegurar que el directorio de la BD existe
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');

// Inicializar tablas
export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE,
      address TEXT,
      phone TEXT,
      contact_person TEXT,
      equipment_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal',
      category TEXT DEFAULT 'general',
      status TEXT DEFAULT 'pendiente',
      technician_name TEXT NOT NULL,
      resolved_by TEXT,
      resolved_at DATETIME,
      resolution_comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
    );
  `);

  // Verificar si hay clientes. Si está vacía, insertar datos de ejemplo
  const countRow = db.prepare('SELECT COUNT(*) as count FROM clients').get();
  if (countRow.count === 0) {
    console.log('🌱 Inicializando datos de prueba en la base de datos...');
    
    const insertClient = db.prepare(`
      INSERT INTO clients (name, code, address, phone, contact_person, equipment_info)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const c1 = insertClient.run('Restaurante El Faro', 'CLI-001', 'Av. del Mar 42', '912 345 678', 'Manuel (Encargado)', 'Aire Acondicionado Central Daikin, Extractor de Humos Industrial');
    const c2 = insertClient.run('Panadería San José', 'CLI-002', 'Calle Mayor 15', '918 765 432', 'Carmen (Propietaria)', 'Horno Industrial Balay, Climatizador Split LG 24000 BTU');
    const c3 = insertClient.run('Carnicería Pepe & Hijos', 'CLI-003', 'Plaza España 8', '911 223 344', 'Pepe Ruiz', 'Cámara Frigorífica Bitzer, Vitrina Mostrador');
    const c4 = insertClient.run('Hotel Marina Blue', 'CLI-004', 'Paseo Marítimo 102', '919 887 766', 'Laura (Mantenimiento)', 'Sistema de Climatización VRV Mitsubishi (4 Plantas)');

    const insertNote = db.prepare(`
      INSERT INTO notes (client_id, title, content, priority, category, status, technician_name)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Avisos para Restaurante El Faro
    insertNote.run(
      c1.lastInsertRowid,
      'Limpiar condensador en próxima visita',
      'El condensador del equipo de climatización principal acumula bastante grasa por estar cerca de la salida de humos. Traer desengrasante químico e hidrolimpiadora.',
      'alta',
      'mantenimiento',
      'pendiente',
      'Carlos'
    );
    insertNote.run(
      c1.lastInsertRowid,
      'Revisar correa del extractor',
      'La correa del motor de extracción se ve un poco desgastada. Si vuelve a zumbar, sustituir por correa A-48.',
      'normal',
      'repuesto',
      'pendiente',
      'Antonio'
    );

    // Avisos para Panadería San José
    insertNote.run(
      c2.lastInsertRowid,
      'Cambiar filtro de aire split',
      'Se limpió el filtro básico pero el cliente pide poner filtro de alta eficiencia por la harina en suspensión.',
      'normal',
      'mantenimiento',
      'pendiente',
      'Manuel'
    );

    // Avisos para Carnicería Pepe
    insertNote.run(
      c3.lastInsertRowid,
      'URGENTE: Medir gas refrigerante R449A',
      'Se notó una ligera bajada de rendimiento en la cámara frigorífica principal. Traer manómetros y detector de fugas en la próxima revisión.',
      'alta',
      'averia',
      'pendiente',
      'Carlos'
    );

    // Nota resuelta de ejemplo
    const noteRes = insertNote.run(
      c3.lastInsertRowid,
      'Reemplazo de termostato digital',
      'Termostato descalibrado marcando 4ºC de más.',
      'normal',
      'averia',
      'completado',
      'Antonio'
    );
    db.prepare(`
      UPDATE notes 
      SET resolved_by = ?, resolved_at = CURRENT_TIMESTAMP, resolution_comment = ?
      WHERE id = ?
    `).run('Carlos', 'Instalado nuevo termostato Eliwell IC902. Funcionando OK.', noteRes.lastInsertRowid);
  }
}
