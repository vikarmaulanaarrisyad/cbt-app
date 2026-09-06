saya mau siswa bisa di inputkan ke dalam rombel yang sudah dibuat sebulumnya, dan wali kelas bisa di ambil dari data guru 

Fitur Pasca-Ujian & Penilaian (Pasca-Ujian)
Modul Koreksi Jawaban Esai / Uraian (Manual Grading)

Fungsi: Antarmuka khusus bagi guru/admin untuk menilai jawaban esai siswa secara cepat (dilengkapi rubrik nilai dan skor maksimal), dengan fitur blind grading (nama siswa disamarkan agar obyektif).

Modul Rekapitulasi & Analisis Hasil Ujian

Fungsi: Panel rekap yang menampilkan statistik agregat (nilai rata-rata per kelas/rombel, persentase ketuntasan, perbandingan hasil antar sesi/ujian), serta grafis sederhana (bar chart / pie chart) yang memudahkan analisis capaian pembelajaran. 


Fitur Manajemen Bank Soal & Bank Soal
Modul Bank Soal (Question Bank)

Fungsi: Wadah sentral untuk menyimpan semua soal (pilihan ganda + esai), lengkap dengan metadata kategori, tingkat kesulitan, sumber soal (mapel/bab/subbab), dan status aktif/nonaktif. Penambahan soal harus dilengkapi validasi agar tidak ada duplikat (berdasarkan konten teks + kunci jawaban).

Fitur Keamanan & Administrasi
Modul Audit Trail & Logging (Audit Trail)

Fungsi: Pencatatan aktivitas penting administrator dan guru (siapa melakukan apa, kapan, dan dari IP berapa), termasuk pembuatan ujian, perubahan konfigurasi, dan akses data sensitif, dengan tampilan log yang mudah dicari dan difilter.

Modul Manajemen Akun & Peran (User & Role Management)

Fungsi: Halaman terpusat bagi admin untuk mengelola pengguna (guru/admin), mengubah peran, mengatur akses (siapa boleh membuat/mengedit bank soal, siapa boleh merilis ujian, dll), serta reset password atau menonaktifkan akun.


Ringkasan Perubahan Utama:
Modul Ujian (Ujian & Sesi): Ditambahkan endpoint create/update/delete/list dan komponen UI form/editor. Sekarang wali kelas (teacher/admin) dapat membuat dan mengelola ujian serta sesi secara mandiri.

Modul Pelaporan (Rekap & Analisis): Ditambahkan endpoint rekapitulasi (rekap) serta halaman visualisasi grafik (analisis). Admin dan guru dapat melihat ringkasan hasil ujian per mapel dan rombel.

Modul Bank Soal (Question Bank): Ditambahkan endpoint CRUD dan manajemen kategori soal. Memungkinkan admin/guru mengelola bank soal terpusat.

Modul Manajemen Akun: Ditambahkan endpoint manage-user dan halaman admin User Management untuk mengelola pengguna dan hak akses.

Modul Keamanan: Ditambahkan endpoint audit-trail dan halaman Audit Log untuk mencatat aktivitas sistem.


