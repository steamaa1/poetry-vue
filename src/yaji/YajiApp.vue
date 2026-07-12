<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { BookOpen, CalendarDays, Check, ChevronLeft, ChevronRight, CircleHelp, Copy, ExternalLink, Gamepad2, Github, Heart, Home, ImageDown, Languages, Maximize2, Menu, Minimize2, RotateCw, Search, Share2, X } from 'lucide-vue-next'
import zhHant from './locales/zh-Hant.js'

const zhHans = {
  brand: '诗笺', page: '诗趣雅集', slogan: '日课一诗，闲时雅戏', back: '诗笺随阅',
  daily: '每日一诗', dailyDesc: '一日一诗，与古人如期相逢', today: '返回今日',
  streak: '已连续读诗 {count} 天', unread: '当日未留诗笺', loading: '正在送来今日诗笺…', retry: '再试一次', anonymous: '佚名',
  dictionary: '查字模式', fullscreen: '全屏阅读', exitFullscreen: '退出全屏', generate: '生成卡片', translation: '查询译文', share: '分享诗词', copy: '抄录全诗', copied: '已抄录', openMain: '前往完整诗笺', simplified: '简体', traditional: '繁體',
  games: '诗词雅戏', gamesLead: '以诗为戏，在字句之间温故知新。', solitaire: '联句续章', solitaireDesc: '承前句余韵，续写下一章', riddle: '诗谜寻踪', riddleDesc: '隐去诗题或诗人，循字句猜其来处', fill: '补阙成章', fillDesc: '补全缺落字句，使诗章复原', preparing: '筹备中',
  menu: '雅集目录', source: '项目源码', status: 'API 状态', navHome: '随阅', navDaily: '日课', navGames: '雅戏', navMenu: '目录'
}

const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language || '']
const detectedLang = browserLanguages.some(lang => /^(zh-Hant|zh-TW|zh-HK|zh-MO)(-|$)/i.test(lang)) ? 'zh-Hant' : 'zh-Hans'
const savedUiLang = localStorage.getItem('poetry-ui-lang')
const savedPoemLang = localStorage.getItem('poetry-poem-lang')
const uiLang = ref(['zh-Hans', 'zh-Hant'].includes(savedUiLang) ? savedUiLang : detectedLang)
const poemLang = ref(['zh-Hans', 'zh-Hant'].includes(savedPoemLang) ? savedPoemLang : uiLang.value)
const m = computed(() => uiLang.value === 'zh-Hant' ? { ...zhHans, ...zhHant } : zhHans)

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
const generating = ref(false)
const menuOpen = ref(false)
const streak = ref(1)
const favoriteList = ref(JSON.parse(localStorage.getItem('poetry-favorites') || '[]'))
const readVersion = ref(0)
const overlay = ref(null)

const monthTitle = computed(() => new Intl.DateTimeFormat(uiLang.value === 'zh-Hant' ? 'zh-TW' : 'zh-CN', { year: 'numeric', month: 'long' }).format(viewDate.value))
const calendarDays = computed(() => {
  readVersion.value
  const year = viewDate.value.getFullYear()
  const month = viewDate.value.getMonth()
  const blanks = Array.from({ length: new Date(year, month, 1).getDay() }, (_, index) => ({ blank: true, key: `blank-${index}` }))
  const count = new Date(year, month + 1, 0).getDate()
  const days = Array.from({ length: count }, (_, index) => {
    const date = new Date(year, month, index + 1)
    const key = dateKey(date)
    return { blank: false, key, number: index + 1, today: key === todayKey, selected: key === selectedKey.value, read: Boolean(localStorage.getItem(readKey(key))), future: date > today }
  })
  return [...blanks, ...days]
})
const isFavorite = computed(() => poem.value && favoriteList.value.some(item => item.id === poem.value.id))
const poemText = computed(() => poem.value ? `${poem.value.title}\n${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}\n\n${poem.value.content.join('\n')}` : '')

const REQUEST_TIMEOUT = 10000
const REQUEST_RETRIES = 2
const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

function dateKey(date) { return date.toLocaleDateString('sv-SE') }
function storageKey(key) { return `poetry-daily-id-${key}` }
function readKey(key) { return `poetry-daily-read-${key}` }
function poemCharacters(line) { return Array.from(String(line || '')).map(char => ({ char, queryable: /\p{Script=Han}/u.test(char) })) }

