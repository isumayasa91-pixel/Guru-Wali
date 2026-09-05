import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { JurnalBimbingan, RekapKehadiran, MuridBimbingan, GuruWali, PillarProgram, SchoolSettings } from '../types';
import { getStoredSchoolSettings } from './storage';

interface PDFHeaderOptions {
  doc: jsPDF;
  title: string;
  subtitle?: string;
  settings?: SchoolSettings;
}

const addSchoolHeader = ({ doc, title, subtitle, settings }: PDFHeaderOptions) => {
  const cfg = settings || getStoredSchoolSettings();
  const pageWidth = doc.internal.pageSize.getWidth();

  let startY = 12;

  // Add Logo Kabupaten (Left)
  if (cfg.logoKabupaten) {
    try {
      doc.addImage(cfg.logoKabupaten, 'PNG', 14, 10, 18, 18);
    } catch (e) {
      console.warn('Could not render logo kabupaten in PDF', e);
    }
  }

  // Add Logo Sekolah (Right)
  if (cfg.logoSekolah) {
    try {
      doc.addImage(cfg.logoSekolah, 'PNG', pageWidth - 32, 10, 18, 18);
    } catch (e) {
      console.warn('Could not render logo sekolah in PDF', e);
    }
  }

  // Header Cetak Lines (e.g. Dinas Education lines)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const headerLines = (cfg.headerCetak || 'KEMENTERIAN PENDIDIKAN, KEBUDAYAAN, RISET, DAN TEKNOLOGI')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  headerLines.forEach((line) => {
    doc.text(line.toUpperCase(), pageWidth / 2, startY, { align: 'center' });
    startY += 5;
  });

  // Nama Sekolah
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text((cfg.namaSekolah || 'SMP NEGERI INDONESIA UNGGUL').toUpperCase(), pageWidth / 2, startY, { align: 'center' });
  startY += 5;

  // Alamat & NPSN
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const alamatStr = `${cfg.alamatSekolah || 'Jl. Pendidikan No. 1, Kota Pendidikan'}${cfg.npsn ? ` | NPSN: ${cfg.npsn}` : ''}`;
  doc.text(alamatStr, pageWidth / 2, startY, { align: 'center' });
  startY += 4;

  // Divider Double Line
  doc.setLineWidth(0.8);
  doc.line(14, startY, pageWidth - 14, startY);
  startY += 1;
  doc.setLineWidth(0.2);
  doc.line(14, startY, pageWidth - 14, startY);
  startY += 7;

  // Document Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(title.toUpperCase(), pageWidth / 2, startY, { align: 'center' });
  startY += 6;

  if (subtitle) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9.5);
    doc.text(subtitle, pageWidth / 2, startY, { align: 'center' });
    startY += 6;
  }

  return startY;
};