Berikut adalah poin-poin kritis, kekurangan, dan area yang butuh perhatian khusus untuk mencapai standar kualitas produksi: 1. Kekurangan dalam Ekosistem UI & UX: 1.1. Inkonsistensi Desain: 1.2. Kekurangan Komponen Interaktif: 1.3. Kurangnya Indikator Visual: 2. Kekurangan dalam Penanganan Status & Data: 2.1. Status “Waiting Correction” yang Tidak Disederhanakan: 2.2. Status “In Progress” yang Minim Informasi: 2.3. Ketergantungan pada Admin untuk Monitoring: 3. Kekurangan dalam Manajemen Peserta Didik (Siswa): 3.1. Tidak Ada Fitur Penugasan Siswa ke Rombel: 3.2. Ketergantungan pada Upload CSV yang Terbatas: 3.3. Kurangnya Profiling Siswa: 4. Kekurangan dalam Administrasi Ujian & Rombel: 4.1. Tidak Ada Pembuatan Rombel secara Dinamis: 4.2. Tidak Ada Role Pembagian Tugas Guru (waliKelas/Pengawas): 4.3. Kurangnya Validasi Keterisian Data: 5. Kekurangan dalam Fungsionalitas Pasca-Ujian & Penilaian: 5.1. Tidak Ada Modul Koreksi Jawaban Esai: 5.2. Tidak Ada Rekapitulasi & Analisis Hasil: 5.3. Tidak Ada Fitur Audit Trail: 6. Kekurangan dalam Keamanan & Manajemen Pengguna: 6.1. Tidak Ada Fitur Manajemen Akun (Admin/Guru): 6.2. Tidak Ada Audit Log: 7. Kekurangan Teknis dalam Database & Skema: 7.1. Model `Assessment` yang Tidak Terhubung ke `ExamSession`: 7.2. Keterbatasan pada `Category`: 7.3. Kurangnya Relasi Many-to-Many Antar User & Group: 8. Rekomendasi Perubahan: 8.1. Modul Ujian & Sesi (Diperbaiki): 8.2. Modul Pelaporan (Diperbaiki): 8.3. Modul Bank Soal (Diperbaiki): 8.4. Modul Manajemen Akun (Diperbaiki): 8.5. Modul Keamanan (Diperbaiki): 8.6. Perubahan pada Database & Model: 8.7. Perubahan pada UI/UX: 9. Kesimpulan: 9.1. Kekurangan Utama (Must Fix): 9.2. Kekurangan Sekunder (Should Fix): 9.3. Kekurangan Tersier (Nice to Have): 9.4. Tindakan yang Direkomendasikan (Immediate Action): 


Berikut adalah analisis mendalam yang membandingkan aplikasi CBT yang sudah berjalan dengan fitur-fitur yang direkomendasikan, mencakup kelengkapan fitur, kualitas implementasi, dan rekomendasi perbaikan: 1. Ringkasan Perbandingan: 2. Analisis Kelengkapan Fitur (Per Kategori): 2.1. Manajemen Akun & User Role: 2.2. Administrasi Ujian & Sesi: 2.3. Manajemen Bank Soal: 2.4. Pelaksanaan & Monitoring Ujian (Student & Teacher): 2.5. Penilaian & Pasca-Ujian: 2.6. Pelaporan & Analisis: 2.7. Keamanan & Audit: 3. Analisis Kualitas Implementasi: 3.1. UI/UX: 3.2. Penanganan Status & Data: 3.3. Manajemen Peserta Didik (Siswa): 3.4. Administrasi & Rombel: 3.5. Fungsionalitas Penilaian: 3.6. Keamanan & Audit: 3.7. Database & Skema: 4. Rekomendasi Perbaikan: 4.1. Perbaikan Critical (Must Fix): 4.2. Perbaikan High Priority (Should Fix): 4.3. Perbaikan Medium Priority (Nice to Fix): 4.4. Tindakan yang Direkomendasikan (Immediate Action): '



Fitur Kritis Operasional Hari-H Ujian (Prioritas Tertinggi)
Fitur-fitur ini adalah "alat penyelamat" proktor ketika ujian sedang berlangsung di ruang lab:

Reset Login / Buka Sesi Peserta (Session Kick & Unbind)

Masalah Lapangan: Siswa mengalami kendala (laptop mati mendadak, browser crash, WiFi terputus), lalu saat login kembali muncul error "Akun sedang aktif / Sudah login di perangkat lain".
Fungsi: Tombol di tabel monitoring untuk me-reset status login siswa terpilih atau seluruh ruangan sekaligus, sehingga siswa dapat login kembali tanpa kehilangan jawaban yang sudah tersimpan.
Kompensasi Tambahan Waktu Individu (Extra Time)

