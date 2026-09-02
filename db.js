import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Permitir ruta personalizada por variable de entorno
const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite');

const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

// Habilitar claves foráneas
db.exec('PRAGMA foreign_keys = ON;');

const REAL_CLIENTS = [
  {
    "name": "Chárter - Torrent",
    "code": "CHA-001",
    "address": "Estació, 3-5, 46900 Torrent, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Chárter - Alaquàs",
    "code": "CHA-002",
    "address": "Estación de Servicio, C. de Conca, 97D, 46970 Alaquàs, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Chárter - Alfafar",
    "code": "CHA-003",
    "address": "Avinguda Gómez Ferrer, 69, 46910 Alfafar, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Chárter - Benetússer",
    "code": "CHA-004",
    "address": "Avinguda de Paiporta, 80, 46910 Benetússer, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Chárter Coabe - Bétera",
    "code": "CHA-005",
    "address": "Plaça Polígon N-77.R, 271, 46117 Bétera, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Alcampo 103 - Teruel",
    "code": "ALC-103",
    "address": "Polígono Fuenfresca, Av. de Sagunto, s/n, 44002 Teruel",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Alcampo 121 - Teruel",
    "code": "ALC-121",
    "address": "Av. Zaragoza, 22, 44001 Teruel",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Alcampo 1120 - Tortosa",
    "code": "ALC-1120",
    "address": "Av. Jesús, s/nº, 43500 Tortosa, Tarragona",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Alcampo 1135 - Reus",
    "code": "ALC-1135",
    "address": "Carrer de Llorenç Milans del Bosch, 43205 Reus, Tarragona",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Amazon - Paterna",
    "code": "AMZ-001",
    "address": "Carrer del Carboner, 39, 46980 Paterna, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "DIA 016 - Valencia",
    "code": "DIA-016",
    "address": "Plaça de Jesús, 14, Patraix, 46007 València, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Superfast - Puzol",
    "code": "SPF-001",
    "address": "Vía Puente, 17, parcela 256, 46530 Alfinac, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 319 - Buñol",
    "code": "LIDL-319",
    "address": "Avda. Blasco Ibáñez,, Buñol, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 320 - L'Alcúdia",
    "code": "LIDL-320",
    "address": "Ctra. de Carlet,, L'Alcúdia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 324 - Alzira",
    "code": "LIDL-324",
    "address": "Avda. de la Llibertat,, Alzira, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 327 - Vlc-Avda. Puerto",
    "code": "LIDL-327",
    "address": "Avda. del Puerto,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 328 - Vlc-C/ Sagunto",
    "code": "LIDL-328",
    "address": "C/ Sagunto,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 335 - Vlc-Cno. Moncada",
    "code": "LIDL-335",
    "address": "Camino de Moncada,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 352 - Alfafar",
    "code": "LIDL-352",
    "address": "C/ Alcalde José Puertes,, Alfafar, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 375 - Castellón-Castalia",
    "code": "LIDL-375",
    "address": "Avda. Benicasim,, Castellón de la Plana, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 376 - Cullera",
    "code": "LIDL-376",
    "address": "C/ Sueca,, Cullera, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 380 - Castellón-Avda. Valencia",
    "code": "LIDL-380",
    "address": "Avda. Valencia,, Castellón de la Plana, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 385 - Castellón-Caminás",
    "code": "LIDL-385",
    "address": "Avda. del Mar,, Castellón de la Plana, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 392 - Picassent",
    "code": "LIDL-392",
    "address": "Ctra. Monserrat,, Picassent, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 946 - Liria-Sector Benissanó",
    "code": "LIDL-946",
    "address": "Crta. CV-3692 Valencia-Ademuz,, Llíria, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 948 - Teruel",
    "code": "LIDL-948",
    "address": "Ronda Dámaso Toran,, Teruel, Teruel",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3002 - Vlc-Orriols",
    "code": "LIDL-3002",
    "address": "Avda. Alfahuir,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3011 - Ribarroja del Turia",
    "code": "LIDL-3011",
    "address": "C/ Séquia del Quint,, Ribarroja del Turia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3021 - Aldaya-C.C.",
    "code": "LIDL-3021",
    "address": "Avda. Comarques del País Valencià,, Quart de Poblet, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3024 - Vlc-Vara de Quart",
    "code": "LIDL-3024",
    "address": "C/ Dels Coeters,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3025 - Requena",
    "code": "LIDL-3025",
    "address": "C/ Cañaverales,, Requena, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3030 - Vlc-Xirivella",
    "code": "LIDL-3030",
    "address": "Plaza de España,, Xirivella, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3031 - Vlc-Maestro Rodrigo",
    "code": "LIDL-3031",
    "address": "Avda. Maestro Rodrigo,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3033 - Vinaròs",
    "code": "LIDL-3033",
    "address": "Ctra. N-340,, Vinaròs, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3034 - Gandia",
    "code": "LIDL-3034",
    "address": "Camí Vell de Daimús,, Gandia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3035 - Benicàssim",
    "code": "LIDL-3035",
    "address": "Avda. Barcelona,, Benicàssim, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3037 - Sagunto-Puerto",
    "code": "LIDL-3037",
    "address": "Avda. Fausto Caruana,, Sagunto, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3038 - Oliva",
    "code": "LIDL-3038",
    "address": "Paseo Francisco Brines,, Oliva, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3040 - Torrent",
    "code": "LIDL-3040",
    "address": "C/ Picaña,, Torrent, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3041 - San Antonio de Benagéber",
    "code": "LIDL-3041",
    "address": "C/ Maria Zambrano,, L'Eliana, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3042 - Burjassot-Parque Ademúz",
    "code": "LIDL-3042",
    "address": "Avda. Ilustración,, Burjassot, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3045 - Vlc-Gran Via Marques del Turia",
    "code": "LIDL-3045",
    "address": "Gran Via Marques del Turia,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3046 - Xàtiva",
    "code": "LIDL-3046",
    "address": "C/ Brazal de les Dones,, Xàtiva, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3047 - Paiporta",
    "code": "LIDL-3047",
    "address": "Ctra. Benetússer,, Paiporta, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3048 - Vlc-Peris y Valero",
    "code": "LIDL-3048",
    "address": "C/ Peris y Valero,, Valencia, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3050 - Vila-Real-Avda. Castellón",
    "code": "LIDL-3050",
    "address": "Avda. de Grecia,, Vila-Real, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3051 - Onda-Avda. Castilla La Mancha",
    "code": "LIDL-3051",
    "address": "Avda. Castilla La Mancha,, Onda, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3052 - ALGEMESI",
    "code": "LIDL-3052",
    "address": "Ronde del Cavari, 38, Algemesi, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3053 - La Pobla de Vallbona-C.C.",
    "code": "LIDL-3053",
    "address": "Avda. Ada Lovelace,, La Pobla de Vallbona, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3054 - La Vall d´Uixò-Avda. Europa",
    "code": "LIDL-3054",
    "address": "Avda. Europa,, La Vall d´Uixò, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3055 - Burriana-Av de La Marina",
    "code": "LIDL-3055",
    "address": "Av cardenal Vte tarancón, Burriana, Castellón ",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3056 - MUSEROS",
    "code": "LIDL-3056",
    "address": "Frances de Vinatea 7, MUSEROS, VALENCIA",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3057 - Teruel",
    "code": "LIDL-3057",
    "address": "Teruel, Teruel",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3058 - Benicarló-Ctra. Sant Mateu",
    "code": "LIDL-3058",
    "address": "Ctra. de Sant Mateu,, Benicarló, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3060 - QUART DE POBLET",
    "code": "LIDL-3060",
    "address": "Jaime Sanmartin, 6, Quart de Poblet",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3063 - Almassora-Av. Castellón",
    "code": "LIDL-3063",
    "address": "Avenida de Castellón, Almassora, Castellón",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  },
  {
    "name": "Lidl 3065 - Sagunto-Ciudad",
    "code": "LIDL-3065",
    "address": "Avda. Palmosa,, Sagunto, Valencia",
    "phone": "",
    "contact_person": "",
    "equipment_info": ""
  }
];

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

  // Borrar los clientes de ejemplo antiguos
  db.exec("DELETE FROM clients WHERE name IN ('Restaurante El Faro', 'Panadería San José', 'Carnicería Pepe & Hijos', 'Hotel Marina Blue');");

  // Insertar los 57 clientes reales si no existen
  const insertStmt = db.prepare(`
    INSERT INTO clients (name, code, address, phone, contact_person, equipment_info)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const c of REAL_CLIENTS) {
    try {
      const existing = db.prepare('SELECT id FROM clients WHERE code = ? OR name = ?').get(c.code, c.name);
      if (!existing) {
        insertStmt.run(c.name, c.code, c.address || '', c.phone || '', c.contact_person || '', c.equipment_info || '');
      }
    } catch (err) {
      // Ignorar si ya existe
    }
  }
}
