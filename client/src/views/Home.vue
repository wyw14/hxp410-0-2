<template>
  <div class="home-container">
    <div class="card secret-card">
      <div class="card-header">
        <span class="icon">💫</span>
        <h2>今日被宽恕的秘密</h2>
      </div>

      <div class="mood-filter">
        <span class="filter-label">按心情筛选：</span>
        <div class="filter-buttons">
          <button
            class="filter-btn"
            :class="{ active: selectedMood === 'all' }"
            @click="filterByMood('all')"
          >
            全部
          </button>
          <button
            v-for="mood in moods"
            :key="mood.key"
            class="filter-btn"
            :class="{ active: selectedMood === mood.key }"
            :style="{ '--mood-color': mood.color }"
            @click="filterByMood(mood.key)"
          >
            <span class="filter-emoji">{{ mood.emoji }}</span>
            {{ mood.label }}
          </button>
        </div>
      </div>

      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>正在寻找一段温暖的秘密...</p>
      </div>

      <div v-else-if="!hasSecret" class="empty-state">
        <span class="empty-icon">🌸</span>
        <p>{{ message }}</p>
        <button class="btn btn-primary" @click="goToConfess">
          分享第一个秘密
        </button>
      </div>

      <transition name="fade" v-else>
        <div class="secret-content" :key="secret?.id">
          <div v-if="getMoodInfo(secret.mood)" class="mood-tag" :style="{ '--mood-color': getMoodInfo(secret.mood).color }">
            <span class="mood-emoji">{{ getMoodInfo(secret.mood).emoji }}</span>
            <span class="mood-label">{{ getMoodInfo(secret.mood).label }}</span>
          </div>
          <p class="secret-text">"{{ secret.content }}"</p>
          <div class="secret-footer">
            <span class="status-badge">{{ secret.status }}</span>
            <button class="btn btn-secondary refresh-btn" @click="fetchRandomSecret">
              🔄 换一个
            </button>
          </div>
        </div>
      </transition>

      <div class="card-actions">
        <button class="btn btn-primary" @click="goToConfess">
          我也想倾诉
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const hasSecret = ref(false)
const secret = ref(null)
const message = ref('')
const moods = ref([])
const selectedMood = ref('all')

async function fetchMoods() {
  try {
    const response = await fetch('/api/moods')
    const data = await response.json()
    moods.value = data.moods
  } catch (err) {
    console.error('获取心情列表失败:', err)
  }
}

function getMoodInfo(moodKey) {
  return moods.value.find(m => m.key === moodKey) || null
}

async function filterByMood(moodKey) {
  selectedMood.value = moodKey
  await fetchRandomSecret()
}

async function fetchRandomSecret() {
  loading.value = true
  try {
    const url = selectedMood.value === 'all'
      ? '/api/secrets/random'
      : `/api/secrets/random?mood=${selectedMood.value}`
    const response = await fetch(url)
    const data = await response.json()
    hasSecret.value = data.hasSecret
    secret.value = data.secret
    message.value = data.message
  } catch (error) {
    console.error('获取秘密失败:', error)
    hasSecret.value = false
    message.value = '暂时无法连接到服务器'
  } finally {
    loading.value = false
  }
}

function goToConfess() {
  router.push('/confess')
}

onMounted(async () => {
  await fetchMoods()
  await fetchRandomSecret()
})
</script>

<style scoped>
.home-container {
  width: 100%;
  max-width: 600px;
}

.secret-card {
  animation: slideUp 0.6s ease;
}

.mood-filter {
  margin-bottom: 30px;
  text-align: center;
}

.filter-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px;
  border: 1.5px solid #e0e0e0;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  border-color: #ccc;
  background: #f5f5f5;
}

.filter-btn.active {
  border-color: var(--mood-color, #667eea);
  background: color-mix(in srgb, var(--mood-color, #667eea) 15%, white);
  color: var(--mood-color, #667eea);
  font-weight: 500;
}

.filter-emoji {
  font-size: 16px;
}

.mood-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: color-mix(in srgb, var(--mood-color) 15%, white);
  border: 1.5px solid var(--mood-color);
  border-radius: 20px;
  margin-bottom: 20px;
}

.mood-tag .mood-emoji {
  font-size: 18px;
}

.mood-tag .mood-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--mood-color);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  text-align: center;
  margin-bottom: 30px;
}

.icon {
  font-size: 48px;
  display: block;
  margin-bottom: 10px;
}

.card-header h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.loading {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(102, 126, 234, 0.3);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  font-size: 16px;
  margin-bottom: 30px;
}

.secret-content {
  padding: 20px 0;
}

.secret-text {
  font-size: 20px;
  line-height: 1.8;
  color: #333;
  font-style: italic;
  text-align: center;
  margin-bottom: 30px;
  padding: 0 10px;
}

.secret-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.status-badge {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #2d5a4a;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.refresh-btn {
  padding: 8px 20px;
  font-size: 14px;
  color: #666;
  background: #f0f0f0;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  background: #e0e0e0;
  transform: translateY(-1px);
}

.card-actions {
  margin-top: 40px;
  text-align: center;
  padding-top: 30px;
  border-top: 1px solid #eee;
}
</style>