Masalah Lapangan: Siswa kehilangan waktu 10–15 menit karena harus berpindah komputer atau PC lab diperbaiki.
Fungsi: Proktor dapat menambahkan waktu secara spesifik untuk siswa tertentu (+5, +10, +15 menit) yang langsung tersinkronisasi ke timer klien siswa.
Paksa Selesai / Kumpulkan Jawaban (Force Submit)

Fungsi: Memaksa pengumpulan lembar jawaban bagi siswa yang meninggalkan ruangan, kehabisan waktu tetapi sistem klien macet, atau siswa yang melanggar tata tertib berat.
Kunci Layar Sementara (Freeze / Suspend Screen)

Fungsi: Membekukan layar ujian siswa dari jarak jauh (misal saat terindikasi membuka contekan) dengan pesan peringatan: "Layar Anda dikunci oleh Pengawas", dan dapat dibuka kembali setelah ditegur.
2. Fitur Administrasi & Persiapan Pra-Ujian (Pra-Ujian)
Manajemen Jadwal Ujian & Sesi (Exam Scheduler)

Saat ini proyek baru memiliki Master Semester dan Bank Soal. Proktor membutuhkan modul untuk merangkai keduanya menjadi Jadwal Sesi Ujian:
Pemilihan Paket Soal + Rombel/Kelas sasaran.
Pengaturan Tanggal & Rentang Jam (Sesi 1: 07.30–09.30, Sesi 2: 10.00–12.00, dst.).
Parameter Ujian: Acak Soal (Ya/Tidak), Acak Opsi Jawaban (Ya/Tidak), Tampilkan Nilai setelah Ujian (Ya/Tidak), Izinkan Kunci Layar (Kiosk Mode).

Import Soal via Dokumen Word / Excel

Fungsi: Guru/Admin tidak perlu mengetik soal satu per satu via form; cukup mengunggah file template Word (.docx) atau Excel (.xlsx) yang otomatis di-parsing menjadi butir soal pilihan ganda, kompleks, dan esai.


Pusat Cetak Dokumen Ujian Fisik (Ready-to-Print PDF)

Cetak Kartu Peserta Ujian: Layout kartu 1 lembar isi 6–8 kartu lengkap dengan QR Code, foto, ruang, sesi, dan password login.
Cetak Lembar Presensi Ujian: Berformat kolom tanda tangan fisik per sesi/ruang.
Cetak Nomor Meja / Denah Duduk Lab CBT: Nomor meja peserta untuk ditempel di masing-masing workstation.

3. Fitur Pelaporan & Analisis (Post-Test & Analytics)
Panel Rekapitulasi Komprehensif (Comprehensive Dashboard)

Tabel Rinci Hasil Per Sesi: Menampilkan nama peserta, status (selesai/terlambat/dikeluarkan), nilai total, persentase jawaban benar/salah, dan nilai Pilihan Ganda vs Esai.
Analisis Butir Soal (Item Analysis): Untuk setiap soal ditampilkan persentase jawaban benar, daya beda (tinggi/sedang/rendah), dan efektivitas distraktor (opsi jawaban salah yang paling sering dipilih), membantu mengidentifikasi soal yang terlalu mudah, sulit, atau ambigu.
3.4. Fitur Manajemen Data Sekolah & Sekolah (School & School Data Management)
Manajemen Sekolah (Sekolah Level)

Pembuatan Data Sekolah: Mengelola informasi dasar sekolah (nama sekolah, kode sekolah, alamat, status sekolah).
Manajemen Kurikulum & Jurusan: Pengaturan kurikulum yang berlaku serta jurusan/peminatan yang ada di sekolah (misalnya IPA/IPS).
Manajemen Rombel (Sekolah Level)

Pembuatan & Pengaturan Rombel: Fitur untuk menambahkan, mengedit, atau menghapus rombel per tingkat kelas (misal: X-A, X-B, XI-IPA 1, dst.).
Penugasan Guru Wali Kelas: Mengaitkan guru sebagai wali kelas untuk setiap rombel.
Penugasan Guru Mata Pelajaran: Menentukan guru pengampu untuk mapel tertentu di rombel tertentu (opsional).