async function request(url) {
  let lastError
  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    try {
      const response = await fetch(url, { signal: controller.signal })
      clearTimeout(timeoutId)
      if ((response.status === 408 || response.status === 429 || response.status >= 500) && attempt < REQUEST_RETRIES) {
        await wait(500 * (attempt + 1)); continue
      }
      const data = await response.json().catch(() => null)
      if (!response.ok || data?.error) throw new Error(data?.error?.message || data?.message || `HTTP ${response.status}`)
      return data
    } catch (requestError) {
      clearTimeout(timeoutId); lastError = requestError
      if (attempt < REQUEST_RETRIES) { await wait(500 * (attempt + 1)); continue }
    }
  }
  throw lastError
}

function updateStreak() {
  const lastDate = localStorage.getItem('poetry-daily-last-date')
  let count = Number.parseInt(localStorage.getItem('poetry-daily-streak') || '0', 10)
  if (lastDate !== todayKey) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
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
  else { poem.value = null; error.value = m.value.unread; loading.value = false }
}

async function ensureToday() {
  const savedId = Number.parseInt(localStorage.getItem(storageKey(todayKey)) || '', 10)
  if (savedId) return loadPoem(savedId, todayKey)
  loading.value = true; error.value = ''
  try {
    const data = await request(`/api/poems/random?lang=${poemLang.value}`)
    localStorage.setItem(storageKey(todayKey), String(data.data.id))
    setPoem(data.data, todayKey)
  } catch (requestError) { error.value = `${m.value.retry}：${requestError.message}` }
  finally { loading.value = false }
}

async function loadPoem(id, key = selectedKey.value) {
  loading.value = true; error.value = ''
  try { const data = await request(`/api/poems/${id}?lang=${poemLang.value}`); setPoem(data.data, key) }
  catch (requestError) { poem.value = null; error.value = `${m.value.retry}：${requestError.message}` }
  finally { loading.value = false }
}

function setPoem(nextPoem, key) {
  poem.value = nextPoem
  localStorage.setItem(readKey(key), '1')
  readVersion.value++
  updateStreak()
}

function changeMonth(step) { viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + step, 1) }
function returnToday() { viewDate.value = new Date(today.getFullYear(), today.getMonth(), 1); selectedKey.value = todayKey; ensureToday() }
function queryCharacter(char) { if (dictionaryMode.value && /\p{Script=Han}/u.test(char)) window.open(`https://www.zdic.net/hans/${encodeURIComponent(char)}`, '_blank', 'noopener') }

function toggleFavorite() {
  if (!poem.value) return
  const index = favoriteList.value.findIndex(item => item.id === poem.value.id)
  index >= 0 ? favoriteList.value.splice(index, 1) : favoriteList.value.unshift(poem.value)
  localStorage.setItem('poetry-favorites', JSON.stringify(favoriteList.value))
}

async function copyPoem() { if (!poem.value) return; await navigator.clipboard.writeText(poemText.value); copied.value = true; setTimeout(() => copied.value = false, 1500) }
async function sharePoem() {
  if (!poem.value) return
  const data = { title: poem.value.title, text: poemText.value, url: `${location.origin}/?poem=${poem.value.id}` }
  if (navigator.share) try { return await navigator.share(data) } catch (shareError) { if (shareError.name === 'AbortError') return }
  await navigator.clipboard.writeText(`${data.text}\n\n${data.url}`)
}
function searchTranslation() { if (poem.value) window.open(`https://www.bing.com/search?q=${encodeURIComponent(`《${poem.value.title}》 ${poem.value.author?.name || ''} ${uiLang.value === 'zh-Hant' ? '譯文 賞析' : '译文 赏析'}`)}`, '_blank', 'noopener') }

async function enterFullscreen() { if (!poem.value) return; fullscreenReading.value = true; await nextTick(); try { await overlay.value?.requestFullscreen?.() } catch (_) {} }
async function exitFullscreen() { if (document.fullscreenElement) try { await document.exitFullscreen() } catch (_) {}; fullscreenReading.value = false }

