<template>
  <div class="card form-card">
    <div class="form-section">
      <div class="form-header">
        <div class="form-title w-full text-center">
          <h2 class="font-bold text-lg">
            📄 Form Penyerahan Unit
          </h2>
          <div class="jenis-badge outside">
            PENYERAHAN DI LUAR SHOWROOM
          </div>
        </div>
      </div>

      <form @submit.prevent="onSubmit" id="formPenyerahan">
        <!-- Tanggal -->
        <div class="mb-3">
          <label>Tanggal Penyerahan *</label>
          <input type="date" v-model="tanggal" required />
        </div>

        <!-- Bulan -->
        <div class="mb-3">
          <label>Bulan BP *</label>
          <select v-model="bulan" required>
            <option value="">Pilih Bulan</option>
            <option v-for="b in bulanList" :key="b">{{ b }}</option>
          </select>
        </div>

        <!-- Sales -->
        <div class="mb-3">
          <label>Sales *</label>
          <select v-model="sales" required>
            <option value="">Pilih Sales</option>
            <option v-for="s in salesList" :key="s">{{ s }}</option>
          </select>
        </div>

        <!-- Nama Customer -->
        <div class="mb-3">
          <label>Nama Customer</label>
          <input type="text" v-model="nama_customer" />
        </div>

        <!-- Upload Foto DEC -->
        <div class="mb-3">
          <label>Upload Foto DEC *</label>

          <!-- Tombol utama -->
          <button type="button" class="btn-add" @click="showUploadOptions = true">
            ➕ Tambah Foto DEC
          </button>

          <!-- Preview Foto -->
          <div v-if="fotoFiles.length > 0" class="preview-grid">
            <div v-for="(foto, index) in fotoFiles" :key="index" class="preview-item">
              <img :src="foto.url" class="preview-img" />
              <button type="button" class="remove-btn" @click="removeFoto(index)">×</button>
            </div>
          </div>

          <!-- Modal Pilihan Upload -->
          <div v-if="showUploadOptions" class="modal-overlay">
            <div class="modal">
              <h3>Pilih Sumber Foto</h3>
              <button class="upload-option" @click="$refs.cameraInput.click(); closeOptions()">📸 Ambil Foto</button>
              <button class="upload-option" @click="$refs.galleryInput.click(); closeOptions()">🖼️ Pilih dari Galeri</button>
              <button class="upload-option" @click="$refs.fileInput.click(); closeOptions()">📂 Pilih File</button>
              <button class="btn-cancel" @click="closeOptions">Batal</button>
            </div>
          </div>

          <!-- Input hidden -->
          <input ref="fileInput" type="file" accept="image/*" @change="onFotoChange" hidden />
          <input ref="galleryInput" type="file" accept="image/*" multiple @change="onFotoChange" hidden />
          <input ref="cameraInput" type="file" accept="image/*" capture="environment" @change="onFotoChange" hidden />
        </div>

        <!-- Tombol Submit -->
        <div class="actions">
          <button type="submit" class="btn-submit" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner"></span>
            {{ isSubmitting ? 'Mengirim...' : 'Submit' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

// Konfigurasi Supabase - GANTI DENGAN URL DAN KEY ANDA
const supabaseUrl = 'https://vvksehbozaufwlxjlyhf.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2a3NlaGJvemF1ZndseGpseWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MDY3MjksImV4cCI6MjA3MDA4MjcyOX0.DCQO92eR6l5djjlYLCJVF5M-rbg4HUeXN-rsZsEDmho'

const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: "PenyerahanUnitForm",
  data() {
    return {
      tanggal: "",
      bulan: "",
      sales: "",
      nama_customer: "",
      fotoFiles: [],
      isSubmitting: false,
      showUploadOptions: false,
      bulanList: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ],
      salesList: [
      "ADE YULIA","ADRIANTO","AULIA NOPRI","AZIS","DENI SAHPUTRA",
      "FAHRIZAN HUTASUHUT","JIMMY PRATAMA","MHD REZKI","MUHAMMAD FAJAR",
      "MUHAMMAD NUR","RANDI SAPUTRA","RISKI ERISMA IHSAN","RITA ATRIA",
      "RONAL EKA PUTRA","SYAFITRI ALHAPI"
    ], // contoh data
    };
  },
  methods: {
    onFotoChange(e) {
      const files = Array.from(e.target.files);
      files.forEach(file => {
        this.fotoFiles.push({ file, url: URL.createObjectURL(file) });
      });
    },
    removeFoto(index) {
      URL.revokeObjectURL(this.fotoFiles[index].url);
      this.fotoFiles.splice(index, 1);
    },
    closeOptions() {
      this.showUploadOptions = false;
    },
    async uploadFotoToSupabase(file, index) {
      try {
        const fileName = `foto_dec_${Date.now()}_${index}.${file.name.split('.').pop()}`;
        const filePath = `penyerahan_unit/${fileName}`;

        // Coba upload ke bucket 'uploads'
        let { data, error } = await supabase.storage
          .from('uploads')
          .upload(filePath, file);

        // Jika bucket 'uploads' tidak ada, coba bucket 'images'
        if (error && error.message.includes('Bucket not found')) {
          console.log('Bucket uploads tidak ditemukan, mencoba bucket images...');
          ({ data, error } = await supabase.storage
            .from('images')
            .upload(filePath, file));
        }

        // Jika masih error, coba bucket dengan nama lain yang umum
        if (error && error.message.includes('Bucket not found')) {
          console.log('Bucket images tidak ditemukan, mencoba bucket files...');
          ({ data, error } = await supabase.storage
            .from('files')
            .upload(filePath, file));
        }

        if (error) {
          console.error('Upload error:', error);
          throw new Error(`Upload gagal: ${error.message}. Pastikan bucket storage sudah dibuat di Supabase.`);
        }

        // Mendapatkan public URL dari bucket yang berhasil
        const bucketName = data.fullPath.split('/')[0];
        const { data: urlData } = supabase.storage
          .from(bucketName)
          .getPublicUrl(filePath);

        return urlData.publicUrl;
      } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
      }
    },
    async onSubmit() {
      if (!this.tanggal || !this.bulan || !this.sales || this.fotoFiles.length === 0) {
        alert("Mohon lengkapi semua field wajib!");
        return;
      }

      this.isSubmitting = true;

      try {
        // Upload semua foto ke Supabase Storage
        const fotoUrl = [];
        for (let i = 0; i < this.fotoFiles.length; i++) {
          const url = await this.uploadFotoToSupabase(this.fotoFiles[i].file, i);
          fotoUrl.push(url);
        }

        // Simpan data ke database Supabase
        const { data, error } = await supabase
          .from('penyerahan_unit_') // nama tabel di Supabase
          .insert([
            {
              tanggal_penyerahan: this.tanggal,
              bulan_bp: this.bulan,
              sales: this.sales,
              nama_customer: this.nama_customer || null,
              foto_dec_url: fotoUrl, // menyimpan array URL foto
              created_at: new Date().toISOString()
            }
          ]);

        if (error) {
          console.error('Database error:', error);
          throw error;
        }

        console.log("Data berhasil disimpan:", data);
        alert("Form berhasil dikirim dan disimpan ke database!");
        this.resetForm();

      } catch (err) {
        console.error('Error:', err);
        alert("Terjadi kesalahan saat mengirim form: " + err.message);
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.tanggal = "";
      this.bulan = "";
      this.sales = "";
      this.nama_customer = "";
      // Bersihkan URL objek untuk mencegah memory leak
      this.fotoFiles.forEach(foto => URL.revokeObjectURL(foto.url));
      this.fotoFiles = [];
    }
  }
};
</script>