Fitur Pasca-Ujian & Penilaian (Pasca-Ujian)
Modul Koreksi Jawaban Esai / Uraian (Manual Grading)

Fungsi: Antarmuka khusus bagi guru/admin untuk menilai jawaban esai siswa secara cepat (dilengkapi rubrik nilai dan skor maksimal), dengan fitur blind grading (nama siswa disamarkan agar obyektif).
Analisis Butir Soal (Item Analysis & Reliability)

Menghitung secara otomatis:
Tingkat kesukaran soal (Mudah, Sedang, Sulit).
Daya pembeda soal (Discrimination Index).
Efektivitas pengecoh (distraktor pilihan A, B, C, D).
Hitung Ulang Nilai (Auto-Regrade)

Masalah Lapangan: Setelah ujian selesai, guru menyadari ada kunci jawaban yang salah pada soal No. 15.
Fungsi: Admin cukup mengubah kunci jawaban di Bank Soal, lalu klik "Hitung Ulang Nilai" untuk merevisi skor seluruh peserta secara otomatis tanpa perlu ujian ulang.


Fitur Keamanan & Administrasi
Modul Audit Trail & Logging (Audit Trail)

Fungsi: Pencatatan aktivitas penting administrator dan guru (siapa melakukan apa, kapan, dan dari IP berapa), termasuk pembuatan ujian, perubahan konfigurasi, dan akses data sensitif, dengan tampilan log yang mudah dicari dan difilter.
Modul Manajemen Akun & Peran (User & Role Management)

Fungsi: Halaman terpusat bagi admin untuk mengelola pengguna (guru/admin), mengubah peran, mengatur akses (siapa boleh membuat/mengedit bank soal, siapa boleh merilis ujian, dll), serta reset password atau menonaktifkan akun.

Fitur Tambahan & Pelengkap
Fitur Pengaturan Sekolah & Kurikulum (School Settings & Curriculum Management)

Pembuatan Data Sekolah: Mengelola informasi dasar sekolah (nama sekolah, kode sekolah, alamat, status sekolah).
Manajemen Kurikulum & Jurusan: Pengaturan kurikulum yang berlaku serta jurusan/peminatan yang ada di sekolah (misalnya IPA/IPS).
Manajemen Rombel (Sekolah Level)

Pembuatan & Pengaturan Rombel: Fitur untuk menambahkan, mengedit, atau menghapus rombel per tingkat kelas (misal: X-A, X-B, XI-IPA 1, dst.).
Penugasan Guru Wali Kelas: Mengaitkan guru sebagai wali kelas untuk setiap rombel.
Penugasan Guru Mata Pelajaran: Menentukan guru pengampu untuk mapel tertentu di rombel tertentu (opsional).

Fitur Keandalan Skala Besar (1.000.000 Pengguna & Jaringan Putus)
Local Caching & Offline Auto-Save (IndexedDB Client)

Klien siswa menyimpan lembar jawaban di penyimpanan lokal peramban (IndexedDB) setiap 1 detik. Jika koneksi server mati total selama 30 menit, siswa tetap bisa mengerjakan soal dan jawaban otomatis terkirim begitu jaringan kembali normal.
Sinkronisasi Server Semi-Online (Pusat <-> Server Lokal Sekolah)

Seperti arsitektur ANBK: Sekolah mengunduh paket VHD / dump paket soal sebelum hari-H, ujian berjalan di jaringan lokal sekolah (LAN tanpa internet), kemudian proktor mengunggah (upload/sync) hasil ujian ke server pusat setelah sesi selesai.
Audit Trail Ekspor & Log Forensik Ujian

Rekam jejak lengkap per klik: Waktu siswa membuka soal no. X, waktu memilih jawaban Y, IP address, user-agent, dan history perpindahan tab.
