<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import {
  BookOpen, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, Copy, ExternalLink, Gamepad2, Heart, Home, ImageDown,
  Info, Languages, Maximize2, Minimize2, RotateCw, Search, Share2, X
} from 'lucide-vue-next'
import { yajiZhHant } from '../locales/zh-Hant.js'
import SiteDirectory from '../components/SiteDirectory.vue'
import SiteFooter from '../components/SiteFooter.vue'

const zhHans = {
  brand: '诗笺', page: '诗趣雅集', slogan: '日课一诗，闲时雅戏', back: '诗笺随阅',
  daily: '每日一诗', dailyDesc: '一日一诗，与古人如期相逢', today: '返回今日',
  streak: '已连续读诗 {count} 天', unread: '当日未留诗笺', loading: '正在送来今日诗笺…',
  retry: '再试一次', anonymous: '佚名', poetry: '古诗词', sheet: '号诗笺',
  dictionary: '查字模式', dictionaryHint: '点击诗句中的汉字查询读音与释义', queryCharacter: '查询此字',
  fullscreen: '全屏阅读', exitFullscreen: '退出全屏', immersiveReading: '沉浸阅读',
  generate: '生成卡片', generating: '生成中…', translation: '查询译文', share: '分享诗词',
  copiedShare: '已复制分享内容', copy: '抄录全诗', copied: '已抄录', openMain: '前往完整诗笺',
  poemScript: '诗笺文字', simplified: '简体', traditional: '繁體', scriptNote: '简繁转换或因合并字与古籍原文有异，建议对照阅读。',
  games: '诗词雅戏', gamesLead: '以诗为戏，在字句之间温故知新。',
  solitaire: '联句续章', solitaireDesc: '承前句余韵，续写下一章',
  riddle: '诗谜寻踪', riddleDesc: '隐去诗题或诗人，循字句猜其来处',
  fill: '补阙成章', fillDesc: '补全缺落字句，使诗章复原', preparing: '筹备中',
  menu: '雅集目录', source: '项目源码', status: 'API 状态',
  navHome: '随阅', navDaily: '日课', navGames: '雅戏', navMenu: '目录',
  languageTitle: '切换整个网页语言', languageAria: '选择网页语言', closeMenu: '关闭菜单',
  siteDirectory: '诗笺目录', directoryHome: '诗笺随阅', directoryHomeDesc: '首页',
  elegantGathering: '诗趣雅集', elegantGatheringDesc: '每日一诗与诗词互动合集',
  dailyPoem: '每日一诗', dailyPoemDesc: '每天固定相逢一首诗',
  poetryInteraction: '诗词雅戏', poetryInteractionDesc: '联句、诗谜与补阙等诗词互动', projectSource: '项目源码',
  dataFrom: '数据由「诗泉」API 提供 · 字句有尽，诗意无穷', myProject: '我的项目', apiStatus: 'API 状态', apiLink: '诗泉 API ↗'
}

const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language || '']
const detectedLang = browserLanguages.some(lang => /^(zh-Hant|zh-TW|zh-HK|zh-MO)(-|$)/i.test(lang)) ? 'zh-Hant' : 'zh-Hans'
const savedUiLang = localStorage.getItem('poetry-ui-lang')
const savedPoemLang = localStorage.getItem('poetry-poem-lang')
const uiLang = ref(['zh-Hans', 'zh-Hant'].includes(savedUiLang) ? savedUiLang : detectedLang)
const poemLang = ref(['zh-Hans', 'zh-Hant'].includes(savedPoemLang) ? savedPoemLang : uiLang.value)
const m = computed(() => uiLang.value === 'zh-Hant' ? { ...zhHans, ...yajiZhHant } : zhHans)