async function generateCard() {
  if (!poem.value || generating.value) return
  generating.value = true
  try {
    const canvas = document.createElement('canvas'), context = canvas.getContext('2d'), width = 1000, height = Math.max(1300, 600 + poem.value.content.length * 62)
    canvas.width = width; canvas.height = height; context.fillStyle = '#f7f4ec'; context.fillRect(0, 0, width, height); context.strokeStyle = 'rgba(168,62,50,.3)'; context.strokeRect(55, 55, width - 110, height - 110)
    context.textAlign = 'center'; context.fillStyle = '#20231f'; context.font = '600 52px serif'; context.fillText(poem.value.title, width / 2, 210); context.fillStyle = '#77786f'; context.font = '26px serif'; context.fillText(`${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}`, width / 2, 270)
    context.fillStyle = '#20231f'; context.font = '34px serif'; let y = 390; poem.value.content.forEach(line => { context.fillText(line, width / 2, y); y += 62 })
    context.fillStyle = '#a83e32'; context.fillRect(100, height - 180, 60, 60); context.fillStyle = 'white'; context.font = '36px serif'; context.fillText(poemLang.value === 'zh-Hant' ? '詩' : '诗', 130, height - 137); context.textAlign = 'left'; context.fillStyle = '#77786f'; context.font = '18px monospace'; context.fillText(location.host, 180, height - 143)
    const link = document.createElement('a'); link.href = canvas.toDataURL('image/png'); link.download = `诗笺-${poem.value.title}.png`; link.click()
  } finally { generating.value = false }
}

async function changeUiLanguage() { document.documentElement.lang = uiLang.value; localStorage.setItem('poetry-ui-lang', uiLang.value); poemLang.value = uiLang.value; localStorage.setItem('poetry-poem-lang', poemLang.value); document.documentElement.lang = uiLang.value; if (poem.value) await loadPoem(poem.value.id) }
async function changePoemLanguage() { localStorage.setItem('poetry-poem-lang', poemLang.value); if (poem.value) await loadPoem(poem.value.id) }
function scrollTo(selector) { menuOpen.value = false; document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

onMounted(() => {
  document.documentElement.lang = uiLang.value
  document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement) fullscreenReading.value = false })
  updateStreak(); ensureToday()
  if (location.hash) setTimeout(() => scrollTo(location.hash), 180)
})
</script>

