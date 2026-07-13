'use client';

import { useCallback, useRef, useState } from 'react';
import type { Locale } from '@/lib/translations';
import { tr } from '@/lib/translations';

export default function CsvUpload({
  locale,
  onFile,
  loading,
}: {
  locale: Locale;
  onFile: (file: File) => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) return;
      setSelected(file);
      onFile(file);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
        dragOver
          ? 'border-indigo-400 bg-indigo-50'
          : selected
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleChange}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-500">{tr('analyzing', locale)}</p>
        </div>
      ) : selected ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <p className="text-sm font-medium text-gray-700">{selected.name}</p>
          <p className="text-xs text-gray-400">
            {(selected.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm text-gray-500">{tr('upload_hint', locale)}</p>
        </div>
      )}
    </div>
  );
}
