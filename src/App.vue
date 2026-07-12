<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Search, Shuffle, Heart, Copy, Check, Share2, Github, Languages, ChevronDown,
  ChevronLeft, ChevronRight, X, BookOpen, Sparkles, RotateCw, Info
} from 'lucide-vue-next'

const API = ''
const poem = ref(null)
const poemStage = ref(null)
const loading = ref(true)
const error = ref('')
const query = ref('')
const searchType = ref('all')
const results = ref([])
const searched = ref(false)
const searching = ref(false)
const searchMessage = ref('')
const savedUiLang = localStorage.getItem('poetry-ui-lang')
const savedPoemLang = localStorage.getItem('poetry-poem-lang')
const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language || '']
const prefersTraditional = browserLanguages.some(language =>
  /^(zh-Hant|zh-TW|zh-HK|zh-MO)(-|$)/i.test(language)
)
const detectedUiLang = prefersTraditional ? 'zh-Hant' : 'zh-Hans'
const uiLang = ref(['zh-Hans', 'zh-Hant'].includes(savedUiLang) ? savedUiLang : detectedUiLang)
const poemLang = ref(['zh-Hans', 'zh-Hant'].includes(savedPoemLang) ? savedPoemLang : uiLang.value)
const dynasty = ref('')
const type = ref('')
const dynasties = ref([])
const types = ref([])
const copied = ref(false)
const shared = ref(false)
const favorites = ref(JSON.parse(localStorage.getItem('poetry-favorites') || '[]'))
const poemHistory = ref([])
const historyIndex = ref(-1)