<style scoped>
.form-card {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  max-width: 600px;
  margin: auto;
  position: relative;
  min-height: 400px;
}
.form-header {
  margin-bottom: 2rem;
  position: relative;
}


.form-title {
  text-align: center;
  margin-left: 100px;
  margin-right: 100px;
}

.form-title h2 {
  margin: 0 0 0.75rem 0;
  color: #333;
  font-size: 1.5rem;
  font-weight: 700;
}

.jenis-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 25px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.jenis-badge.showroom {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  color: #155724;
  border: 1px solid #b8dabc;
}

.jenis-badge.outside {
  background: linear-gradient(135deg, #cce7ff 0%, #b3d9ff 100%);
  color: #004085;
  border: 1px solid #9ec5fe;
}

.mb-3 {
  margin-bottom: 1rem;
}

input[type="text"], 
input[type="date"], 
input[type="tel"],
input[type="number"],
select {
  width: 100%;
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  font-size: 1rem;
}
















.btn-cancel:hover {
  background: #5a6268;
}

.actions {
  margin-top: 1rem;
  text-align: right;
}

.btn-submit {
  background: #b70000;
  color: #fff;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  min-width: 120px;
  justify-content: center;
}

.btn-submit:hover:not(:disabled) {
  background: #ff0000;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(183, 0, 0, 0.3);
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}


@keyframes spin {
  to { transform: rotate(360deg); }
}

.main-label {
  font-weight: 600;
  display: block;
  margin-bottom: .5rem;
  color: #333;
}

label {
  font-weight: 600;
  display: block;
  margin-bottom: .25rem;
  color: #333;
}






/* Responsif untuk mobile */
@media (max-width: 600px) {
  .form-card {
    padding: 1rem;
    margin: 0.5rem;
  }

  .selection-screen {
    padding: 1.5rem 0;
  }

  .header-section h1 {
    font-size: 1.75rem;
  }

  .subtitle {
    font-size: 1rem;
  }

  .selection-container {
    gap: 1.25rem;
  }

  .selection-btn {
    padding: 1.25rem;
  }

  .selection-content h3 {
    font-size: 1.1rem;
  }

  .selection-content p {
    font-size: 0.9rem;
  }

  .form-title {
    margin-left: 80px;
    margin-right: 80px;
  }

  .form-title h2 {
    font-size: 1.3rem;
  }

  .jenis-badge {
    font-size: 0.8rem;
    padding: 0.4rem 0.8rem;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.75rem;
  }

  .preview-item img,
  .doc-preview {
    height: 80px;
  }

  input[type="text"], 
  input[type="date"], 
  input[type="tel"],
  input[type="number"],
  select,
  .btn-choose-file {
    font-size: 0.9rem;
  }

  .main-label, label {
    font-size: 0.9rem;
  }

  .radio-container {
    gap: 0.6rem;
  }

  .radio-item {
    padding: 0.7rem 0.9rem;
  }

  .radio-label {
    font-size: 0.9rem;
  }

  .modal-content {
    max-width: 280px;
    padding: 1.25rem;
  }

  .option-btn {
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
  }

  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
    max-width: none;
  }

  .toast {
    padding: 0.85rem;
  }

  .toast-title {
    font-size: 0.9rem;
  }

  .toast-message {
    font-size: 0.8rem;
  }

  .loading-content {
    padding: 2rem;
    max-width: 300px;
  }

  .loading-content h3 {
    font-size: 1.1rem;
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
  }
}

