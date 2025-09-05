<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '../supabase'
import * as XLSX from 'xlsx'

const reports = ref([])
const loading = ref(false)
const selectedMonth = ref('') // 🔹 filter bulan
const selectedSales = ref('') // 🔹 filter sales

// 🔹 Ambil bulan unik dari data
const availableMonths = computed(() => {
  const set = new Set(reports.value.map(r => r.bulan_bp).filter(Boolean))
  return Array.from(set)
})

// 🔹 Ambil sales unik dari data
const availableSales = computed(() => {
  const set = new Set(reports.value.map(r => r.sales).filter(Boolean))
  return Array.from(set)
})

// 🔹 Data terfilter
const filteredReports = computed(() => {
  return reports.value.filter(r => {
    const matchMonth = !selectedMonth.value || r.bulan_bp === selectedMonth.value
    const matchSales = !selectedSales.value || r.sales === selectedSales.value
    return matchMonth && matchSales
  })
})

// 🔹 Fetch data
async function fetchReports() {
  loading.value = true
  const { data, error } = await supabase
    .from('penyerahan_unit_')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetch data:', error)
  } else {
    reports.value = data
  }
  loading.value = false
}

// 🔹 Download Excel (nama file dinamis)
function downloadExcel() {
  if (!filteredReports.value.length) return
  
  const excelData = filteredReports.value.map(report => {
    const urls = getPhotoUrls(report.foto_dec_url)
    return {
      'Tanggal Penyerahan': report.tanggal_penyerahan,
      'Nama Customer': report.nama_customer,
      'Sales': report.sales,
      'Bulan BP': report.bulan_bp,
      'URL Foto': urls.length ? urls.join(', ') : 'Tidak Ada Foto',
      'Status Foto': urls.length ? 'Ada' : 'Tidak Ada'
    }
  })
  
  const worksheet = XLSX.utils.json_to_sheet(excelData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports')

  // 🔹 Tentukan nama file sesuai filter
  const bulan = selectedMonth.value ? `bulan_${selectedMonth.value}` : 'semua_bulan'
  const sales = selectedSales.value ? `sales_${selectedSales.value}` : 'semua_sales'
  const fileName = `live_report_${bulan}_${sales}.xlsx`

  XLSX.writeFile(workbook, fileName)
}

// 🔹 Helper untuk normalisasi URL foto
function getPhotoUrls(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map(r => String(r).trim()).filter(Boolean)

  if (typeof raw === 'string') {
    let s = raw.trim()
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const arr = JSON.parse(s)
        if (Array.isArray(arr)) return arr.map(r => String(r).trim()).filter(Boolean)
      } catch (_) {}
    }
    s = s.replace(/^\[?["']?/, '').replace(/["']?\]?$/, '')
    return s ? [s] : []
  }
  return [String(raw)]
}

// 🔹 Realtime subscribe
onMounted(async () => {
  await fetchReports()

  supabase
    .channel('penyerahan-unit-channel')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'penyerahan_unit_' },
      (payload) => {
        console.log('Realtime payload:', payload)
        if (payload.eventType === 'INSERT') {
          reports.value.unshift(payload.new)
        } else if (payload.eventType === 'UPDATE') {
          const idx = reports.value.findIndex(r => r.id === payload.new.id)
          if (idx !== -1) reports.value[idx] = payload.new
        } else if (payload.eventType === 'DELETE') {
          reports.value = reports.value.filter(r => r.id !== payload.old.id)
        }
      }
    )
    .subscribe()
})
</script>


<template>
  <div class="live-report">
    <div class="header">
      <h2>📊 Live Report Penyerahan Unit</h2>
      <div class="actions">
        <!-- 🔹 Dropdown filter bulan (dari DB) -->
        <select v-model="selectedMonth" class="filter-select">
          <option value="">Semua Bulan</option>
          <option v-for="m in availableMonths" :key="m" :value="m">{{ m }}</option>
        </select>

        <!-- 🔹 Dropdown filter sales -->
        <select v-model="selectedSales" class="filter-select">
          <option value="">Semua Sales</option>
          <option v-for="s in availableSales" :key="s" :value="s">{{ s }}</option>
        </select>

        <button @click="fetchReports" class="btn refresh">🔄 Refresh</button>
        <button @click="downloadExcel" class="btn download">⬇️ Download Excel</button>
      </div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>No</th>
          <th>Tanggal Penyerahan</th>
          <th>Nama Customer</th>
          <th>Sales</th>
          <th>Bulan BP</th>
          <th>Foto</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(r, i) in filteredReports" :key="r.id">
          <td>{{ i + 1 }}</td>
          <td>{{ r.tanggal_penyerahan }}</td>
          <td>{{ r.nama_customer }}</td>
          <td>{{ r.sales }}</td>
          <td>{{ r.bulan_bp }}</td>
          <td>
            <span v-if="!getPhotoUrls(r.foto_dec_url).length">Tidak Ada Foto</span>
            <span v-else>
              <a
                v-for="(url, j) in getPhotoUrls(r.foto_dec_url)"
                :key="j"
                :href="url"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-photo me-1"
              >
                📷 Lihat Foto {{ j + 1 }}
              </a>
            </span>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="loading" class="loading">⏳ Loading...</div>
  </div>
</template>

<style scoped>
.live-report {
  padding: 1rem;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.actions {
  display: flex;
  gap: 0.5rem;
}
.filter-select {
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}
.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.refresh {
  background: #007bff;
  color: white;
}
.download {
  background: #28a745;
  color: white;
}
.report-table {
  width: 100%;
  border-collapse: collapse;
}
.report-table th,
.report-table td {
  border: 1px solid #ddd;
  padding: 8px;
}
.report-table th {
  background: #f4f4f4;
  color: #000;
}
.loading {
  margin-top: 1rem;
  text-align: center;
  font-style: italic;
}
.btn-photo {
  color: #007bff;
  text-decoration: underline;
  margin-right: 4px;
}
.no-photo {
  color: #dc3545;
}
</style>