const messages = {
  'zh-Hans': {
    brand: '诗笺', slogan: '一卷诗心，半生清欢', today: '今日一诗', explore: '寻诗', favorite: '收藏',
    meet: '每日，与古人相逢', hero1: '读一首诗，', hero2: '见一方天地。',
    intro1: '从近四十万首古典诗词中，撷取一瞬风月。', intro2: '愿字句越过千年，恰好落在你的心上。',
    dynasty: '朝代', allDynasties: '不限朝代', genre: '体裁', allGenres: '不限体裁', random: '随缘一首',
    finding: '正在山水间寻诗…', retry: '再试一次', poetry: '古诗词', anonymous: '佚名', sheet: '号诗笺',
    copied: '已抄录', copy: '抄录全诗', share: '分享诗词', shared: '已复制分享内容', previous: '上一首', next: '下一首', poemScript: '诗笺文字',
    scriptNote: '简繁转换或因合并字与古籍原文有异，建议对照阅读。',
    searchKicker: '寻章摘句', searchTitle: '心有所念，诗有所应',
    searchDesc: '输入至少三个字的诗句、标题或作者信息，去浩瀚诗海里寻觅。',
    placeholder: '试试「明月光」「春风里」或「李太白」…', all: '全文', title: '标题', content: '正文', author: '作者',
    search: '寻诗', suggestions: '不知寻什么？', searching: '正在翻阅诗卷…', searchHint: '寻诗提示', found: '寻得', articles: '篇',
    collapse: '收起', openSheet: '展开诗笺 →', noResult: '没有寻到相关诗句，换个关键词试试吧。',
    enterSearch: '请输入搜索内容。', minSearch: '诗泉搜索接口要求至少 3 个字，请输入更完整的诗句、标题或作者信息。',
    searchUnavailable: '搜索暂时不可用，请稍后重试。', favoritesKicker: '私藏诗笺', favoritesTitle: '曾与你相逢的诗',
    dataFrom: '数据由「诗泉」API 提供 · 字句有尽，诗意无穷', myProject: '我的项目', apiLink: '诗泉 API ↗',
    languageTitle: '切换整个网页语言', languageAria: '选择网页语言', loadFailed: '诗意暂时走远了，请稍后重试。',
    switchFailed: '文字切换失败，请稍后重试。', neighborFailed: '暂时无法返回这首诗笺。'
  },
  'zh-Hant': {
    brand: '詩箋', slogan: '一卷詩心，半生清歡', today: '今日一詩', explore: '尋詩', favorite: '收藏',
    meet: '每日，與古人相逢', hero1: '讀一首詩，', hero2: '見一方天地。',
    intro1: '從近四十萬首古典詩詞中，擷取一瞬風月。', intro2: '願字句越過千年，恰好落在你的心上。',
    dynasty: '朝代', allDynasties: '不限朝代', genre: '體裁', allGenres: '不限體裁', random: '隨緣一首',
    finding: '正在山水間尋詩…', retry: '再試一次', poetry: '古詩詞', anonymous: '佚名', sheet: '號詩箋',
    copied: '已抄錄', copy: '抄錄全詩', share: '分享詩詞', shared: '已複製分享內容', previous: '上一首', next: '下一首', poemScript: '詩箋文字',
    scriptNote: '簡繁轉換或因合併字與古籍原文有異，建議對照閱讀。',
    searchKicker: '尋章摘句', searchTitle: '心有所念，詩有所應',
    searchDesc: '輸入至少三個字的詩句、標題或作者資訊，去浩瀚詩海裡尋覓。',
    placeholder: '試試「明月光」「春風裡」或「李太白」…', all: '全文', title: '標題', content: '正文', author: '作者',
    search: '尋詩', suggestions: '不知尋什麼？', searching: '正在翻閱詩卷…', searchHint: '尋詩提示', found: '尋得', articles: '篇',
    collapse: '收起', openSheet: '展開詩箋 →', noResult: '沒有尋到相關詩句，換個關鍵詞試試吧。',
    enterSearch: '請輸入搜索內容。', minSearch: '詩泉搜索接口要求至少 3 個字，請輸入更完整的詩句、標題或作者資訊。',
    searchUnavailable: '搜索暫時不可用，請稍後重試。', favoritesKicker: '私藏詩箋', favoritesTitle: '曾與你相逢的詩',
    dataFrom: '資料由「詩泉」API 提供 · 字句有盡，詩意無窮', myProject: '我的項目', apiLink: '詩泉 API ↗',
    languageTitle: '切換整個網頁語言', languageAria: '選擇網頁語言', loadFailed: '詩意暫時走遠了，請稍後重試。',
    switchFailed: '文字切換失敗，請稍後重試。', neighborFailed: '暫時無法返回這首詩箋。'
  }
}

const m = computed(() => messages[uiLang.value])
const isFavorite = computed(() => poem.value && favorites.value.some(p => p.id === poem.value.id))
const canGoPrevious = computed(() => historyIndex.value > 0)
const canGoNext = computed(() => historyIndex.value >= 0 && historyIndex.value < poemHistory.value.length - 1)
const poemText = computed(() => poem.value ? `${poem.value.title}\n${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}\n\n${poem.value.content.join('\n')}` : '')
const searchHeading = computed(() => {
  if (searching.value) return m.value.searching
  if (searchMessage.value && !results.value.length) return m.value.searchHint
  return `${m.value.found} ${results.value.length} ${m.value.articles}`
})
const quickWords = computed(() => uiLang.value === 'zh-Hant'
  ? ['明月光', '思故鄉', '春風裡', '長安城', '李太白']
  : ['明月光', '思故乡', '春风里', '长安城', '李太白'])

async function getJSON(path, requestLang = poemLang.value) {
  const joiner = path.includes('?') ? '&' : '?'
  const res = await fetch(`${API}${path}${joiner}lang=${requestLang}`)
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.error) {
    const apiMessage = data?.error?.message
    throw new Error(apiMessage || `请求失败（${res.status}）`)
  }
  return data
}

