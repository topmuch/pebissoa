'use client';

import { Download, Package, X } from 'lucide-react';
import { useState } from 'react';

export function DockerDownloadBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-emerald-600 text-white" role="region" aria-label="Téléchargement de la copie Docker">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="h-5 w-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-sm font-bold leading-tight">
              📦 Copie Docker du projet — prête à déployer
            </p>
            <p className="text-xs text-emerald-100 leading-tight">
              Code source sur GitHub + Dockerfile + compose.yml
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/pebissoa-docker.zip"
            download
            className="inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 active:scale-[0.98] font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-all min-h-[44px]"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Télécharger le Docker
          </a>
          <button
            type="button"
            onClick={() => setVisible(false)}
            aria-label="Masquer la bannière"
            className="p-2 rounded-lg hover:bg-emerald-700 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
