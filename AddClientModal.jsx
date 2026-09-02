import React, { useState } from 'react';
import { X, Building2, MapPin, Phone, User, Wrench, Save } from 'lucide-react';

export default function AddClientModal({ isOpen, onClose, onSubmitClient }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [equipmentInfo, setEquipmentInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('El nombre de la empresa o cliente es obligatorio');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmitClient({
        name: name.trim(),
        code: code.trim(),
        address: address.trim(),
        phone: phone.trim(),
        contact_person: contactPerson.trim(),
        equipment_info: equipmentInfo.trim(),
      });

      // Resetear
      setName('');
      setCode('');
      setAddress('');
      setPhone('');
      setContactPerson('');
      setEquipmentInfo('');
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-sky-700 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-sky-200" />
            <h3 className="font-bold text-lg">Registrar Nuevo Cliente</h3>
          </div>
          <button
            onClick={onClose}
            className="text-sky-200 hover:text-white p-1 rounded-lg hover:bg-sky-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs md:text-sm">
          {error && (
            <div className="bg-rose-50 text-rose-700 p-3 rounded-lg border border-rose-200 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Nombre de la Empresa / Cliente *:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cafetería Central"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Código de Cliente:
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Autogenerado (ej. CLI-005)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Teléfono:
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 912 345 678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Dirección completa:
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ej: Calle Gran Vía 12, Madrid"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Persona de contacto / Encargado:
            </label>
            <input
              type="text"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Ej: Marcos (Jefe de Cocina)"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Equipos / Maquinaria en el cliente:
            </label>
            <textarea
              rows={2}
              value={equipmentInfo}
              onChange={(e) => setEquipmentInfo(e.target.value)}
              placeholder="Ej: Aire Daikin VRV, Vitrina expositora frigorífica, Caldera de gas..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:bg-white outline-none"
            />
          </div>

          {/* Acciones */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-md transition flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Guardando...' : 'Guardar Cliente'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