function recordPoem(nextPoem) {
  if (!nextPoem?.id) return
  const currentId = poemHistory.value[historyIndex.value]
  poem.value = nextPoem
  if (currentId === nextPoem.id) return
  poemHistory.value = poemHistory.value.slice(0, historyIndex.value + 1)
  poemHistory.value.push(nextPoem.id)
  historyIndex.value = poemHistory.value.length - 1
}

async function randomPoem() {
  loading.value = true
  error.value = ''
  try {
    const p = new URLSearchParams()
    if (dynasty.value) p.set('dynasty', dynasty.value)
    if (type.value) p.set('type', type.value)
    const data = await getJSON(`/api/poems/random${p.size ? '?' + p : ''}`)
    recordPoem(data.data)
  } catch (e) {
    error.value = e.message || m.value.loadFailed
  } finally {
    loading.value = false
  }
}

async function loadPoemById(id) {
  const data = await getJSON(`/api/poems/${id}`)
  poem.value = data.data
}

async function moveHistory(step) {
  const targetIndex = historyIndex.value + step
  if (loading.value || targetIndex < 0 || targetIndex >= poemHistory.value.length) return

  loading.value = true
  error.value = ''
  try {
    const targetId = poemHistory.value[targetIndex]
    await loadPoemById(targetId)
    historyIndex.value = targetIndex
  } catch (_) {
    error.value = m.value.neighborFailed
  } finally {
    loading.value = false
  }
}
async function searchPoems() {
  const keyword = query.value.trim()
  searched.value = true
  results.value = []
  searchMessage.value = ''
  if (!keyword) { searchMessage.value = m.value.enterSearch; return }
  if ([...keyword].length < 3) { searchMessage.value = m.value.minSearch; return }

  searching.value = true
  try {
    const p = new URLSearchParams({ q: keyword, type: searchType.value })
    const data = await getJSON(`/api/search?${p}`)
    results.value = Array.isArray(data?.data) ? data.data : []
    if (!results.value.length) searchMessage.value = m.value.noResult
  } catch (_) {
    searchMessage.value = m.value.searchUnavailable
  } finally {
    searching.value = false
  }
}

async function showPoem(p) {
  recordPoem(p)
  searched.value = false
  await nextTick()
  poemStage.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function toggleFavorite() {
  if (!poem.value) return
  const i = favorites.value.findIndex(p => p.id === poem.value.id)
  i >= 0 ? favorites.value.splice(i, 1) : favorites.value.unshift(poem.value)
  localStorage.setItem('poetry-favorites', JSON.stringify(favorites.value))
}

async function copyPoem() {
  await navigator.clipboard.writeText(poemText.value)
  copied.value = true
  setTimeout(() => copied.value = false, 1600)
}

async function sharePoem() {
  if (!poem.value) return
  const shareData = {
    title: `${poem.value.title} · ${poem.value.author?.name || m.value.anonymous}`,
    text: poemText.value,
    url: window.location.href.split('#')[0]
  }

  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return
    } catch (error) {
      if (error?.name === 'AbortError') return
    }
  }

  await navigator.clipboard.writeText(`${shareData.text}

${shareData.url}`)
  shared.value = true
  setTimeout(() => shared.value = false, 1800)
}

async function setPoemLang(nextLang) {
  if (poemLang.value === nextLang || !poem.value?.id) return
  poemLang.value = nextLang
  localStorage.setItem('poetry-poem-lang', nextLang)
  loading.value = true
  error.value = ''
  try {
    await loadPoemById(poem.value.id)
    if (searched.value && query.value.trim().length >= 3) await searchPoems()
  } catch (_) {
    error.value = m.value.switchFailed
  } finally {
    loading.value = false
  }
}

async function changeUiLang() {
  document.documentElement.lang = uiLang.value
  localStorage.setItem('poetry-ui-lang', uiLang.value)
  poemLang.value = uiLang.value
  localStorage.setItem('poetry-poem-lang', poemLang.value)
  dynasty.value = ''
  type.value = ''
  searchMessage.value = ''
  loading.value = true
  error.value = ''
  try {
    await Promise.all([
      loadFilters(),
      poem.value?.id ? loadPoemById(poem.value.id) : randomPoem()
    ])
    if (searched.value && query.value.trim().length >= 3) await searchPoems()
  } catch (_) {
    error.value = m.value.switchFailed
  } finally {
    loading.value = false
  }
}