const addSignatureBlock = (
  doc: jsPDF,
  startY: number,
  teacherName: string,
  teacherNip?: string,
  settings?: SchoolSettings
) => {
  const cfg = settings || getStoredSchoolSettings();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Check if signature fits on current page
  let currentY = startY + 12;
  if (currentY + 35 > pageHeight) {
    doc.addPage();
    currentY = 25;
  }

  const currentDateStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);

  // Extract Kota from Alamat or default
  const addressParts = cfg.alamatSekolah ? cfg.alamatSekolah.split(',') : [];
  const kotaName = addressParts.length > 1 ? addressParts[addressParts.length - 1].split('|')[0].trim() : 'Kota';

  // Left side: Kepala Sekolah
  const leftX = 20;
  doc.text('Mengetahui,', leftX, currentY);
  doc.text('Kepala Sekolah', leftX, currentY + 5);
  doc.text('_______________________', leftX, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(cfg.namaKepsek || 'Kepala Sekolah', leftX, currentY + 28);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIP. ${cfg.nipKepsek || '-'}`, leftX, currentY + 33);

  // Right side: Guru Wali
  const rightX = pageWidth - 75;
  doc.text(`${kotaName}, ${currentDateStr}`, rightX, currentY);
  doc.text('Guru Wali,', rightX, currentY + 5);
  doc.text('_______________________', rightX, currentY + 23);
  doc.setFont('helvetica', 'bold');
  doc.text(teacherName || 'Guru Wali', rightX, currentY + 28);
  doc.setFont('helvetica', 'normal');
  if (teacherNip) {
    doc.text(`NIP. ${teacherNip}`, rightX, currentY + 33);
  }
};

export const exportJurnalToPDF = (jurnalList: JurnalBimbingan[], filterInfo?: string, customSettings?: SchoolSettings) => {
  const cfg = customSettings || getStoredSchoolSettings();
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const startY = addSchoolHeader({
    doc,
    title: 'Laporan Jurnal Guru Wali',
    subtitle: filterInfo || 'Rekapitulasi Jurnal Bimbingan dan Pendampingan Murid',
    settings: cfg
  });

  const tableData = jurnalList.map((item, index) => [
    index + 1,
    `${item.tanggal}\n${item.waktu}`,
    `${item.namaMurid}\nNISN: ${item.nisn}\nKelas: ${item.kelas}`,
    item.jenisBimbingan,
    item.topik,
    item.tindakLanjut,
    item.namaGuruWali
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['No', 'Tgl & Waktu', 'Murid Bimbingan', 'Jenis Bimbingan', 'Topik / Permasalahan', 'Tindak Lanjut', 'Guru Wali']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138], // Dark primary blue
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      valign: 'top'
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 45 },
      3: { cellWidth: 40 },
      4: { cellWidth: 65 },
      5: { cellWidth: 55 },
      6: { cellWidth: 28 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
  const sampleTeacher = jurnalList[0]?.namaGuruWali || 'Budi Santoso, S.Pd.';
  const sampleNip = jurnalList[0]?.nipGuruWali || '198501122010011002';

  addSignatureBlock(doc, finalY, sampleTeacher, sampleNip, cfg);

  doc.save(`Jurnal_Guru_Wali_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportRekapKehadiranToPDF = (
  rekapList: RekapKehadiran[],
  bulan: string,
  tahun: number,
  kelas: string,
  customSettings?: SchoolSettings
) => {
  const cfg = customSettings || getStoredSchoolSettings();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = addSchoolHeader({
    doc,
    title: 'Rekapitulasi Kehadiran Murid Bimbingan',
    subtitle: `Bulan: ${bulan} ${tahun} | Kelas: ${kelas}`,
    settings: cfg
  });

  let totalSakit = 0;
  let totalIzin = 0;
  let totalAlfa = 0;

  const tableData = rekapList.map((item, index) => {
    totalSakit += Number(item.sakit || 0);
    totalIzin += Number(item.izin || 0);
    totalAlfa += Number(item.tanpaKeterangan || 0);

    return [
      index + 1,
      item.nisn,
      item.namaMurid,
      item.sakit || 0,
      item.izin || 0,
      item.tanpaKeterangan || 0,
      (Number(item.sakit || 0) + Number(item.izin || 0) + Number(item.tanpaKeterangan || 0))
    ];
  });

  // Footer summary row
  tableData.push([
    '',
    '',
    'TOTAL',
    totalSakit,
    totalIzin,
    totalAlfa,
    totalSakit + totalIzin + totalAlfa
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['No', 'NISN', 'Nama Murid Bimbingan', 'Sakit (Hari)', 'Izin (Hari)', 'Tanpa Ket. (Hari)', 'Total Absen']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // Teal color
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 32, halign: 'center' },
      2: { cellWidth: 68 },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 25, halign: 'center' },
      6: { cellWidth: 22, halign: 'center' }
    },
    didParseCell: (data) => {
      if (data.row.index === tableData.length - 1) {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.fillColor = [243, 244, 246];
      }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
  addSignatureBlock(doc, finalY, 'Guru Wali Kelas ' + kelas, undefined, cfg);

  doc.save(`Rekap_Kehadiran_Kelas_${kelas.replace(' ', '_')}_${bulan}_${tahun}.pdf`);
};

export const exportMuridListToPDF = (muridList: MuridBimbingan[], filterKelas?: string, customSettings?: SchoolSettings) => {
  const cfg = customSettings || getStoredSchoolSettings();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = addSchoolHeader({
    doc,
    title: 'Daftar Murid Bimbingan Guru Wali',
    subtitle: filterKelas ? `Filter Kelas: ${filterKelas}` : 'Seluruh Kelas VII A s/d IX E',
    settings: cfg
  });

  const tableData = muridList.map((item, index) => [
    index + 1,
    item.nisn,
    item.nama,
    item.kelas,
    item.jenisKelamin,
    item.kontakOrangTua,
    item.namaGuruWali || '-'
  ]);

  autoTable(doc, {
    startY: startY,
    head: [['No', 'NISN', 'Nama Murid', 'Kelas', 'JK', 'No. HP Orang Tua', 'Guru Wali']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 58, 138],
      textColor: 255,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8.5
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 48 },
      3: { cellWidth: 18, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 32, halign: 'center' },
      6: { cellWidth: 35 }
    },
    margin: { left: 14, right: 14 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || startY + 20;
  addSignatureBlock(doc, finalY, 'Koordinator Guru Wali', undefined, cfg);

  doc.save(`Daftar_Murid_Bimbingan_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportProgramToPDF = (pillars: PillarProgram[], customSettings?: SchoolSettings) => {
  const cfg = customSettings || getStoredSchoolSettings();
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const startY = addSchoolHeader({
    doc,
    title: 'Program Kegiatan Guru Wali',
    subtitle: 'Panduan Pilar & Bentuk Kegiatan Pendampingan Murid',
    settings: cfg
  });

  let currentY = startY + 5;

  pillars.forEach((p, idx) => {
    if (currentY + 40 > doc.internal.pageSize.getHeight()) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 58, 138);
    doc.text(`${idx + 1}. Pilar Program: ${p.pilar}`, 14, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    p.bentukKegiatan.forEach((k) => {
      const splitLines = doc.splitTextToSize(`• ${k}`, 170);
      doc.text(splitLines, 20, currentY);
      currentY += splitLines.length * 5;
    });

    currentY += 4;
  });

  addSignatureBlock(doc, currentY, 'Kepala Tim Guru Wali', undefined, cfg);
  doc.save(`Program_Kegiatan_Guru_Wali.pdf`);
};
