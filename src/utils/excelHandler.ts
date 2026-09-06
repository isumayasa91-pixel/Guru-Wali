import * as XLSX from 'xlsx';
import { GuruWali, MuridBimbingan, JenisKelamin, isSameGuru } from '../types';

export const exportGuruWaliToExcel = (guruList: GuruWali[]) => {
  const exportData = guruList.map((g, i) => ({
    'No': i + 1,
    'NIP': g.nip,
    'Nama Lengkap & Gelar': g.nama,
    'Kelas Bimbingan 1': g.kelasWali,
    'Kelas Bimbingan 2': g.kelasWali2 || '-',
    'No. HP / Whatsapp': g.noHp,
    'Email': g.email,
    'Status': g.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Guru Wali');
  XLSX.writeFile(workbook, `Daftar_Guru_Wali_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const exportMuridToExcel = (muridList: MuridBimbingan[]) => {
  const exportData = muridList.map((m, i) => ({
    'No': i + 1,
    'NISN': m.nisn,
    'Nama Murid Bimbingan': m.nama,
    'Kelas': m.kelas,
    'Jenis Kelamin': m.jenisKelamin,
    'Kontak Orang Tua (No HP)': m.kontakOrangTua,
    'Guru Wali': m.namaGuruWali || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Daftar Murid Bimbingan');
  XLSX.writeFile(workbook, `Daftar_Murid_Bimbingan_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

export const downloadTemplateGuruExcel = () => {
  const templateData = [
    {
      'NIP': '198501122010011002',
      'Nama Lengkap & Gelar': 'Budi Santoso, S.Pd.',
      'Kelas Bimbingan 1': 'VIII E',
      'Kelas Bimbingan 2': 'VIII A',
      'No HP': '081234567890',
      'Email': 'budi.santoso@sekolah.sch.id'
    },
    {
      'NIP': '198803152012012005',
      'Nama Lengkap & Gelar': 'Siti Aminah, M.Pd.',
      'Kelas Bimbingan 1': 'IX A',
      'Kelas Bimbingan 2': '',
      'No HP': '082198765432',
      'Email': 'siti.aminah@sekolah.sch.id'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Guru');
  XLSX.writeFile(workbook, 'Template_Import_Guru_Wali.xlsx');
};

export const downloadTemplateMuridExcel = () => {
  const templateData = [
    {
      'NISN': '0081234567',
      'Nama Murid Bimbingan': 'Aditya Pratama',
      'Kelas': 'VIII E',
      'Jenis Kelamin': 'Laki-laki',
      'Kontak Orang Tua (No HP)': '081211112222'
    },
    {
      'NISN': '0081234568',
      'Nama Murid Bimbingan': 'Anisa Rahmawati',
      'Kelas': 'VIII E',
      'Jenis Kelamin': 'Perempuan',
      'Kontak Orang Tua (No HP)': '081233334444'
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Import Murid');
  XLSX.writeFile(workbook, 'Template_Import_Murid_Bimbingan.xlsx');
};

export const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};

export const parseGuruExcel = (json: any[]): GuruWali[] => {
  const result: GuruWali[] = [];

  json.forEach((row, idx) => {
    const nip = String(row['NIP'] || row['nip'] || `GURU-${idx + 100}`).trim();
    const nama = String(row['Nama Lengkap & Gelar'] || row['Nama'] || row['nama'] || 'Guru tanpa nama').trim();
    
    // Support either separate columns or comma-separated single column
    let kelasWali = String(row['Kelas Bimbingan 1'] || row['Kelas Wali'] || row['Kelas 1'] || row['Kelas'] || row['kelas'] || 'VIII E').trim();
    let kelasWali2Raw = String(row['Kelas Bimbingan 2'] || row['Kelas Wali 2'] || row['Kelas 2'] || row['kelas2'] || '').trim();

    if (!kelasWali2Raw && kelasWali.includes(',')) {
      const parts = kelasWali.split(',').map((p) => p.trim());
      kelasWali = parts[0] || 'VIII E';
      kelasWali2Raw = parts[1] || '';
    }

    const noHp = String(row['No HP'] || row['No. HP / Whatsapp'] || row['noHp'] || '-').trim();
    const email = String(row['Email'] || row['email'] || `${nip}@sekolah.sch.id`).trim();

    // Check if this teacher was already added in a previous row (by same NIP or same Name)
    const existing = result.find((g) => isSameGuru(g, { nip, nama }));

    if (existing) {
      // Add the new class as kelasWali2 or merge if not already present
      if (kelasWali && existing.kelasWali !== kelasWali && existing.kelasWali2 !== kelasWali) {
        if (!existing.kelasWali2) {
          existing.kelasWali2 = kelasWali;
        }
      }
      if (kelasWali2Raw && kelasWali2Raw !== '-' && existing.kelasWali !== kelasWali2Raw && existing.kelasWali2 !== kelasWali2Raw) {
        if (!existing.kelasWali2) {
          existing.kelasWali2 = kelasWali2Raw;
        }
      }
      if (noHp && noHp !== '-' && existing.noHp === '-') {
        existing.noHp = noHp;
      }
      if (email && email.includes('@') && !existing.email.includes('@')) {
        existing.email = email;
      }
    } else {
      result.push({
        id: `guru-import-${Date.now()}-${idx}`,
        nip,
        nama,
        kelasWali,
        kelasWali2: kelasWali2Raw && kelasWali2Raw !== '-' && kelasWali2Raw !== kelasWali ? kelasWali2Raw : undefined,
        noHp,
        email,
        status: 'Aktif'
      });
    }
  });

  return result;
};

export const parseMuridExcel = (json: any[]): MuridBimbingan[] => {
  return json.map((row, idx) => {
    const nisn = String(row['NISN'] || row['nisn'] || `00${Date.now().toString().slice(-8)}`).trim();
    const nama = String(row['Nama Murid Bimbingan'] || row['Nama Murid'] || row['Nama'] || 'Murid Bimbingan').trim();
    const kelas = String(row['Kelas'] || row['kelas'] || 'VIII E').trim();
    
    let jkRaw = String(row['Jenis Kelamin'] || row['JK'] || 'Laki-laki').trim().toLowerCase();
    const jenisKelamin: JenisKelamin = jkRaw.includes('p') || jkRaw.includes('perempuan') ? 'Perempuan' : 'Laki-laki';

    const kontakOrangTua = String(row['Kontak Orang Tua (No HP)'] || row['Kontak Orang Tua'] || row['No HP'] || '-').trim();

    return {
      id: `murid-import-${Date.now()}-${idx}`,
      nisn,
      nama,
      kelas,
      jenisKelamin,
      kontakOrangTua
    };
  });
};