async function loadFilters() {
  try {
    const [d, t] = await Promise.all([getJSON('/api/dynasties'), getJSON('/api/types')])
    dynasties.value = d.data || []
    types.value = t.data || []
  } catch (_) {}
}

onMounted(() => {
  document.documentElement.lang = uiLang.value
  localStorage.setItem('poetry-ui-lang', uiLang.value)
  localStorage.setItem('poetry-poem-lang', poemLang.value)
  return Promise.all([randomPoem(), loadFilters()])
})
</script>

<template>
  <div class="app-shell" :lang="uiLang">
    <header class="nav wrap">
      <a class="brand" href="#" @click.prevent="randomPoem">
        <span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span>
        <span><b>{{ m.brand }}</b><small>{{ m.slogan }}</small></span>
      </a>
      <nav>
        <a class="active" href="#today">{{ m.today }}</a>
        <a href="#explore">{{ m.explore }}</a>
        <a href="#favorites">{{ m.favorite }} <i v-if="favorites.length">{{ favorites.length }}</i></a>
      </nav>
      <div class="nav-actions">
        <div class="language-picker" :title="m.languageTitle">
          <Languages :size="17" />
          <select v-model="uiLang" @change="changeUiLang" :aria-label="m.languageAria">
            <option value="zh-Hans">简体中文</option>
            <option value="zh-Hant">繁體中文</option>
          </select>
          <ChevronDown :size="13" />
        </div>
        <a class="icon-button" href="https://github.com/steamaa1/poetry-vue" target="_blank" rel="noopener" :title="m.myProject"><Github :size="19" /></a>
      </div>
    </header>

    <main>
      <section id="today" class="hero wrap">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> {{ m.meet }}</p>
          <h1>{{ m.hero1 }}<br><em>{{ m.hero2 }}</em></h1>
          <p class="intro">{{ m.intro1 }}<br>{{ m.intro2 }}</p>
          <div class="filters">
            <label>{{ m.dynasty }}<div class="select-wrap"><select v-model="dynasty"><option value="">{{ m.allDynasties }}</option><option v-for="d in dynasties" :key="d.id">{{ d.name }}</option></select><ChevronDown :size="15" /></div></label>
            <label>{{ m.genre }}<div class="select-wrap"><select v-model="type"><option value="">{{ m.allGenres }}</option><option v-for="t in types" :key="t.id">{{ t.name }}</option></select><ChevronDown :size="15" /></div></label>
            <button class="primary" @click="randomPoem"><Shuffle :size="17" /> {{ m.random }}</button>
          </div>
        </div>

        <div ref="poemStage" class="poem-stage">
          <span class="sun"></span><span class="mountain m1"></span><span class="mountain m2"></span>
          <div class="poem-column">
            <article class="poem-card" :lang="poemLang">
              <div v-if="loading" class="state"><RotateCw class="spin" :size="28"/><span>{{ m.finding }}</span></div>
              <div v-else-if="error && !poem" class="state"><span>{{ error }}</span><button @click="randomPoem">{{ m.retry }}</button></div>
              <template v-else-if="poem">
                <div class="card-top"><span>{{ poem.type?.name || m.poetry }}</span><button @click="toggleFavorite" :class="{liked:isFavorite}"><Heart :size="19" :fill="isFavorite ? 'currentColor' : 'none'"/></button></div>
                <div class="poem-body">
                  <h2>{{ poem.title }}</h2><p class="byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || m.anonymous }}</p>
                  <div class="verses"><p v-for="(line,i) in poem.content" :key="i">{{ line }}</p></div>
                </div>
                <p v-if="poemLang === 'zh-Hans'" class="script-note"><Info :size="14"/> {{ m.scriptNote }}</p>
                <div class="card-bottom"><span>第 {{ poem.id }} {{ m.sheet }}</span><div class="card-actions"><button @click="sharePoem"><Check v-if="shared" :size="16"/><Share2 v-else :size="16"/> {{ shared ? m.shared : m.share }}</button><button @click="copyPoem"><Check v-if="copied" :size="16"/><Copy v-else :size="16"/> {{ copied ? m.copied : m.copy }}</button></div></div>
              </template>
            </article>

            <div class="poem-controls" v-if="poem">
              <div class="adjacent-controls">
                <button @click="moveHistory(-1)" :disabled="loading || !canGoPrevious"><ChevronLeft :size="17"/> {{ m.previous }}</button>
                <button @click="moveHistory(1)" :disabled="loading || !canGoNext">{{ m.next }} <ChevronRight :size="17"/></button>
              </div>
              <div class="poem-language" role="group" :aria-label="m.poemScript">
                <span>{{ m.poemScript }}</span>
                <button :class="{active:poemLang === 'zh-Hans'}" @click="setPoemLang('zh-Hans')">简体</button>
                <button :class="{active:poemLang === 'zh-Hant'}" @click="setPoemLang('zh-Hant')">繁體</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="explore" class="explore">
        <div class="wrap narrow">
          <p class="section-kicker"><Sparkles :size="16"/> {{ m.searchKicker }}</p><h2>{{ m.searchTitle }}</h2><p>{{ m.searchDesc }}</p>
          <form class="searchbox" @submit.prevent="searchPoems"><Search :size="21"/><input v-model="query" :placeholder="m.placeholder"><select v-model="searchType"><option value="all">{{ m.all }}</option><option value="title">{{ m.title }}</option><option value="content">{{ m.content }}</option><option value="author">{{ m.author }}</option></select><button>{{ m.search }}</button></form>
          <div class="quick"><span>{{ m.suggestions }}</span><button v-for="q in quickWords" :key="q" @click="query=q;searchPoems()">{{ q }}</button></div>

          <div v-if="searched" class="results">
            <div class="results-head"><b>{{ searchHeading }}</b><button @click="searched=false"><X :size="18"/> {{ m.collapse }}</button></div>
            <div v-if="!searching && results.length" class="result-grid" :lang="poemLang"><button v-for="p in results.slice(0,12)" :key="p.id" class="result-card" @click="showPoem(p)"><span>{{ p.dynasty?.name }} · {{ p.author?.name }}</span><h3>{{ p.title }}</h3><p>{{ p.content?.slice(0,2).join(' ') }}</p><i>{{ m.openSheet }}</i></button></div>
            <div v-else-if="!searching" class="empty"><BookOpen :size="34"/><p>{{ searchMessage || m.noResult }}</p></div>
          </div>
        </div>
      </section>

      <section id="favorites" v-if="favorites.length" class="favorites wrap narrow" :lang="poemLang">
        <p class="section-kicker"><Heart :size="16"/> {{ m.favoritesKicker }}</p><h2>{{ m.favoritesTitle }}</h2>
        <div class="fav-row"><button v-for="p in favorites.slice(0,8)" :key="p.id" @click="showPoem(p)"><small>{{p.dynasty?.name}} · {{p.author?.name}}</small><b>{{p.title}}</b></button></div>
      </section>
    </main>

    <footer><div class="wrap"><div class="brand mini"><span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span><b>{{ m.brand }}</b></div><p>{{ m.dataFrom }}</p><div class="footer-links"><a href="https://github.com/steamaa1/poetry-vue" target="_blank" rel="noopener"><Github :size="14"/> {{ m.myProject }}</a><a href="https://poetry.palemoky.com/" target="_blank" rel="noopener">{{ m.apiLink }}</a></div></div></footer>
  </div>
</template>
