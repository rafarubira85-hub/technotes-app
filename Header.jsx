        {/* Botones de Imagen QR */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenQr('QR VALENCIA', QR_VALENCIA)}
            className="inline-flex items-center space-x-1 text-xs bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 font-bold px-2.5 py-1.5 rounded-lg border border-sky-500/40 transition active:scale-95 shadow-sm"
            title="Abrir QR Valencia"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>QR VALENCIA</span>
          </button>

          <button
            onClick={() => onOpenQr('QR ALFAFAR', QR_ALFAFAR)}
            className="inline-flex items-center space-x-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold px-2.5 py-1.5 rounded-lg border border-amber-500/40 transition active:scale-95 shadow-sm"
            title="Abrir QR Alfafar"
          >
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>QR ALFAFAR</span>
          </button>
        </div>