const today = new Date()
const todayKey = dateKey(today)
const viewDate = ref(new Date(today.getFullYear(), today.getMonth(), 1))
const selectedKey = ref(todayKey)
const poem = ref(null)
const loading = ref(true)
const error = ref('')
const dictionaryMode = ref(false)
const fullscreenReading = ref(false)
const copied = ref(false)
const shared = ref(false)
const generating = ref(false)
const gameSheetOpen = ref(false)
const streak = ref(1)
const favoriteList = ref(JSON.parse(localStorage.getItem('poetry-favorites') || '[]'))
const readVersion = ref(0)
const readingOverlay = ref(null)
const siteHost = window.location.host

const monthTitle = computed(() => new Intl.DateTimeFormat(
  uiLang.value === 'zh-Hant' ? 'zh-TW' : 'zh-CN',
  { year: 'numeric', month: 'long' }
).format(viewDate.value))

const calendarDays = computed(() => {
  readVersion.value
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const blanks = Array.from({ length: new Date(year, month, 1).getDay() }, (_, index) => ({ blank: true, key: `blank-${index}` }))
  const count = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month, index + 1)
    const key = dateKey(date)
    return {
      blank: false, key, number: index + 1,
      today: key === todayKey,
      selected: key === selectedKey.value,
      read: Boolean(localStorage.getItem(readKey(key))),
      future: date > today
    }
  })
  return [...blanks, ...days]
})

const isFavorite = computed(() => poem.value && favoriteList.value.some(item => item.id === poem.value.id))
const poemText = computed(() => poem.value
  ? `${poem.value.title}\n${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}\n\n${poem.value.content.join('\n')}`
  : '')

const REQUEST_TIMEOUT = 10000
const REQUEST_RETRIES = 2
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

function dateKey(date) { return date.toLocaleDateString('sv-SE') }
function storageKey(key) { return `poetry-daily-id-${key}` }
function readKey(key) { return `poetry-daily-read-${key}` }
function poemCharacters(line) {
  return Array.from(String(line || '')).map(char => ({ char, queryable: /\p{Script=Han}/u.test(char) }))
}

async function request(url) {
  let lastError
  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if ((response.status === 408 || response.status === 429 || response.status >= 500) && attempt < REQUEST_RETRIES) {
        await wait(500 * (attempt + 1))
        continue
      }
      const data = await response.json().catch(() => null)
      if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.message || `HTTP ${response.status}`)
      return data
    } catch (requestError) {
      clearTimeout(timeoutId)
      lastError = requestError
      if (attempt < REQUEST_RETRIES) {
        await wait(500 * (attempt + 1))
        continue
      }
    }
  }
  throw lastError
}

function updateStreak() {
  const lastDate = localStorage.getItem('poetry-daily-last-date')
  let count = Number.parseInt(localStorage.getItem('poetry-daily-streak') || '0', 10)
  if (lastDate !== todayKey) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    count = lastDate === dateKey(yesterday) ? count + 1 : 1
    localStorage.setItem('poetry-daily-last-date', todayKey)
    localStorage.setItem('poetry-daily-streak', String(count))
  }
  streak.value = Math.max(count, 1)
}

async function selectDate(day) {
  if (day.blank || day.future) return
  selectedKey.value = day.key
  if (day.key === todayKey) return ensureToday()
  const id = Number.parseInt(localStorage.getItem(storageKey(day.key)) || '', 10)
  if (id) await loadPoem(id, day.key)
  else {
    poem.value = null
    error.value = m.value.unread
    loading.value = false
  }
}

async function ensureToday() {
  const savedId = Number.parseInt(localStorage.getItem(storageKey(todayKey)) || '', 10)
  if (savedId) return loadPoem(savedId, todayKey)
  loading.value = true
  error.value = ''
  try {
    const data = await request(`/api/poems/random?lang=${poemLang.value}`)
    localStorage.setItem(storageKey(todayKey), String(data.data.id))
    setPoem(data.data, todayKey)
  } catch (requestError) {
    error.value = `${m.value.retry}：${requestError.message}`
  } finally {
    loading.value = false
  }
}