/* Untuk layar sangat kecil */
@media (max-width: 400px) {
  .form-card {
    margin: 0.25rem;
    padding: 0.75rem;
  }

  .form-title {
    margin-left: 60px;
    margin-right: 60px;
  }

  .back-btn {
    font-size: 0.8rem;
    top: 1 rem;   
    left: 0.5rem;
    padding: 6px 10px;
    margin-bottom: 4px
  }

  .selection-btn {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }

  .selection-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }

  .selection-arrow {
    margin-left: 0;
    margin-top: 0.5rem;
  }

  .preview-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  }

  .radio-item {
    padding: 0.6rem 0.8rem;
  }

  .radio-label {
    font-size: 0.85rem;
  }

  .modal-content {
    max-width: 260px;
    padding: 1rem;
  }

  .toast {
    padding: 0.75rem;
  }

  .loading-content {
    padding: 1.5rem;
    max-width: 280px;
  }
}
/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .toast,
  .loading-spinner,
  .spinner,
  .progress-bar::after,
  .selection-screen {
    animation: none !important;
  }
  
  .btn-submit:hover:not(:disabled),
  .selection-btn:hover {
    transform: none;
  }
}
/* Tombol tambah foto */
.btn-add {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
  padding: 10px 16px;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  font-weight: bold;
  transition: all 0.3s ease;
}
.btn-add:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.4);
}

/* Preview foto */
.preview-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 14px;
}
.preview-item {
  position: relative;
  width: 110px;
  transition: transform 0.2s ease;
}
.preview-item:hover {
  transform: scale(1.05);
}
.preview-img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  border: 2px solid #eee;
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
}
.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff4d4d;
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.2);
}
.remove-btn:hover {
  background: #cc0000;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 14px;
  min-width: 260px;
  text-align: center;
  box-shadow: 0 6px 18px rgba(0,0,0,0.25);
}
.modal h3 {
  margin-bottom: 14px;
  font-size: 16px;
  font-weight: bold;
}
.upload-option {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  background: #f5f5f5;
  transition: background 0.3s ease;
}
.upload-option:hover {
  background: #e0e0e0;
}
.btn-cancel {
  margin-top: 12px;
  background: #eee;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  border: none;
}
.btn-cancel:hover {
  background: #ddd;
}

/* Submit */
.btn-submit {
  background: linear-gradient(135deg, #800000, #a00000);
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
}
.btn-submit:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(128, 0, 0, 0.4);
}
</style>
