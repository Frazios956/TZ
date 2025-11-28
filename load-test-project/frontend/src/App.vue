<template>
  <div class="app">
    <!-- Шапка -->
    <header class="header">
      <div class="header-content">
        <div class="logo">
          <div class="logo-icon">⚡</div>
          <h1>LoadTest Pro</h1>
        </div>
        <div class="status-indicator" :class="connectionStatus">
          {{ connectionText }}
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Карточка настройки -->
      <div class="card config-card">
        <h2 class="card-title">
          <span class="icon">⚙️</span>
          Настройки тестирования
        </h2>
        
        <div class="config-grid">
          <div class="input-group">
            <label for="requestsCount" class="input-label">
              <span class="label-icon">📊</span>
              Всего запросов
            </label>
            <input 
              type="number" 
              id="requestsCount"
              v-model.number="requestsCount" 
              min="1" 
              max="10000"
              class="input-field"
              :disabled="testRunning"
            >
            <div class="input-hint">от 1 до 100,000 запросов</div>
          </div>

          <div class="input-group">
            <label for="delayMs" class="input-label">
              <span class="label-icon">⏱️</span>
              Задержка (мс)
            </label>
            <input 
              type="number" 
              id="delayMs"
              v-model.number="delayMs" 
              min="0" 
              max="10000"
              class="input-field"
              :disabled="testRunning"
            >
            <div class="input-hint">Миллисекунды между запросами</div>
          </div>

          <div class="input-group">
            <label for="concurrent" class="input-label">
              <span class="label-icon">🚀</span>
              Параллельные запросы
            </label>
            <input 
              type="number" 
              id="concurrent"
              v-model.number="concurrentRequests" 
              min="1" 
              max="100"
              class="input-field"
              :disabled="testRunning"
            >
            <div class="input-hint">Одновременные запросы (1-200)</div>
          </div>
        </div>

        <div class="action-buttons">
          <button 
            @click="startLoadTest" 
            :disabled="testRunning"
            class="btn btn-primary"
            :class="{ 'btn-loading': testRunning }"
          >
            <span class="btn-content">
              <span class="btn-icon">🎯</span>
              {{ testRunning ? 'Тестирование...' : 'Начать нагрузочный тест' }}
            </span>
            <div class="btn-loader" v-if="testRunning"></div>
          </button>
          
          <button 
            @click="stopTest" 
            :disabled="!testRunning"
            class="btn btn-secondary"
          >
            <span class="btn-icon">⏹️</span>
            Остановить тест
          </button>
        </div>
      </div>

      <!-- Карточка результатов -->
      <div class="card results-card" v-if="results.sent > 0">
        <h2 class="card-title">
          <span class="icon">📈</span>
          Результаты тестирования
        </h2>

        <!-- Прогресс -->
        <div class="progress-section">
          <div class="progress-header">
            <span>Прогресс тестирования</span>
            <span class="progress-percent">{{ progress.toFixed(1) }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progress + '%' }"
              :class="{ 'progress-complete': progress === 100 }"
            ></div>
          </div>
        </div>

        <!-- Сетка статистики -->
        <div class="stats-grid">
          <div class="stat-card" :class="{ highlight: results.sent > 0 }">
            <div class="stat-icon">📤</div>
            <div class="stat-value">{{ results.sent }}</div>
            <div class="stat-label">Отправлено</div>
          </div>

          <div class="stat-card success" :class="{ highlight: results.successful > 0 }">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ results.successful }}</div>
            <div class="stat-label">Успешно</div>
          </div>

          <div class="stat-card error" :class="{ highlight: results.failed > 0 }">
            <div class="stat-icon">❌</div>
            <div class="stat-value">{{ results.failed }}</div>
            <div class="stat-label">Ошибок</div>
          </div>

          <div class="stat-card" :class="{ highlight: results.executionTime > 0 }">
            <div class="stat-icon">⏰</div>
            <div class="stat-value">{{ formatTime(results.executionTime) }}</div>
            <div class="stat-label">Общее время</div>
          </div>

          <div class="stat-card" :class="{ highlight: results.averageResponseTime > 0 }">
            <div class="stat-icon">🚀</div>
            <div class="stat-value">{{ results.averageResponseTime }}мс</div>
            <div class="stat-label">Среднее время</div>
          </div>

          <div class="stat-card" :class="{ highlight: results.requestsPerSecond > 0 }">
            <div class="stat-icon">📊</div>
            <div class="stat-value">{{ results.requestsPerSecond }}</div>
            <div class="stat-label">Запросов/сек</div>
          </div>
        </div>

        <!-- Метрики производительности -->
        <div class="metrics-section">
          <h3 class="metrics-title">Метрики производительности</h3>
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-label">Успешные запросы:</span>
              <span class="metric-value success">
                {{ successRate.toFixed(1) }}%
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Ошибки:</span>
              <span class="metric-value error">
                {{ errorRate.toFixed(1) }}%
              </span>
            </div>
            <div class="metric">
              <span class="metric-label">Передано данных:</span>
              <span class="metric-value">
                {{ formatBytes(totalDataTransferred) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Карточка подключения -->
      <div class="card connection-card">
        <h2 class="card-title">
          <span class="icon">🔗</span>
          Статус подключения
        </h2>
        
        <div class="connection-test">
          <button @click="testConnection" class="btn btn-outline" :disabled="connectionTesting">
            <span class="btn-content">
              <span class="btn-icon">🔍</span>
              {{ connectionTesting ? 'Проверка...' : 'Проверить подключение' }}
            </span>
          </button>
          
          <div class="connection-result" v-if="connectionResult">
            <div class="result-indicator" :class="connectionResult.status">
              <span class="result-icon">
                {{ connectionResult.status === 'success' ? '✅' : '❌' }}
              </span>
              {{ connectionResult.message }}
            </div>
          </div>
        </div>
      </div>

      <!-- Логи в реальном времени -->
      <div class="card logs-card" v-if="logEntries.length > 0">
        <div class="logs-header">
          <h2 class="card-title">
            <span class="icon">📝</span>
            Логи в реальном времени
          </h2>
          <button @click="clearLogs" class="btn btn-text">
            <span class="btn-icon">🗑️</span>
            Очистить
          </button>
        </div>
        
        <div class="logs-container">
          <div 
            v-for="entry in visibleLogEntries" 
            :key="entry.id"
            :class="['log-entry', entry.type]"
          >
            <span class="log-time">{{ entry.timestamp }}</span>
            <span class="log-message">{{ entry.message }}</span>
          </div>
        </div>
        
        <div class="logs-footer">
          <div class="logs-info">
            Показано {{ visibleLogEntries.length }} из {{ logEntries.length }} записей
          </div>
        </div>
      </div>
    </main>

    <!-- Подвал -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <span class="footer-text">LoadTest Pro</span>
          <span class="footer-separator">•</span>
          <span class="footer-text">Инструмент нагрузочного тестирования</span>
        </div>
        <div class="footer-stats">
          <span class="footer-stat">API: localhost:3000</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default {
  name: 'App',
  data() {
    return {
      requestsCount: 100,
      delayMs: 0,
      concurrentRequests: 10,
      testRunning: false,
      stopRequested: false,
      connectionTesting: false,
      connectionResult: null,
      results: {
        sent: 0,
        successful: 0,
        failed: 0,
        executionTime: 0,
        averageResponseTime: 0,
        requestsPerSecond: 0
      },
      startTime: null,
      responseTimes: [],
      logEntries: [],
      logCounter: 0,
      totalDataTransferred: 0
    };
  },
  computed: {
    progress() {
      return (this.results.sent / this.requestsCount) * 100;
    },
    successRate() {
      if (this.results.sent === 0) return 0;
      return (this.results.successful / this.results.sent) * 100;
    },
    errorRate() {
      if (this.results.sent === 0) return 0;
      return (this.results.failed / this.results.sent) * 100;
    },
    connectionStatus() {
      if (this.connectionResult?.status === 'success') return 'connected';
      if (this.connectionResult?.status === 'error') return 'disconnected';
      return 'unknown';
    },
    connectionText() {
      switch (this.connectionStatus) {
        case 'connected': return 'Подключено';
        case 'disconnected': return 'Не подключено';
        default: return 'Неизвестно';
      }
    },
    visibleLogEntries() {
      return this.logEntries.slice(0, 50);
    }
  },
  methods: {
    addLog(message, type = 'info') {
      this.logEntries.unshift({
        id: this.logCounter++,
        timestamp: new Date().toLocaleTimeString(),
        message,
        type
      });
      
      if (this.logEntries.length > 200) {
        this.logEntries.splice(200);
      }
    },
    
    clearLogs() {
      this.logEntries = [];
      this.logCounter = 0;
    },
    
    async testConnection() {
      this.connectionTesting = true;
      this.connectionResult = null;
      
      try {
        const response = await axios.get(`${API_BASE}/health`);
        this.connectionResult = {
          status: 'success',
          message: `Успешное подключение! Бэкенд работает.`
        };
        this.addLog('Проверка подключения: бэкенд работает', 'success');
      } catch (error) {
        this.connectionResult = {
          status: 'error',
          message: `Ошибка подключения: ${error.message}`
        };
        this.addLog(`Ошибка подключения: ${error.message}`, 'error');
      } finally {
        this.connectionTesting = false;
      }
    },
    
    async startLoadTest() {
      this.testRunning = true;
      this.stopRequested = false;
      this.results = {
        sent: 0,
        successful: 0,
        failed: 0,
        executionTime: 0,
        averageResponseTime: 0,
        requestsPerSecond: 0
      };
      this.responseTimes = [];
      this.totalDataTransferred = 0;
      this.clearLogs();
      
      this.startTime = Date.now();
      this.addLog(`Начало нагрузочного теста: ${this.requestsCount} запросов, ${this.concurrentRequests} параллельных`, 'info');
      
      const totalBatches = Math.ceil(this.requestsCount / this.concurrentRequests);
      
      try {
        for (let batch = 0; batch < totalBatches && !this.stopRequested; batch++) {
          const batchSize = Math.min(
            this.concurrentRequests, 
            this.requestsCount - this.results.sent
          );
          
          const promises = [];
          
          for (let i = 0; i < batchSize; i++) {
            promises.push(this.makeRequest());
          }
          
          await Promise.all(promises);
          
          if (this.delayMs > 0 && !this.stopRequested) {
            await new Promise(resolve => setTimeout(resolve, this.delayMs));
          }
          
          this.updateResults();
        }
      } catch (error) {
        this.addLog(`Ошибка теста: ${error.message}`, 'error');
      }
      
      this.testRunning = false;
      const endTime = Date.now();
      this.results.executionTime = endTime - this.startTime;
      
      if (this.stopRequested) {
        this.addLog('Нагрузочный тест остановлен пользователем', 'warning');
      } else {
        this.addLog('Нагрузочный тест завершен успешно', 'success');
      }
    },
    
    async makeRequest() {
      if (this.stopRequested) return;
      
      const requestId = this.results.sent + 1;
      this.results.sent++;
      
      const startRequestTime = Date.now();
      
      try {
        const response = await axios.get(`${API_BASE}/items?limit=10&offset=0`);
        const responseTime = Date.now() - startRequestTime;
        
        this.responseTimes.push(responseTime);
        this.results.successful++;
        this.totalDataTransferred += JSON.stringify(response.data).length;
        
        if (requestId % 20 === 0 || requestId <= 5) {
          this.addLog(`Запрос ${requestId} выполнен за ${responseTime}мс`, 'success');
        }
      } catch (error) {
        this.results.failed++;
        this.addLog(`Запрос ${requestId} завершился ошибкой: ${error.message}`, 'error');
      }
    },
    
    updateResults() {
      const currentTime = Date.now();
      this.results.executionTime = currentTime - this.startTime;
      
      if (this.responseTimes.length > 0) {
        this.results.averageResponseTime = Math.round(
          this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length
        );
      }
      
      if (this.results.executionTime > 0) {
        this.results.requestsPerSecond = (
          (this.results.successful + this.results.failed) / 
          (this.results.executionTime / 1000)
        ).toFixed(2);
      }
    },
    
    stopTest() {
      this.stopRequested = true;
      this.addLog('Остановка нагрузочного теста...', 'warning');
    },
    
    formatTime(ms) {
      if (ms < 1000) return `${ms}мс`;
      return `${(ms / 1000).toFixed(2)}с`;
    },
    
    formatBytes(bytes) {
      if (bytes === 0) return '0 Б';
      const k = 1024;
      const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  },
  
  mounted() {
    // Автоматическая проверка подключения при загрузке
    this.testConnection();
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --primary-color: #6366f1;
  --primary-dark: #4f46e5;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  --bg-color: #f8fafc;
  --card-bg: #ffffff;
  --text-primary: #1e293b;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
  --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
}

body {
  font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg-color);
  color: var(--text-primary);
  line-height: 1.6;
}

.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Шапка */
.header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: 1rem 0;
  box-shadow: var(--shadow);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  font-size: 2rem;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.status-indicator {
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.status-indicator.connected {
  background: rgba(16, 185, 129, 0.2);
}

.status-indicator.disconnected {
  background: rgba(239, 68, 68, 0.2);
}

/* Основное содержимое */
.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 
      "config connection"
      "results results"
      "logs logs";
  }
  
  .config-card { grid-area: config; }
  .connection-card { grid-area: connection; }
  .results-card { grid-area: results; }
  .logs-card { grid-area: logs; }
}

/* Карточки */
.card {
  background: var(--card-bg);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: var(--shadow-lg);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.card-title .icon {
  font-size: 1.5rem;
}

/* Конфигурация */
.config-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-label {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label-icon {
  font-size: 1.25rem;
}

.input-field {
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: var(--card-bg);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.input-hint {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Кнопки */
.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
}

.btn-secondary {
  background: var(--text-secondary);
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #475569;
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.btn-outline:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.btn-text {
  background: transparent;
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
}

.btn-text:hover:not(:disabled) {
  color: var(--text-primary);
}

.btn-loading {
  pointer-events: none;
}

.btn-loader {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 0.5rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Прогресс */
.progress-section {
  margin-bottom: 2rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.progress-percent {
  color: var(--primary-color);
  font-weight: 700;
}

.progress-bar {
  height: 0.75rem;
  background: var(--border-color);
  border-radius: 1rem;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  border-radius: 1rem;
  transition: width 0.3s ease;
  position: relative;
}

.progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
  animation: shimmer 2s infinite;
}

.progress-complete::after {
  animation: none;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Сетка статистики */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--bg-color);
  padding: 1.5rem 1rem;
  border-radius: 0.75rem;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.stat-card.highlight {
  border-color: var(--primary-color);
  box-shadow: var(--shadow);
}

.stat-card.success {
  background: rgba(16, 185, 129, 0.1);
}

.stat-card.error {
  background: rgba(239, 68, 68, 0.1);
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

/* Метрики */
.metrics-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
}

.metrics-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-color);
  border-radius: 0.5rem;
}

.metric-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.metric-value {
  font-weight: 700;
}

.metric-value.success {
  color: var(--success-color);
}

.metric-value.error {
  color: var(--error-color);
}

/* Проверка подключения */
.connection-test {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.connection-result {
  padding: 1rem;
  border-radius: 0.75rem;
  background: var(--bg-color);
}

.result-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.result-indicator.success {
  color: var(--success-color);
}

.result-indicator.error {
  color: var(--error-color);
}

/* Логи */
.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.logs-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--bg-color);
}

.log-entry {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.875rem;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-entry.info {
  background: var(--card-bg);
}

.log-entry.success {
  background: rgba(16, 185, 129, 0.05);
  border-left: 4px solid var(--success-color);
}

.log-entry.error {
  background: rgba(239, 68, 68, 0.05);
  border-left: 4px solid var(--error-color);
}

.log-entry.warning {
  background: rgba(245, 158, 11, 0.05);
  border-left: 4px solid var(--warning-color);
}

.log-time {
  color: var(--text-secondary);
  font-size: 0.75rem;
  min-width: 80px;
}

.log-message {
  flex: 1;
}

.logs-footer {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Подвал */
.footer {
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  padding: 1.5rem 0;
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-text {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.footer-separator {
  color: var(--border-color);
}

.footer-stat {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-family: 'Monaco', 'Consolas', monospace;
}

/* Адаптивность */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }
  
  .card {
    padding: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}

/* Стилизация скроллбара */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: var(--text-secondary);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-primary);
}
</style>