async function loadPoem(id, key = selectedKey.value) {
  loading.value = true
  error.value = ''
  try {
    const data = await request(`/api/poems/${id}?lang=${poemLang.value}`)
    setPoem(data.data, key)
  } catch (requestError) {
    poem.value = null
    error.value = `${m.value.retry}：${requestError.message}`
  } finally {
    loading.value = false
  }
}

function setPoem(nextPoem, key) {
  poem.value = nextPoem
  localStorage.setItem(readKey(key), '1')
  readVersion.value++
  updateStreak()
}

function changeMonth(step) {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + step, 1)
}
function returnToday() {
  viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedKey.value = todayKey
  ensureToday()
}
function queryCharacter(char) {
  if (dictionaryMode.value && /\p{Script=Han}/u.test(char)) {
    window.open(`https://www.zdic.net/hans/${encodeURIComponent(char)}`, '_blank', 'noopener,noreferrer')
  }
}

function toggleFavorite() {
  if (!poem.value) return
  const index = favoriteList.value.findIndex(item => item.id === poem.value.id)
  index >= 0 ? favoriteList.value.splice(index, 1) : favoriteList.value.unshift(poem.value)
  localStorage.setItem('poetry-favorites', JSON.stringify(favoriteList.value))
}

async function copyPoem() {
  if (!poem.value) return
  await navigator.clipboard.writeText(poemText.value)
  copied.value = true
  setTimeout(() => copied.value = false, 1500)
}

async function sharePoem() {
  if (!poem.value) return
  const data = { title: poem.value.title, text: poemText.value, url: `${location.origin}/?poem=${poem.value.id}` }
  if (navigator.share) {
    try { return await navigator.share(data) }
    catch (shareError) { if (shareError.name === 'AbortError') return }
  }
  await navigator.clipboard.writeText(`${data.text}\n\n${data.url}`)
  shared.value = true
  setTimeout(() => shared.value = false, 1600)
}

function searchTranslation() {
  if (!poem.value) return
  const suffix = uiLang.value === 'zh-Hant' ? '譯文 賞析' : '译文 赏析'
  window.open(`https://www.bing.com/search?q=${encodeURIComponent(`《${poem.value.title}》 ${poem.value.author?.name || ''} ${suffix}`)}`, '_blank', 'noopener,noreferrer')
}

async function enterFullscreen() {
  if (!poem.value) return
  fullscreenReading.value = true
  await nextTick()
  try { await readingOverlay.value?.requestFullscreen?.() } catch (_) {}
}
async function exitFullscreen() {
  if (document.fullscreenElement) {
    try { await document.exitFullscreen() } catch (_) {}
  }
  fullscreenReading.value = false
}
function handleFullscreenChange() {
  if (!document.fullscreenElement) fullscreenReading.value = false
}

async function generateCard() {
  if (!poem.value || generating.value) return
  generating.value = true
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    const width = 1000
    const height = Math.max(1300, 600 + poem.value.content.length * 62)
    canvas.width = width
    canvas.height = height
    context.fillStyle = '#f7f4ec'
    context.fillRect(0, 0, width, height)
    context.strokeStyle = 'rgba(168,62,50,.3)'
    context.strokeRect(55, 55, width - 110, height - 110)
    context.textAlign = 'center'
    context.fillStyle = '#20231f'
    context.font = '600 52px serif'
    context.fillText(poem.value.title, width / 2, 210)
    context.fillStyle = '#77786f'
    context.font = '26px serif'
    context.fillText(`${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}`, width / 2, 270)
    context.fillStyle = '#20231f'
    context.font = '34px serif'
    let y = 390
    poem.value.content.forEach(line => { context.fillText(line, width / 2, y); y += 62 })
    context.fillStyle = '#a83e32'
    context.fillRect(100, height - 180, 60, 60)
    context.fillStyle = 'white'
    context.font = '36px serif'
    context.fillText(poemLang.value === 'zh-Hant' ? '詩' : '诗', 130, height - 137)
    context.textAlign = 'left'
    context.fillStyle = '#77786f'
    context.font = '18px monospace'
    context.fillText(location.host, 180, height - 143)
    const link = document.createElement('a')
    link.href = canvas.toDataURL('image/png')
    link.download = `诗笺-${poem.value.title}.png`
    link.click()
  } finally {
    generating.value = false
  }
}