<template>
  <div class="yaji-shell" :lang="uiLang">
    <header class="nav wrap">
      <a class="brand" href="/"><span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span><span><b>{{ m.brand }}</b><small>{{ m.page }}</small></span></a>
      <div class="actions"><label><Languages :size="16"/><select v-model="uiLang" @change="changeUiLanguage"><option value="zh-Hans">简体中文</option><option value="zh-Hant">繁體中文</option></select></label><a href="/">{{ m.back }}</a><button @click="menuOpen = !menuOpen"><Menu :size="19"/></button></div>
      <div v-if="menuOpen" class="menu-panel"><a href="/">{{ m.back }}</a><button @click="scrollTo('#daily')">{{ m.daily }}</button><button @click="scrollTo('#games')">{{ m.games }}</button><a href="/status.html">{{ m.status }}</a><a href="https://github.com/steamaa1/chinese-poetry-vue" target="_blank"><Github :size="15"/> {{ m.source }}</a></div>
    </header>

    <main>
      <section class="hero wrap"><span>{{ m.slogan }}</span><h1>{{ m.daily }}</h1><p>{{ m.dailyDesc }}</p></section>
      <section id="daily" class="daily-layout wrap">
        <aside class="calendar">
          <div class="calendar-head">
            <button @click="changeMonth(-1)"><ChevronLeft :size="16" /></button>
            <b>{{ monthTitle }}</b>
            <button
              @click="changeMonth(1)"
              :disabled="viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() >= today.getMonth()"
            ><ChevronRight :size="16" /></button>
          </div>
          <div class="week">
            <span v-for="day in ['日','一','二','三','四','五','六']" :key="day">{{ day }}</span>
          </div>
          <div class="days">
            <template v-for="day in calendarDays" :key="day.key">
              <span v-if="day.blank"></span>
              <button
                v-else
                :class="['day', { today: day.today, selected: day.selected, read: day.read }]"
                :disabled="day.future"
                @click="selectDate(day)"
              >{{ day.number }}</button>
            </template>
          </div>
          <div class="calendar-foot">
            <button @click="returnToday">{{ m.today }}</button>
            <div class="streak">{{ m.streak.replace('{count}', streak) }}</div>
          </div>
        </aside>

        <div class="daily-stage">
          <span class="daily-sun"></span>
          <span class="daily-mountain"></span>
          <article class="poem-card">
            <div v-if="loading" class="state">
              <RotateCw class="spin" :size="27" />
              <span>{{ m.loading }}</span>
            </div>
            <div v-else-if="error || !poem" class="state">
              <span>{{ error || m.unread }}</span>
              <button v-if="selectedKey === todayKey" @click="ensureToday">{{ m.retry }}</button>
            </div>
            <template v-else>
              <div class="card-top">
                <span class="type">{{ poem.type?.name }}</span>
                <button @click="toggleFavorite">
                  <Heart :size="21" :fill="isFavorite ? 'currentColor' : 'none'" />
                </button>
              </div>

              <div class="poem-body">
                <h2>{{ poem.title }}</h2>
                <p class="byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || m.anonymous }}</p>
                <div :class="['verses', { dictionary: dictionaryMode }]">
                  <p v-for="(line, index) in poem.content" :key="index">
                    <template v-for="(part, partIndex) in poemCharacters(line)" :key="partIndex">
                      <button v-if="part.queryable" class="query-char" @click="queryCharacter(part.char)">{{ part.char }}</button>
                      <span v-else>{{ part.char }}</span>
                    </template>
                  </p>
                </div>
              </div>

              <div class="tools">
                <button :class="{ active: dictionaryMode }" @click="dictionaryMode = !dictionaryMode"><Search :size="14" /> {{ m.dictionary }}</button>
                <button @click="enterFullscreen"><Maximize2 :size="14" /> {{ m.fullscreen }}</button>
                <button @click="generateCard" :disabled="generating"><ImageDown :size="14" /> {{ m.generate }}</button>
                <button @click="searchTranslation"><ExternalLink :size="14" /> {{ m.translation }}</button>
                <button @click="sharePoem"><Share2 :size="14" /> {{ m.share }}</button>
                <button @click="copyPoem"><Check v-if="copied" :size="14" /><Copy v-else :size="14" /> {{ copied ? m.copied : m.copy }}</button>
                <a :href="`/?poem=${poem.id}`"><BookOpen :size="14" /> {{ m.openMain }}</a>
                <select v-model="poemLang" @change="changePoemLanguage">
                  <option value="zh-Hans">{{ m.simplified }}</option>
                  <option value="zh-Hant">{{ m.traditional }}</option>
                </select>
              </div>

              <div class="card-bottom">
                <span>{{ selectedKey }}</span>
                <div class="card-signature">
                  <span class="mini-seal">{{ poemLang === 'zh-Hant' ? '詩' : '诗' }}</span>
                  <span><b>{{ m.brand }}</b><small>#{{ poem.id }}</small></span>
                </div>
              </div>
            </template>
          </article>
        </div>
      </section>

      <section id="games" class="games">
        <div class="wrap">
          <div class="games-head"><span>{{ m.games }}</span><h2>{{ m.games }}</h2><p>{{ m.gamesLead }}</p></div>
          <div class="game-grid">
            <article class="game"><Gamepad2 :size="24" /><h3>{{ m.solitaire }}</h3><p>{{ m.solitaireDesc }}</p><span>{{ m.preparing }}</span></article>
            <article class="game"><CircleHelp :size="24" /><h3>{{ m.riddle }}</h3><p>{{ m.riddleDesc }}</p><span>{{ m.preparing }}</span></article>
            <article class="game"><BookOpen :size="24" /><h3>{{ m.fill }}</h3><p>{{ m.fillDesc }}</p><span>{{ m.preparing }}</span></article>
          </div>
        </div>
      </section>

    </main>

    <nav class="bottom"><a href="/"><Home :size="19"/><span>{{ m.navHome }}</span></a><button @click="scrollTo('#daily')"><CalendarDays :size="19"/><span>{{ m.navDaily }}</span></button><button @click="scrollTo('#games')"><Gamepad2 :size="19"/><span>{{ m.navGames }}</span></button><button @click="menuOpen = !menuOpen"><Menu :size="19"/><span>{{ m.navMenu }}</span></button></nav>

    <div v-if="fullscreenReading && poem" ref="overlay" class="overlay"><button class="close" @click="exitFullscreen"><Minimize2 :size="17"/> {{ m.exitFullscreen }}</button><div class="overlay-paper"><h2>{{ poem.title }}</h2><p class="byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || m.anonymous }}</p><div :class="['verses',{dictionary:dictionaryMode}]"><p v-for="(line,index) in poem.content" :key="index"><template v-for="(part,partIndex) in poemCharacters(line)" :key="partIndex"><button v-if="part.queryable" class="query-char" @click="queryCharacter(part.char)">{{ part.char }}</button><span v-else>{{ part.char }}</span></template></p></div></div></div>
  </div>
</template>
