import React, { useState } from 'react';
import { PROGRAM_PILARS } from '../data/initialData';
import { exportProgramToPDF } from '../utils/pdfGenerator';
import { BookOpen, GraduationCap, Trophy, Users, HeartHandshake, Download, Search, CheckCircle2 } from 'lucide-react';

export const ProgramKegiatanView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const pillarIcons = {
    'Pendampingan Akademik': <GraduationCap className="w-6 h-6 text-blue-500" />,
    'Pengembangan Kompetensi': <Trophy className="w-6 h-6 text-amber-500" />,
    'Pengembangan Keterampilan': <Users className="w-6 h-6 text-indigo-500" />,
    'Pembentukan Karakter': <HeartHandshake className="w-6 h-6 text-rose-500" />
  };

  const pillarColors = {
    'Pendampingan Akademik': 'border-blue-200 bg-blue-50 text-blue-700',
    'Pengembangan Kompetensi': 'border-amber-200 bg-amber-50 text-amber-700',
    'Pengembangan Keterampilan': 'border-indigo-200 bg-indigo-50 text-indigo-700',
    'Pembentukan Karakter': 'border-rose-200 bg-rose-50 text-rose-700'
  };

  const filteredPillars = PROGRAM_PILARS.map((p) => {
    const matchedKegiatan = p.bentukKegiatan.filter((k) =>
      k.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.pilar.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return {
      ...p,
      bentukKegiatan: matchedKegiatan
    };
  }).filter((p) => p.bentukKegiatan.length > 0 || !searchTerm);

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Panduan Resmi Guru Wali</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              Program Kegiatan Guru Wali
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Panduan 4 Pilar Program Utama Pendampingan Murid dalam Bidang Akademik, Kompetensi, Keterampilan, dan Karakter.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => exportProgramToPDF(PROGRAM_PILARS)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm flex items-center space-x-2 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Program</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari kata kunci kegiatan atau pilar..."
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-500"
          />
        </div>
        <span className="text-xs text-slate-500 font-medium hidden sm:block">
          Total {PROGRAM_PILARS.length} Pilar Utama
        </span>
      </div>

      {/* Pillar Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPillars.map((p, index) => {
          const badgeClass = pillarColors[p.pilar as keyof typeof pillarColors] || 'border-slate-200 bg-slate-50 text-slate-700';
          const Icon = pillarIcons[p.pilar as keyof typeof pillarIcons] || <BookOpen className="w-6 h-6" />;

          return (
            <div
              key={p.pilar}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl border ${badgeClass}`}>
                      {Icon}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                        Pilar {index + 1}
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                        {p.pilar}
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Activities List */}
                <div className="space-y-3 mt-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bentuk Kegiatan Utama:
                  </h4>
                  <ul className="space-y-2.5">
                    {p.bentukKegiatan.map((kegiatan, kIdx) => (
                      <li
                        key={kIdx}
                        className="flex items-start space-x-2.5 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 hover:bg-slate-100/80 transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{kegiatan}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{p.bentukKegiatan.length} Indikator Kegiatan</span>
                <span className="text-blue-600 font-semibold">Panduan Pelaksanaan</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