async function changeUiLanguage() {
  document.documentElement.lang = uiLang.value
  localStorage.setItem('poetry-ui-lang', uiLang.value)
  poemLang.value = uiLang.value
  localStorage.setItem('poetry-poem-lang', poemLang.value)
  if (poem.value) await loadPoem(poem.value.id)
}
async function setPoemLanguage(language) {
  if (poemLang.value === language) return
  poemLang.value = language
  localStorage.setItem('poetry-poem-lang', language)
  if (poem.value) await loadPoem(poem.value.id)
}
function scrollToSection(selector) {
  gameSheetOpen.value = false
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  document.documentElement.lang = uiLang.value
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  updateStreak()
  ensureToday()
  if (location.hash) setTimeout(() => scrollToSection(location.hash), 180)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <div class="app-shell yaji-shell" :lang="uiLang">
    <header class="nav wrap">
      <a class="brand" href="/">
        <span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span>
        <span><b>{{ m.brand }}</b><small>{{ m.page }}</small></span>
      </a>
      <nav class="yaji-desktop-nav">
        <a href="/">{{ m.back }}</a>
        <a href="#daily" class="active" @click.prevent="scrollToSection('#daily')">{{ m.daily }}</a>
        <a href="#games" @click.prevent="scrollToSection('#games')">{{ m.games }}</a>
      </nav>
      <div class="nav-actions">
        <div class="language-picker" :title="m.languageTitle">
          <Languages :size="17" />
          <select v-model="uiLang" @change="changeUiLanguage" :aria-label="m.languageAria">
            <option value="zh-Hans">简体中文</option>
            <option value="zh-Hant">繁體中文</option>
          </select>
          <ChevronDown :size="13" />
        </div>
        <SiteDirectory :messages="m" />
      </div>
    </header>

    <main>
      <section class="yaji-hero wrap">
        <p class="eyebrow"><span></span>{{ m.slogan }}</p>
        <h1>{{ m.daily }}</h1>
        <p>{{ m.dailyDesc }}</p>
      </section>

      <section id="daily" class="daily-section wrap">
        <aside class="daily-calendar">
          <div class="calendar-head">
            <button @click="changeMonth(-1)"><ChevronLeft :size="16" /></button>
            <b>{{ monthTitle }}</b>
            <button
              @click="changeMonth(1)"
              :disabled="viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() >= today.getMonth()"
            ><ChevronRight :size="16" /></button>
          </div>
          <div class="calendar-week">
            <span v-for="day in ['日','一','二','三','四','五','六']" :key="day">{{ day }}</span>
          </div>
          <div class="calendar-days">
            <template v-for="day in calendarDays" :key="day.key">
              <span v-if="day.blank"></span>
              <button
                v-else
                :class="['calendar-day', { today: day.today, selected: day.selected, read: day.read }]"
                :disabled="day.future"
                @click="selectDate(day)"
              >{{ day.number }}</button>
            </template>
          </div>
          <button class="return-today" @click="returnToday">{{ m.today }}</button>
          <p class="reading-streak">{{ m.streak.replace('{count}', streak) }}</p>
        </aside>

        <div class="poem-stage yaji-poem-stage">
          <span class="sun"></span>
          <span class="mountain m1"></span>
          <span class="mountain m2"></span>
          <div class="poem-column">
            <article class="poem-card" :lang="poemLang">
              <div v-if="loading" class="state"><RotateCw class="spin" :size="28" /><span>{{ m.loading }}</span></div>
              <div v-else-if="error || !poem" class="state">
                <span>{{ error || m.unread }}</span>
                <button v-if="selectedKey === todayKey" @click="ensureToday">{{ m.retry }}</button>
              </div>
              <template v-else>
                <div class="card-top">
                  <span>{{ poem.type?.name || m.poetry }}</span>
                  <button @click="toggleFavorite" :class="{ liked: isFavorite }">
                    <Heart :size="19" :fill="isFavorite ? 'currentColor' : 'none'" />
                  </button>
                </div>
                <div class="poem-body">
                  <h2>{{ poem.title }}</h2>
                  <p class="byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || m.anonymous }}</p>
                  <div :class="['verses', { dictionary: dictionaryMode }]">
                    <p v-for="(line, index) in poem.content" :key="index">
                      <template v-for="(part, partIndex) in poemCharacters(line)" :key="partIndex">
                        <button
                          v-if="part.queryable"
                          type="button"
                          class="query-char"
                          :disabled="!dictionaryMode"
                          :title="dictionaryMode ? `${m.queryCharacter}：${part.char}` : ''"
                          @click="queryCharacter(part.char)"
                        >{{ part.char }}</button>
                        <span v-else>{{ part.char }}</span>
                      </template>
                    </p>
                  </div>
                </div>
                <p v-if="poemLang === 'zh-Hans'" class="script-note"><Info :size="14" /> {{ m.scriptNote }}</p>
                <div class="card-bottom">
                  <span>{{ selectedKey }} · #{{ poem.id }}</span>
                  <div class="card-actions">
                    <button @click="generateCard" :disabled="generating"><RotateCw v-if="generating" class="spin" :size="16" /><ImageDown v-else :size="16" /> {{ generating ? m.generating : m.generate }}</button>
                    <button @click="searchTranslation"><ExternalLink :size="16" /> {{ m.translation }}</button>
                    <button @click="sharePoem"><Check v-if="shared" :size="16" /><Share2 v-else :size="16" /> {{ shared ? m.copiedShare : m.share }}</button>
                    <button @click="copyPoem"><Check v-if="copied" :size="16" /><Copy v-else :size="16" /> {{ copied ? m.copied : m.copy }}</button>
                  </div>
                </div>
              </template>
            </article>

            <div v-if="poem" class="poem-controls yaji-poem-controls">
              <a class="open-main-button" :href="`/?poem=${poem.id}`"><BookOpen :size="15" /> {{ m.openMain }}</a>
              <div class="poem-language" role="group" :aria-label="m.poemScript">
                <button :class="['dictionary-button', { active: dictionaryMode }]" @click="dictionaryMode = !dictionaryMode"><Search :size="15" /> {{ m.dictionary }}</button>
                <button class="fullscreen-button" @click="enterFullscreen"><Maximize2 :size="15" /> {{ m.fullscreen }}</button>
                <span>{{ m.poemScript }}</span>
                <button :class="{ active: poemLang === 'zh-Hans' }" @click="setPoemLanguage('zh-Hans')">{{ m.simplified }}</button>
                <button :class="{ active: poemLang === 'zh-Hant' }" @click="setPoemLanguage('zh-Hant')">{{ m.traditional }}</button>
              </div>
            </div>
            <p v-if="dictionaryMode" class="dictionary-hint"><Search :size="13" /> {{ m.dictionaryHint }}</p>
          </div>
        </div>
      </section>

      <section id="games" class="yaji-games">
        <div class="wrap narrow">
          <p class="section-kicker"><Gamepad2 :size="16" /> {{ m.games }}</p>
          <h2>{{ m.games }}</h2>
          <p>{{ m.gamesLead }}</p>
          <div class="yaji-game-grid">
            <article><Gamepad2 :size="24" /><h3>{{ m.solitaire }}</h3><p>{{ m.solitaireDesc }}</p><span>{{ m.preparing }}</span></article>
            <article><CircleHelp :size="24" /><h3>{{ m.riddle }}</h3><p>{{ m.riddleDesc }}</p><span>{{ m.preparing }}</span></article>
            <article><BookOpen :size="24" /><h3>{{ m.fill }}</h3><p>{{ m.fillDesc }}</p><span>{{ m.preparing }}</span></article>
          </div>
        </div>
      </section>
    </main>

    <div v-if="fullscreenReading && poem" ref="readingOverlay" class="reading-overlay" :lang="poemLang">
      <div class="reading-tools">
        <button :class="{ active: dictionaryMode }" @click="dictionaryMode = !dictionaryMode"><Search :size="18" /> {{ m.dictionary }}</button>
        <button class="reading-close" @click="exitFullscreen"><Minimize2 :size="19" /> {{ m.exitFullscreen }}</button>
      </div>
      <div class="reading-paper">
        <span class="reading-kicker">{{ m.immersiveReading }}</span>
        <h2>{{ poem.title }}</h2>
        <p class="reading-byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || m.anonymous }}</p>
        <div :class="['reading-verses', { dictionary: dictionaryMode }]">
          <p v-for="(line, index) in poem.content" :key="index">
            <template v-for="(part, partIndex) in poemCharacters(line)" :key="partIndex">
              <button v-if="part.queryable" type="button" class="query-char" :disabled="!dictionaryMode" @click="queryCharacter(part.char)">{{ part.char }}</button>
              <span v-else>{{ part.char }}</span>
            </template>
          </p>
        </div>
        <div class="reading-footer">
          <span class="reading-number">{{ selectedKey }} · #{{ poem.id }}</span>
          <div class="reading-signature">
            <span class="reading-seal">{{ poemLang === 'zh-Hant' ? '詩' : '诗' }}</span>
            <span><b>{{ m.brand }}</b><small>{{ siteHost }}</small></span>
          </div>
        </div>
      </div>
    </div>

    <nav class="mobile-bottom-nav yaji-bottom-nav" :aria-label="m.games">
      <button @click="scrollToSection('#daily')"><CalendarDays :size="20" /><span>{{ m.navDaily }}</span></button>
      <a href="/"><Home :size="20" /><span>{{ m.navHome }}</span></a>
      <button :class="{ active: gameSheetOpen }" @click="gameSheetOpen = true"><Gamepad2 :size="20" /><span>{{ m.navGames }}</span></button>
    </nav>

    <div v-if="gameSheetOpen" class="mobile-menu-backdrop" @click="gameSheetOpen = false"></div>
    <aside :class="['mobile-sea-sheet','yaji-game-sheet',{open:gameSheetOpen}]" :aria-hidden="!gameSheetOpen">
      <div class="mobile-sheet-handle"></div>
      <div class="mobile-sheet-head"><div><small>{{ m.page }}</small><h3>{{ m.games }}</h3></div><button @click="gameSheetOpen = false" :aria-label="m.closeMenu"><X :size="20"/></button></div>
      <button @click="scrollToSection('#games')"><CircleHelp :size="21"/><span><b>{{ m.riddle }}</b><small>{{ m.riddleDesc }}</small></span><i>{{ m.preparing }}</i></button>
      <button @click="scrollToSection('#games')"><Gamepad2 :size="21"/><span><b>{{ m.solitaire }}</b><small>{{ m.solitaireDesc }}</small></span><i>{{ m.preparing }}</i></button>
      <button @click="scrollToSection('#games')"><BookOpen :size="21"/><span><b>{{ m.fill }}</b><small>{{ m.fillDesc }}</small></span><i>{{ m.preparing }}</i></button>
    </aside>

    <SiteFooter :messages="m" :ui-lang="uiLang" />
  </div>
</template>
