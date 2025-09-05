<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <div class="header-top">
        <img src="/logo.png" alt="Toyota" class="logo" />
        <div class="header-text">
          <h1>PT Agung Toyota</h1>
          <p class="subtitle">Live Report Penyerahan Unit</p>
        </div>
      </div>

      <nav class="nav-buttons">
        <button :class="{ active: view === 'form' }" @click="view = 'form'">📝 Form Penyerahan</button>
        <button :class="{ active: view === 'report' }" @click="view = 'report'">📊 Live Report</button>
      </nav>
    </header>

    <main class="main-content">
      <section v-show="view === 'form'">
        <FormPenyerahan />
      </section>
      <section v-show="view === 'report'">
        <ReportPenyerahan />
      </section>
    </main>

    <footer class="app-footer">
      <small>© PT Agung Toyota</small>
    </footer>
  </div>
</template>

<script>
import FormPenyerahan from './components/SalesForm.vue'
import ReportPenyerahan from './components/LiveReport.vue'

export default {
  name: 'App',
  components: { FormPenyerahan, ReportPenyerahan },
  data() {
    return { view: 'form' }
  }
}
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f6f6f6;
  font-family: "Segoe UI", Roboto, Arial, sans-serif;
}

/* HEADER */
.app-header {
  background: #b70000;
  color: white;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
}

.header-top {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  height: 56px;
}

.header-text h1 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.nav-buttons button {
  background: white;
  color: #b70000;
  border: none;
  padding: 0.5rem 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
}

.nav-buttons button.active {
  background: #ff0000;
  color: white;
}

/* MAIN CONTENT */
.main-content {
  max-width: 1000px;
  margin: 1.25rem auto;
  padding: 0 1rem 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* FOOTER */
.app-footer {
  text-align: center;
  padding: 1rem;
  color: #777;
  margin-top: 1rem;
}

/* MOBILE FRIENDLY */
@media (max-width: 600px) {
  .header-top {
    flex-direction: column;
    text-align: center;
  }

  .header-text h1 {
    font-size: 1rem;
  }

  .subtitle {
    font-size: 0.8rem;
  }

  .nav-buttons {
    width: 100%;
    flex-direction: column;
  }

  .nav-buttons button {
    width: 100%;
  }
}
</style>
