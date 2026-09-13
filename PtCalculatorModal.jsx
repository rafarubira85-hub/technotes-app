import React, { useState, useMemo } from 'react';
import { X, Gauge, Thermometer, ArrowUpDown, Info, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';

// Tablas de saturación calibradas según ASHRAE / Danfoss RefTools (Presión manométrica bar rel -> Temp °C)
const REFRIGERANTS_PT = {
  'R449A': {
    name: 'R449A (Opteon XP40)',
    type: 'Mezcla HFO/HFC (Glide ~4K)',
    gwp: 1397,
    glide: true,
    dewTable: [
      [-0.5, -57.5], [0.0, -45.9], [0.5, -38.2], [1.0, -32.0], [1.5, -26.9],
      [2.0, -22.3], [2.5, -18.2], [3.0, -14.5], [3.5, -11.0], [4.0, -7.8],
      [4.5, -4.8], [5.0, -2.0], [6.0, 3.2], [7.0, 7.8], [8.0, 12.0],
      [9.0, 15.9], [10.0, 19.5], [12.0, 26.0], [14.0, 31.7], [16.0, 36.9],
      [18.0, 41.7], [20.0, 46.1], [22.0, 50.2], [25.0, 56.0]
    ],
    bubbleTable: [
      [-0.5, -61.5], [0.0, -49.9], [0.5, -42.2], [1.0, -36.0], [1.5, -30.9],
      [2.0, -26.4], [2.5, -22.3], [3.0, -18.6], [3.5, -15.1], [4.0, -11.9],
      [4.5, -8.9], [5.0, -6.1], [6.0, -0.9], [7.0, 3.7], [8.0, 7.9],
      [9.0, 11.8], [10.0, 15.4], [12.0, 21.9], [14.0, 27.6], [16.0, 32.8],
      [18.0, 37.6], [20.0, 42.0], [22.0, 46.1], [25.0, 51.9]
    ]
  },
  'R404A': {
    name: 'R404A',
    type: 'Mezcla HFC (Near-azeotrópico)',
    gwp: 3922,
    glide: false,
    dewTable: [
      [-0.5, -57.2], [0.0, -46.5], [0.5, -39.0], [1.0, -32.8], [1.5, -27.7],
      [2.0, -23.1], [2.5, -19.1], [3.0, -15.4], [3.5, -12.0], [4.0, -8.8],
      [4.5, -5.9], [5.0, -3.1], [6.0, 2.0], [7.0, 6.7], [8.0, 11.0],
      [9.0, 15.0], [10.0, 18.7], [12.0, 25.3], [14.0, 31.2], [16.0, 36.6],
      [18.0, 41.5], [20.0, 46.1], [22.0, 50.3], [25.0, 56.3]
    ]
  },
  'R134a': {
    name: 'R134a',
    type: 'HFC Puro',
    gwp: 1430,
    glide: false,
    dewTable: [
      [-0.5, -39.1], [0.0, -26.1], [0.5, -17.4], [1.0, -10.1], [1.5, -4.0],
      [2.0, 1.4], [2.5, 6.2], [3.0, 10.6], [3.5, 14.6], [4.0, 18.3],
      [4.5, 21.7], [5.0, 24.8], [6.0, 30.6], [7.0, 35.7], [8.0, 40.4],
      [9.0, 44.7], [10.0, 48.6], [12.0, 55.7], [14.0, 62.0], [16.0, 67.7],
      [18.0, 72.9], [20.0, 77.7]
    ]
  },
  'R744': {
    name: 'R744 (CO₂)',
    type: 'Natural (Subcrítico)',
    gwp: 1,
    glide: false,
    dewTable: [
      [10.0, -39.8], [12.0, -34.8], [14.0, -30.4], [16.0, -26.5], [18.0, -23.0],
      [20.0, -19.7], [22.0, -16.7], [24.0, -13.9], [26.0, -11.2], [28.0, -8.7],
      [30.0, -6.3], [35.0, -0.8], [40.0, 4.3], [45.0, 9.0], [50.0, 13.4],
      [55.0, 17.6], [60.0, 21.6], [65.0, 25.4], [70.0, 29.0]
    ]
  },
  'R32': {
    name: 'R32',
    type: 'HFC Puro',
    gwp: 675,
    glide: false,
    dewTable: [
      [-0.5, -62.4], [0.0, -51.7], [0.5, -44.2], [1.0, -38.2], [1.5, -33.1],
      [2.0, -28.6], [2.5, -24.6], [3.0, -20.9], [3.5, -17.5], [4.0, -14.4],
      [4.5, -11.4], [5.0, -8.7], [6.0, -3.6], [7.0, 1.0], [8.0, 5.2],
      [9.0, 9.1], [10.0, 12.8], [12.0, 19.4], [14.0, 25.3], [16.0, 30.6],
      [18.0, 35.4], [20.0, 39.9], [25.0, 49.9], [30.0, 58.4]
    ]
  },
  'R410A': {
    name: 'R410A',
    type: 'Mezcla HFC (Near-azeotrópico)',
    gwp: 2088,
    glide: false,
    dewTable: [
      [-0.5, -62.2], [0.0, -51.5], [0.5, -44.0], [1.0, -38.0], [1.5, -32.9],
      [2.0, -28.4], [2.5, -24.4], [3.0, -20.8], [3.5, -17.4], [4.0, -14.2],
      [4.5, -11.3], [5.0, -8.5], [6.0, -3.4], [7.0, 1.2], [8.0, 5.4],
      [9.0, 9.3], [10.0, 13.0], [12.0, 19.6], [14.0, 25.5], [16.0, 30.8],
      [18.0, 35.6], [20.0, 40.1], [25.0, 50.1], [30.0, 58.6]
    ]
  },
  'R407C': {
    name: 'R407C',
    type: 'Mezcla HFC (Glide ~7K)',
    gwp: 1774,
    glide: true,
    dewTable: [
      [-0.5, -50.1], [0.0, -36.7], [0.5, -28.5], [1.0, -22.1], [1.5, -16.7],
      [2.0, -12.0], [2.5, -7.8], [3.0, -3.9], [3.5, -0.3], [4.0, 3.0],
      [4.5, 6.1], [5.0, 9.0], [6.0, 14.3], [7.0, 19.1], [8.0, 23.4],
      [9.0, 27.4], [10.0, 31.1], [12.0, 37.8], [14.0, 43.8], [16.0, 49.2],
      [18.0, 54.1], [20.0, 58.7]
    ],
    bubbleTable: [
      [-0.5, -56.8], [0.0, -43.8], [0.5, -35.6], [1.0, -29.2], [1.5, -23.8],
      [2.0, -19.1], [2.5, -14.9], [3.0, -11.0], [3.5, -7.5], [4.0, -4.2],
      [4.5, -1.2], [5.0, 1.7], [6.0, 7.0], [7.0, 11.8], [8.0, 16.1],
      [9.0, 20.1], [10.0, 23.8], [12.0, 30.5], [14.0, 36.5], [16.0, 41.9],
      [18.0, 46.8], [20.0, 51.4]
    ]
  },
  'R290': {
    name: 'R290 (Propano)',
    type: 'Hidrocarburo Natural',
    gwp: 3,
    glide: false,
    dewTable: [
      [-0.5, -53.6], [0.0, -42.1], [0.5, -34.4], [1.0, -28.2], [1.5, -23.0],
      [2.0, -18.4], [2.5, -14.3], [3.0, -10.5], [3.5, -7.0], [4.0, -3.8],
      [4.5, -0.8], [5.0, 2.0], [6.0, 7.2], [7.0, 11.9], [8.0, 16.1],
      [9.0, 20.0], [10.0, 23.6], [12.0, 30.1], [14.0, 35.8], [16.0, 41.0],
      [18.0, 45.7], [20.0, 50.1]
    ]
  },
  'R452A': {
    name: 'R452A (Opteon XP44)',
    type: 'Mezcla HFO/HFC (Baja temp)',
    gwp: 2141,
    glide: true,
    dewTable: [
      [-0.5, -57.0], [0.0, -45.8], [0.5, -38.2], [1.0, -32.1], [1.5, -27.0],
      [2.0, -22.5], [2.5, -18.5], [3.0, -14.8], [3.5, -11.4], [4.0, -8.2],
      [4.5, -5.3], [5.0, -2.5], [6.0, 2.7], [7.0, 7.3], [8.0, 11.6],
      [9.0, 15.6], [10.0, 19.2], [12.0, 25.8], [14.0, 31.7], [16.0, 37.0]
    ],
    bubbleTable: [
      [-0.5, -60.0], [0.0, -48.8], [0.5, -41.2], [1.0, -35.1], [1.5, -30.0],
      [2.0, -25.5], [2.5, -21.5], [3.0, -17.8], [3.5, -14.4], [4.0, -11.2],
      [4.5, -8.3], [5.0, -5.5], [6.0, -0.3], [7.0, 4.3], [8.0, 8.6],
      [9.0, 12.6], [10.0, 16.2], [12.0, 22.8], [14.0, 28.7], [16.0, 34.0]
    ]
  },
  'R22': {
    name: 'R22',
    type: 'HCFC Tradicional',
    gwp: 1810,
    glide: false,
    dewTable: [
      [-0.5, -52.0], [0.0, -40.8], [0.5, -32.9], [1.0, -26.5], [1.5, -21.1],
      [2.0, -16.4], [2.5, -12.2], [3.0, -8.3], [3.5, -4.8], [4.0, -1.5],
      [4.5, 1.5], [5.0, 4.3], [6.0, 9.6], [7.0, 14.4], [8.0, 18.8],
      [9.0, 22.8], [10.0, 26.6], [12.0, 33.4], [14.0, 39.4], [16.0, 44.8],
      [18.0, 49.8], [20.0, 54.4]
    ]
  }
};

function interpolate(table, p) {
  if (!table || table.length === 0) return null;
  if (p <= table[0][0]) return table[0][1];
  if (p >= table[table.length - 1][0]) return table[table.length - 1][1];

  for (let i = 0; i < table.length - 1; i++) {
    const [p0, t0] = table[i];
    const [p1, t1] = table[i + 1];
    if (p >= p0 && p <= p1) {
      const frac = (p - p0) / (p1 - p0);
      return Number((t0 + frac * (t1 - t0)).toFixed(1));
    }
  }
  return null;
}

export default function PtCalculatorModal({ isOpen, onClose }) {
  const [selectedGas, setSelectedGas] = useState('R449A');
  const [pressureInput, setPressureInput] = useState('3.5');
  const [pipeTempInput, setPipeTempInput] = useState('');
  const [mode, setMode] = useState('evap'); // 'evap' (recalentamiento) o 'cond' (subenfriamiento)

  const gas = REFRIGERANTS_PT[selectedGas] || REFRIGERANTS_PT['R449A'];
  const pVal = parseFloat(pressureInput.replace(',', '.'));

  const results = useMemo(() => {
    if (isNaN(pVal)) return null;

    const tDew = interpolate(gas.dewTable, pVal);
    const tBubble = gas.glide ? interpolate(gas.bubbleTable, pVal) : tDew;

    let superheat = null;
    let subcooling = null;

    const pipeTemp = parseFloat(pipeTempInput.replace(',', '.'));
    if (!isNaN(pipeTemp)) {
      if (tDew !== null) {
        superheat = Number((pipeTemp - tDew).toFixed(1));
      }
      if (tBubble !== null) {
        subcooling = Number((tBubble - pipeTemp).toFixed(1));
      }
    }

    return { tDew, tBubble, superheat, subcooling };
  }, [gas, pVal, pipeTempInput]);

  if (!isOpen) return null;

  const adjustPressure = (delta) => {
    const curr = isNaN(pVal) ? 0 : pVal;
    const next = Math.max(selectedGas === 'R744' ? 10 : -0.5, Number((curr + delta).toFixed(2)));
    setPressureInput(String(next));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-white">
        
        {/* Cabecera */}
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-800/60">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/30">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                Regla P/T Frigorífica
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  PRO
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Presión / Temperatura y Recalentamiento</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con scroll */}
        <div className="p-3.5 space-y-3.5 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Selector de Refrigerante */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Refrigerante
            </label>
            <div className="relative">
              <select
                value={selectedGas}
                onChange={(e) => {
                  setSelectedGas(e.target.value);
                  if (e.target.value === 'R744' && pVal < 10) setPressureInput('25.0');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold appearance-none focus:outline-none focus:border-sky-500"
              >
                {Object.keys(REFRIGERANTS_PT).map((key) => (
                  <option key={key} value={key} className="bg-slate-800 text-white">
                    {REFRIGERANTS_PT[key].name} — {REFRIGERANTS_PT[key].type}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {gas.glide && (
              <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                Mezcla con glide: Rocío (Dew) para recalentamiento, Burbuja (Bubble) para subenfriamiento.
              </p>
            )}
          </div>

          {/* 2. Entrada de Presión del Manómetro */}
          <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-sky-400" />
                Presión de Manómetro (bar rel)
              </label>
              <span className="text-[10px] text-slate-400 font-mono">
                {selectedGas === 'R744' ? 'Rango: 10 a 70 bar' : 'Rango: -0.5 a 25 bar'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => adjustPressure(-1)}
                className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition active:scale-95"
              >
                -1
              </button>
              <button
                onClick={() => adjustPressure(-0.1)}
                className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition active:scale-95"
              >
                -0.1
              </button>
              
              <input
                type="number"
                step="0.1"
                value={pressureInput}
                onChange={(e) => setPressureInput(e.target.value)}
                placeholder="ej: 3.5"
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg py-2 px-3 text-center text-lg font-black text-sky-300 focus:outline-none focus:border-sky-400"
              />

              <button
                onClick={() => adjustPressure(0.1)}
                className="px-2 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition active:scale-95"
              >
                +0.1
              </button>
              <button
                onClick={() => adjustPressure(1)}
                className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg transition active:scale-95"
              >
                +1
              </button>
            </div>
          </div>

          {/* 3. Resultado de Temperatura Saturada */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tarjeta Rocío / Saturación */}
            <div className="bg-sky-950/40 border border-sky-500/40 rounded-xl p-3 text-center">
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                {gas.glide ? 'T. Rocío (Dew / Vapor)' : 'Temp. Saturación'}
              </span>
              <span className="text-2xl font-black text-white block my-0.5">
                {results && results.tDew !== null ? `${results.tDew} °C` : '—'}
              </span>
              <span className="text-[10px] text-sky-400/80">Para evaporación / recal.</span>
            </div>

            {/* Tarjeta Burbuja (si tiene glide) o Info */}
            <div className={`border rounded-xl p-3 text-center ${gas.glide ? 'bg-indigo-950/40 border-indigo-500/40' : 'bg-slate-800/40 border-slate-700'}`}>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">
                {gas.glide ? 'T. Burbuja (Bubble / Líq)' : 'Presión Absoluta'}
              </span>
              <span className="text-2xl font-black text-white block my-0.5">
                {gas.glide 
                  ? (results && results.tBubble !== null ? `${results.tBubble} °C` : '—')
                  : (!isNaN(pVal) ? `${(pVal + 1.013).toFixed(2)} bar` : '—')}
              </span>
              <span className="text-[10px] text-slate-400">
                {gas.glide ? 'Para condensador / subenf.' : '1.013 bar atm'}
              </span>
            </div>
          </div>

          {/* 4. Cálculo de Recalentamiento / Subenfriamiento */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-emerald-400" />
                Diagnóstico en Tubería (Opcional)
              </span>
              
              <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-700 text-[10px]">
                <button
                  onClick={() => setMode('evap')}
                  className={`px-2 py-1 rounded-md font-semibold transition ${mode === 'evap' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  Recalentamiento
                </button>
                <button
                  onClick={() => setMode('cond')}
                  className={`px-2 py-1 rounded-md font-semibold transition ${mode === 'cond' ? 'bg-sky-600 text-white' : 'text-slate-400'}`}
                >
                  Subenfriamiento
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={pipeTempInput}
                onChange={(e) => setPipeTempInput(e.target.value)}
                placeholder={mode === 'evap' ? 'T. bulbo / tubería aspiración (°C)' : 'T. tubería salida líquida (°C)'}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {pipeTempInput && (
                <button
                  onClick={() => setPipeTempInput('')}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Borrar
                </button>
              )}
            </div>

            {/* Resultado del diagnóstico */}
            {pipeTempInput && results && (
              <div className="mt-2 p-2.5 bg-slate-900/90 rounded-lg border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">
                    {mode === 'evap' ? 'Recalentamiento Útil:' : 'Subenfriamiento:'}
                  </span>
                  <span className="text-xl font-black text-emerald-400">
                    {mode === 'evap' 
                      ? `${results.superheat !== null ? results.superheat : '—'} K`
                      : `${results.subcooling !== null ? results.subcooling : '—'} K`}
                  </span>
                </div>

                {mode === 'evap' && results.superheat !== null && (
                  <div className="text-right text-[10px]">
                    {results.superheat >= 5 && results.superheat <= 9 ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Rango óptimo evaporador (5-9K)
                      </span>
                    ) : results.superheat < 5 ? (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Muy bajo (Riesgo retorno líquido)
                      </span>
                    ) : (
                      <span className="text-sky-400 flex items-center gap-1 font-semibold">
                        <Info className="w-3.5 h-3.5" /> Alto (Poco llenado o compresor)
                      </span>
                    )}
                  </div>
                )}

                {mode === 'cond' && results.subcooling !== null && (
                  <div className="text-right text-[10px]">
                    {results.subcooling >= 3 && results.subcooling <= 7 ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Rango óptimo (3-7K)
                      </span>
                    ) : results.subcooling < 3 ? (
                      <span className="text-amber-400 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="w-3.5 h-3.5" /> Bajo (Falta de refrigerante)
                      </span>
                    ) : (
                      <span className="text-sky-400 flex items-center gap-1 font-semibold">
                        <Info className="w-3.5 h-3.5" /> Alto (Exceso de carga)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Pie */}
        <div className="p-3 bg-slate-800/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>GWP: <strong className="text-white">{gas.gwp}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
