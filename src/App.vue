<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import zhHant from './locales/zh-Hant.js'
import {
  Search, Shuffle, Heart, Copy, Check, Share2, ExternalLink, ImageDown, Github, Languages, ChevronDown,
  ChevronLeft, ChevronRight, X, BookOpen, Sparkles, RotateCw, Info, BarChart3, Waves, Users, UserRound, SearchX, Home, Bookmark, CheckCircle2, Landmark, LibraryBig, Flower2, Maximize2, Minimize2
} from 'lucide-vue-next'

const API = ''
const poem = ref(null)
const poemStage = ref(null)
const readingOverlay = ref(null)
const loading = ref(true)
const error = ref('')
const query = ref('')
const searchType = ref('all')
const results = ref([])
const searched = ref(false)
const searching = ref(false)
const searchMessage = ref('')
const searchPage = ref(1)
const searchPageSize = 12
const searchHasMore = ref(false)
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
const generatingCard = ref(false)
const cardSaved = ref(false)
const favorites = ref(JSON.parse(localStorage.getItem('poetry-favorites') || '[]'))
const poemHistory = ref([])
const historyIndex = ref(-1)

// 诗海板块按标签懒加载，避免拖慢首屏。
const seaTab = ref('stats')
const seaLoaded = ref({ stats: false, poems: false, authors: false, dynasties: true, types: true })
const seaLoading = ref({ stats: false, poems: false, authors: false, dynasties: false, types: false })
const seaErrors = ref({ stats: '', poems: '', authors: '', dynasties: '', types: '' })
const stats = ref(null)
const seaPoems = ref([])
const seaPoemPage = ref(1)
const seaPoemHasMore = ref(false)
const seaAuthors = ref([])
const authorPage = ref(1)
const authorHasMore = ref(false)
const authorFilter = ref('')
const authorReading = ref('')
const taxonomyReading = ref('')
const flyingChar = ref('月')
const flyingLoading = ref(false)
const flyingError = ref('')
const fullscreenReading = ref(false)
const famousAuthors = ['李白', '杜甫', '白居易', '王维', '苏轼', '李清照', '辛弃疾', '陆游']
const seaMenuOpen = ref(false)
const mobileSeaOpen = ref(false)
let seaMenuTimer = null

// 简体中文为默认语言，直接嵌入组件。
const zhHans = {
    brand: '诗笺', slogan: '一卷诗心，半生清欢', today: '今日一诗', explore: '寻诗', favorite: '收藏',
    meet: '每日，与古人相逢', hero1: '读一首诗，', hero2: '见一方天地。',
    intro1: '从近四十万首古典诗词中，撷取一瞬风月。', intro2: '愿字句越过千年，恰好落在你的心上。',
    dynasty: '朝代', allDynasties: '不限朝代', genre: '体裁', allGenres: '不限体裁', random: '随缘一首',
    finding: '正在山水间寻诗…', retry: '再试一次', poetry: '古诗词', anonymous: '佚名', sheet: '号诗笺',
    copied: '已抄录', copy: '抄录全诗', share: '分享诗词', shared: '已复制分享内容', translation: '查询译文', generateCard: '生成卡片', generatingCard: '生成中…', cardSaved: '已下载', previous: '上一首', next: '下一首', poemScript: '诗笺文字',
    scriptNote: '简繁转换或因合并字与古籍原文有异，建议对照阅读。',
    searchKicker: '寻章摘句', searchTitle: '心有所念，诗有所应',
    searchDesc: '输入至少三个字的诗句、标题或作者信息，去浩瀚诗海里寻觅。',
    placeholder: '试试「明月光」「春风里」或「李太白」…', all: '全文', title: '标题', content: '正文', author: '作者',
    search: '寻诗', suggestions: '不知寻什么？', searching: '正在翻阅诗卷…', searchHint: '寻诗提示', found: '寻得', articles: '篇',
    collapse: '收起', searchPrevious: '上一页', searchNext: '下一页', pageLabel: '第 {page} 页', openSheet: '展开诗笺 →', noResult: '没有寻到相关诗句，换个关键词试试吧。',
    enterSearch: '请输入搜索内容。', minSearch: '诗泉搜索接口要求至少 3 个字，请输入更完整的诗句、标题或作者信息。',
    searchUnavailable: '搜索暂时不可用，请稍后重试。', favoritesKicker: '私藏诗笺', favoritesTitle: '曾与你相逢的诗',
    dataFrom: '数据由「诗泉」API 提供 · 字句有尽，诗意无穷', myProject: '我的项目', apiLink: '诗泉 API ↗', apiStatus: 'API 状态',
    languageTitle: '切换整个网页语言', languageAria: '选择网页语言', loadFailed: '诗意暂时走远了，请稍后重试。',
    switchFailed: '文字切换失败，请稍后重试。', neighborFailed: '暂时无法返回这首诗笺。',
    flyingNav: '飞花令', flyingKicker: '一字飞花', flyingTitle: '拈一字，寻一诗', flyingDesc: '输入一个汉字，从浩瀚诗海中随机寻找正文含有此字的诗。', flyingPlaceholder: '输入一个汉字', flyingAction: '行飞花令', flyingAgain: '再寻一首', flyingSingleChar: '飞花令只能输入一个汉字。', flyingFailed: '未寻到含此字的诗，请换一个字试试。', commonChars: '常用飞花字',
    fullscreen: '全屏阅读', exitFullscreen: '退出全屏', immersiveReading: '沉浸阅读',
    seaNav: '诗海', seaKicker: '万卷诗海', seaTitle: '一页风雅，千年文章', seaDesc: '循数据观诗脉，随卷帙访诗人。',
    statsTab: '数据概览', poemsTab: '诗海漫游', authorsTab: '诗人名录', dynastiesTab: '朝代风华', typesTab: '诗体词牌', loadingSea: '正在翻阅诗海…', loadSeaFailed: '诗海暂时起雾，请稍后重试。', reload: '重新加载',
    dynastiesTitle: '朝代时间轴', dynastiesDesc: '循历史年轮，阅读不同朝代的诗意风华。', typesTitle: '体裁知识卡', typesDesc: '识诗体格律，于句读之间体会文体之美。',
    dynastyYears: '{start} 至 {end}', unknownYears: '年代未详', readDynasty: '读一首本朝诗', readType: '读一首此体裁',
    linesLabel: '{count} 句', charsLabel: '每句 {count} 字', flexibleForm: '句式不定', taxonomyLoading: '正在寻诗…',
    statPoems: '收录诗词', statAuthors: '诗人雅士', statDynasties: '历代风华', statTypes: '诗体词牌',
    seaPoemsTitle: '诗海漫游', seaPoemsDesc: '按卷翻阅浩瀚诗篇，点击任意作品展开诗笺。',
    authorsTitle: '诗人名录', authorsDesc: '循名访古，与万卷诗篇中的故人重逢。', famousAuthors: '常访名家', allAuthors: '全部诗人',
    filterCurrentAuthors: '筛选本页诗人', noAuthors: '本页没有符合条件的诗人。', randomByAuthor: '随机读一首', authorProfile: '查询生平', authorLoading: '正在寻诗…',
    currentPageOnly: '仅筛选当前页',
    statsMenuDesc: '纵览诗词、作者与朝代', poemsMenuDesc: '按卷浏览古典诗词', authorsMenuDesc: '循名访问历代诗人', dynastiesMenuDesc: '沿时间轴遍览历代风华', typesMenuDesc: '认识诗词体裁与格律',
    mobileNavHome: '诗笺', mobileNavSearch: '寻诗', mobileNavSea: '诗海', mobileNavFavorite: '收藏', closeMenu: '关闭菜单',
  simplifiedChinese: '简体中文', traditionalChinese: '繁體中文', simplifiedShort: '简体', traditionalShort: '繁體'
}

// 外部语言包与默认简体合并；遗漏字段时自动回退到简体。
const messages = {
  'zh-Hans': zhHans,
  'zh-Hant': { ...zhHans, ...zhHant }
}

const m = computed(() => messages[uiLang.value])
const isFavorite = computed(() => poem.value && favorites.value.some(p => p.id === poem.value.id))
const canGoPrevious = computed(() => historyIndex.value > 0)
const canGoNext = computed(() => historyIndex.value >= 0 && historyIndex.value < poemHistory.value.length - 1)
const poemText = computed(() => poem.value ? `${poem.value.title}\n${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}\n\n${poem.value.content.join('\n')}` : '')
const searchHeading = computed(() => {
  if (searching.value) return m.value.searching
  if (searchMessage.value && !results.value.length) return m.value.searchHint
  return `${m.value.found} ${results.value.length} ${m.value.articles} · ${m.value.pageLabel.replace('{page}', searchPage.value)}`
})
const quickWords = computed(() => uiLang.value === 'zh-Hant'
  ? ['明月光', '思故鄉', '春風裡', '長安城', '李太白']
  : ['明月光', '思故乡', '春风里', '长安城', '李太白'])
const commonFlyingChars = computed(() => poemLang.value === 'zh-Hant'
  ? ['月', '花', '春', '秋', '風', '雨', '山', '水', '酒', '雲']
  : ['月', '花', '春', '秋', '风', '雨', '山', '水', '酒', '云'])

const filteredAuthors = computed(() => {
  const keyword = authorFilter.value.trim().toLocaleLowerCase()
  if (!keyword) return seaAuthors.value
  return seaAuthors.value.filter(author =>
    `${author.name || ''} ${author.dynasty?.name || ''}`.toLocaleLowerCase().includes(keyword)
  )
})

function highlightedParts(text) {
  const source = String(text || '')
  const keyword = query.value.trim()
  if (!keyword) return [{ text: source, match: false }]

  const parts = []
  const lowerSource = source.toLocaleLowerCase()
  const lowerKeyword = keyword.toLocaleLowerCase()
  let cursor = 0
  let index = lowerSource.indexOf(lowerKeyword, cursor)

  while (index !== -1) {
    if (index > cursor) parts.push({ text: source.slice(cursor, index), match: false })
    parts.push({ text: source.slice(index, index + keyword.length), match: true })
    cursor = index + keyword.length
    index = lowerSource.indexOf(lowerKeyword, cursor)
  }
  if (cursor < source.length) parts.push({ text: source.slice(cursor), match: false })
  return parts.length ? parts : [{ text: source, match: false }]
}

const REQUEST_TIMEOUT = 10000
const REQUEST_RETRIES = 2

const wait = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))

async function fetchWithRetry(url, options = {}) {
  let lastError
  for (let attempt = 0; attempt <= REQUEST_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    try {
      const response = await fetch(url, { ...options, signal: controller.signal })
      clearTimeout(timeoutId)

      // 仅对临时性故障重试；参数错误、404 等直接返回给业务层。
      if ((response.status === 408 || response.status === 429 || response.status >= 500) && attempt < REQUEST_RETRIES) {
        await wait(500 * (attempt + 1))
        continue
      }
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error
      if (attempt >= REQUEST_RETRIES) break
      await wait(500 * (attempt + 1))
    }
  }

  if (lastError?.name === 'AbortError') throw new Error('请求超时，请稍后重试。')
  throw new Error('网络连接失败，请稍后重试。')
}

async function getJSON(path, requestLang = poemLang.value) {
  const joiner = path.includes('?') ? '&' : '?'
  const res = await fetchWithRetry(`${API}${path}${joiner}lang=${requestLang}`)
  const data = await res.json().catch(() => null)
  if (!res.ok || data?.error) {
    const apiMessage = data?.error?.message || data?.message
    throw new Error(apiMessage || `请求失败（${res.status}）`)
  }
  return data
}

function poemUrl(id = poem.value?.id) {
  const url = new URL(window.location.href)
  url.hash = ''
  if (id) url.searchParams.set('poem', String(id))
  else url.searchParams.delete('poem')
  return url
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
async function searchPoems(resetPage = true) {
  const keyword = query.value.trim()
  searched.value = true
  results.value = []
  searchMessage.value = ''
  searchHasMore.value = false
  if (resetPage) searchPage.value = 1
  if (!keyword) { searchMessage.value = m.value.enterSearch; return }
  if ([...keyword].length < 3) { searchMessage.value = m.value.minSearch; return }

  searching.value = true
  try {
    const p = new URLSearchParams({
      q: keyword,
      type: searchType.value,
      page: String(searchPage.value),
      pageSize: String(searchPageSize)
    })
    const data = await getJSON(`/api/search?${p}`)
    results.value = Array.isArray(data?.data) ? data.data : []
    searchHasMore.value = Boolean(data?.pagination?.hasMore)
    if (!results.value.length) searchMessage.value = m.value.noResult
  } catch (_) {
    searchMessage.value = m.value.searchUnavailable
  } finally {
    searching.value = false
  }
}

async function changeSearchPage(step) {
  const target = searchPage.value + step
  if (target < 1 || searching.value || (step > 0 && !searchHasMore.value)) return
  searchPage.value = target
  await searchPoems(false)
  await nextTick()
  document.querySelector('.results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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

function searchTranslation() {
  if (!poem.value) return
  const suffix = uiLang.value === 'zh-Hant' ? '譯文 賞析' : '译文 赏析'
  const keyword = `《${poem.value.title}》 ${poem.value.author?.name || ''} ${suffix}`
  const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(keyword)}`
  window.open(searchUrl, '_blank', 'noopener,noreferrer')
}

async function sharePoem() {
  if (!poem.value) return
  const shareData = {
    title: `${poem.value.title} · ${poem.value.author?.name || m.value.anonymous}`,
    text: poemText.value,
    url: poemUrl(poem.value.id).href
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

function wrapCanvasText(ctx, text, maxWidth) {
  const lines = []
  let line = ''
  for (const char of String(text || '')) {
    const test = line + char
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

async function generatePoemCard() {
  if (!poem.value || generatingCard.value) return
  generatingCard.value = true
  cardSaved.value = false
  try {
    await document.fonts?.ready
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const width = 1200
    const padding = 120
    const contentWidth = width - padding * 2
    const serif = poemLang.value === 'zh-Hant' ? '"Noto Serif TC", serif' : '"Noto Serif SC", serif'

    ctx.font = `600 58px ${serif}`
    const titleLines = wrapCanvasText(ctx, poem.value.title, contentWidth)
    ctx.font = `400 36px ${serif}`
    const verseLines = poem.value.content.flatMap(line => wrapCanvasText(ctx, line, contentWidth))
    const height = Math.max(1500, 360 + titleLines.length * 82 + verseLines.length * 62 + 360)
    canvas.width = width
    canvas.height = height

    const paper = ctx.createLinearGradient(0, 0, width, height)
    paper.addColorStop(0, '#fbf8f0')
    paper.addColorStop(1, '#eee7d7')
    ctx.fillStyle = paper
    ctx.fillRect(0, 0, width, height)

    ctx.globalAlpha = .16
    ctx.fillStyle = '#d4af7a'
    ctx.beginPath()
    ctx.arc(width - 220, 210, 145, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#607268'
    ctx.beginPath()
    ctx.moveTo(0, height - 300)
    ctx.lineTo(250, height - 610)
    ctx.lineTo(430, height - 390)
    ctx.lineTo(670, height - 720)
    ctx.lineTo(900, height - 420)
    ctx.lineTo(width, height - 570)
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.closePath()
    ctx.fill()
    ctx.globalAlpha = 1

    ctx.strokeStyle = 'rgba(80,70,55,.25)'
    ctx.lineWidth = 3
    ctx.strokeRect(54, 54, width - 108, height - 108)
    ctx.strokeStyle = 'rgba(168,62,50,.28)'
    ctx.lineWidth = 2
    ctx.strokeRect(70, 70, width - 140, height - 140)

    let y = 190
    ctx.textAlign = 'center'
    ctx.fillStyle = '#a83e32'
    ctx.font = `500 28px ${serif}`
    ctx.fillText(poem.value.type?.name || m.value.poetry, width / 2, y)
    y += 100

    ctx.fillStyle = '#20231f'
    ctx.font = `600 58px ${serif}`
    for (const line of titleLines) {
      ctx.fillText(line, width / 2, y)
      y += 82
    }

    ctx.fillStyle = '#77786f'
    ctx.font = `400 28px ${serif}`
    ctx.fillText(`${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || m.value.anonymous}`, width / 2, y + 12)
    y += 120

    ctx.fillStyle = '#2c2e29'
    ctx.font = `400 36px ${serif}`
    for (const line of verseLines) {
      ctx.fillText(line, width / 2, y)
      y += 62
    }

    const footerY = height - 150
    ctx.textAlign = 'left'
    ctx.fillStyle = '#a83e32'
    ctx.fillRect(padding, footerY - 48, 62, 62)
    ctx.fillStyle = '#fffaf0'
    ctx.font = `600 38px ${serif}`
    ctx.textAlign = 'center'
    ctx.fillText(poemLang.value === 'zh-Hant' ? '詩' : '诗', padding + 31, footerY - 3)

    ctx.textAlign = 'left'
    ctx.fillStyle = '#3e403a'
    ctx.font = `500 27px ${serif}`
    ctx.fillText(m.value.brand, padding + 82, footerY - 8)
    ctx.fillStyle = '#77786f'
    ctx.font = `400 20px ${serif}`
    ctx.fillText(poemUrl(poem.value.id).href, padding + 82, footerY + 26)

    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
    if (!blob) throw new Error('canvas export failed')
    const href = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeTitle = poem.value.title.replace(/[\/:*?"<>|]/g, '_').slice(0, 40)
    link.href = href
    link.download = `诗笺-${safeTitle}-${poem.value.id}.png`
    link.click()
    setTimeout(() => URL.revokeObjectURL(href), 1000)
    cardSaved.value = true
    setTimeout(() => cardSaved.value = false, 1800)
  } finally {
    generatingCard.value = false
  }
}

async function setPoemLang(nextLang) {
  if (poemLang.value === nextLang || !poem.value?.id) return
  poemLang.value = nextLang
  localStorage.setItem('poetry-poem-lang', nextLang)
  loading.value = true
  error.value = ''
  try {
    await loadPoemById(poem.value.id)
    if (searched.value && query.value.trim().length >= 3) await searchPoems(false)
    for (const tab of ['stats', 'poems', 'authors', 'dynasties', 'types']) {
      if (seaLoaded.value[tab]) {
        seaLoaded.value = { ...seaLoaded.value, [tab]: false }
        await loadSeaTab(tab)
      }
    }
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
    if (searched.value && query.value.trim().length >= 3) await searchPoems(false)
    for (const tab of ['stats', 'poems', 'authors', 'dynasties', 'types']) {
      if (seaLoaded.value[tab]) {
        seaLoaded.value = { ...seaLoaded.value, [tab]: false }
        await loadSeaTab(tab)
      }
    }
  } catch (_) {
    error.value = m.value.switchFailed
  } finally {
    loading.value = false
  }
}

async function runFlyingGame() {
  const char = [...flyingChar.value.trim()][0] || ''
  if ([...flyingChar.value.trim()].length !== 1 || !/\p{Script=Han}/u.test(char)) {
    flyingError.value = m.value.flyingSingleChar
    return
  }

  flyingLoading.value = true
  flyingError.value = ''
  try {
    const data = await getJSON(`/api/poems/random?char=${encodeURIComponent(char)}`)
    recordPoem(data.data)
    await nextTick()
    poemStage.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (_) {
    flyingError.value = m.value.flyingFailed
  } finally {
    flyingLoading.value = false
  }
}

function chooseFlyingChar(char) {
  flyingChar.value = char
  runFlyingGame()
}

async function enterFullscreenReading() {
  if (!poem.value) return
  fullscreenReading.value = true
  await nextTick()
  try {
    await readingOverlay.value?.requestFullscreen?.()
  } catch (_) {
    // 不支持 Fullscreen API 时仍保留覆盖式沉浸阅读。
  }
}

async function exitFullscreenReading() {
  if (document.fullscreenElement) {
    try { await document.exitFullscreen() } catch (_) {}
  }
  fullscreenReading.value = false
}

function handleFullscreenChange() {
  if (!document.fullscreenElement && fullscreenReading.value) fullscreenReading.value = false
}

function formatDynastyYears(item) {
  if (item.start_year == null || item.end_year == null) return m.value.unknownYears
  const displayYear = year => year < 0 ? `前${Math.abs(year)}` : String(year)
  return m.value.dynastyYears.replace('{start}', displayYear(item.start_year)).replace('{end}', displayYear(item.end_year))
}

function formatTypeRule(item) {
  const parts = []
  if (item.lines) parts.push(m.value.linesLabel.replace('{count}', item.lines))
  if (item.chars_per_line) parts.push(m.value.charsLabel.replace('{count}', item.chars_per_line))
  return parts.length ? parts.join(' · ') : m.value.flexibleForm
}

async function readTaxonomyPoem(kind, name) {
  if (!name || taxonomyReading.value) return
  taxonomyReading.value = `${kind}:${name}`
  try {
    const key = kind === 'dynasty' ? 'dynasty' : 'type'
    const data = await getJSON(`/api/poems/random?${key}=${encodeURIComponent(name)}`)
    recordPoem(data.data)
    await nextTick()
    poemStage.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (_) {
    seaErrors.value = { ...seaErrors.value, [kind === 'dynasty' ? 'dynasties' : 'types']: m.value.loadSeaFailed }
  } finally {
    taxonomyReading.value = ''
  }
}

function scheduleSeaMenuClose() {
  clearTimeout(seaMenuTimer)
  seaMenuTimer = setTimeout(() => { seaMenuOpen.value = false }, 180)
}

function keepSeaMenuOpen() {
  clearTimeout(seaMenuTimer)
  seaMenuOpen.value = true
}

function closeNavigationMenus() {
  clearTimeout(seaMenuTimer)
  seaMenuOpen.value = false
  mobileSeaOpen.value = false
}

async function goToSection(selector) {
  closeNavigationMenus()
  await nextTick()
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function goToSeaTab(tab) {
  await openSeaTab(tab)
  closeNavigationMenus()
  await nextTick()
  document.querySelector('#sea')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function handleNavigationKey(event) {
  if (event.key === 'Escape') closeNavigationMenus()
}

function handleNavigationClick(event) {
  if (!event.target.closest('.nav-dropdown')) seaMenuOpen.value = false
}

async function openSeaTab(tab) {
  seaTab.value = tab
  if (!seaLoaded.value[tab]) await loadSeaTab(tab)
}

async function loadSeaTab(tab, force = false) {
  if (seaLoading.value[tab] || (seaLoaded.value[tab] && !force)) return
  seaLoading.value = { ...seaLoading.value, [tab]: true }
  seaErrors.value = { ...seaErrors.value, [tab]: '' }
  try {
    if (tab === 'stats') await loadStats()
    if (tab === 'poems') await loadSeaPoems()
    if (tab === 'authors') await loadAuthors()
    seaLoaded.value = { ...seaLoaded.value, [tab]: true }
  } catch (_) {
    seaErrors.value = { ...seaErrors.value, [tab]: m.value.loadSeaFailed }
  } finally {
    seaLoading.value = { ...seaLoading.value, [tab]: false }
  }
}

async function loadStats() {
  const data = await getJSON('/api/stats')
  stats.value = data?.data || null
}

async function loadSeaPoems() {
  const data = await getJSON(`/api/poems?page=${seaPoemPage.value}&pageSize=12`)
  seaPoems.value = Array.isArray(data?.data) ? data.data : []
  seaPoemHasMore.value = Boolean(data?.pagination?.hasMore)
}

async function changeSeaPoemPage(step) {
  const target = seaPoemPage.value + step
  if (target < 1 || (step > 0 && !seaPoemHasMore.value) || seaLoading.value.poems) return
  seaPoemPage.value = target
  seaLoaded.value = { ...seaLoaded.value, poems: false }
  await loadSeaTab('poems')
  await nextTick()
  document.querySelector('.sea-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function loadAuthors() {
  const data = await getJSON(`/api/authors?page=${authorPage.value}&pageSize=24`)
  seaAuthors.value = Array.isArray(data?.data) ? data.data : []
  authorHasMore.value = Boolean(data?.pagination?.hasMore)
}

async function changeAuthorPage(step) {
  const target = authorPage.value + step
  if (target < 1 || (step > 0 && !authorHasMore.value) || seaLoading.value.authors) return
  authorPage.value = target
  authorFilter.value = ''
  seaLoaded.value = { ...seaLoaded.value, authors: false }
  await loadSeaTab('authors')
  await nextTick()
  document.querySelector('.sea-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function readAuthorPoem(authorName) {
  if (!authorName || authorReading.value) return
  authorReading.value = authorName
  try {
    const data = await getJSON(`/api/poems/random?author=${encodeURIComponent(authorName)}`)
    recordPoem(data.data)
    await nextTick()
    poemStage.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  } catch (_) {
    seaErrors.value = { ...seaErrors.value, authors: m.value.loadSeaFailed }
  } finally {
    authorReading.value = ''
  }
}

function searchAuthorProfile(authorName) {
  const suffix = uiLang.value === 'zh-Hant' ? '生平 代表作 詩詞' : '生平 代表作 诗词'
  window.open(`https://www.bing.com/search?q=${encodeURIComponent(`${authorName} ${suffix}`)}`, '_blank', 'noopener,noreferrer')
}

async function loadFilters() {
  try {
    const [d, t] = await Promise.all([getJSON('/api/dynasties'), getJSON('/api/types')])
    dynasties.value = d.data || []
    types.value = t.data || []
  } catch (_) {}
}

async function loadInitialPoem() {
  const currentUrl = new URL(window.location.href)
  const poemParam = currentUrl.searchParams.get('poem')
  const poemId = Number.parseInt(poemParam || '', 10)

  // 分享参数只消费一次：立即清理地址栏，且不新增浏览器历史记录。
  if (poemParam !== null) {
    currentUrl.searchParams.delete('poem')
    window.history.replaceState({}, '', `${currentUrl.pathname}${currentUrl.search}${currentUrl.hash}`)
  }

  if (Number.isInteger(poemId) && poemId > 0) {
    loading.value = true
    error.value = ''
    try {
      const data = await getJSON(`/api/poems/${poemId}`)
      recordPoem(data.data)
      return
    } catch (_) {
      // 分享链接失效时回退到普通随机首页。
    } finally {
      loading.value = false
    }
  }
  await randomPoem()
}

onMounted(() => {
  document.documentElement.lang = uiLang.value
  localStorage.setItem('poetry-ui-lang', uiLang.value)
  localStorage.setItem('poetry-poem-lang', poemLang.value)
  document.addEventListener('keydown', handleNavigationKey)
  document.addEventListener('click', handleNavigationClick)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  return Promise.all([loadInitialPoem(), loadFilters()]).then(() => loadSeaTab('stats'))
})

onBeforeUnmount(() => {
  clearTimeout(seaMenuTimer)
  document.removeEventListener('keydown', handleNavigationKey)
  document.removeEventListener('click', handleNavigationClick)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <div class="app-shell" :lang="uiLang">
    <header class="nav wrap">
      <a class="brand" href="#" @click.prevent="randomPoem">
        <span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span>
        <span><b>{{ m.brand }}</b><small>{{ m.slogan }}</small></span>
      </a>
      <nav class="desktop-nav">
        <a class="active" href="#today">{{ m.today }}</a>
        <a href="#explore">{{ m.explore }}</a>
        <a href="#feihua">{{ m.flyingNav }}</a>
        <div class="nav-dropdown" @mouseenter="keepSeaMenuOpen" @mouseleave="scheduleSeaMenuClose">
          <button class="nav-dropdown-trigger" @click="seaMenuOpen = !seaMenuOpen" aria-haspopup="menu" :aria-expanded="seaMenuOpen">
            {{ m.seaNav }} <ChevronDown :size="13" :class="{rotated:seaMenuOpen}"/>
          </button>
          <div v-show="seaMenuOpen" class="nav-dropdown-menu" role="menu" @click.stop>
            <button role="menuitem" :class="{current:seaTab === 'stats'}" @click="goToSeaTab('stats')"><BarChart3 :size="19"/><span><b>{{ m.statsTab }}</b><small>{{ m.statsMenuDesc }}</small></span><CheckCircle2 v-if="seaTab === 'stats'" :size="15"/></button>
            <button role="menuitem" :class="{current:seaTab === 'poems'}" @click="goToSeaTab('poems')"><BookOpen :size="19"/><span><b>{{ m.poemsTab }}</b><small>{{ m.poemsMenuDesc }}</small></span><CheckCircle2 v-if="seaTab === 'poems'" :size="15"/></button>
            <button role="menuitem" :class="{current:seaTab === 'authors'}" @click="goToSeaTab('authors')"><Users :size="19"/><span><b>{{ m.authorsTab }}</b><small>{{ m.authorsMenuDesc }}</small></span><CheckCircle2 v-if="seaTab === 'authors'" :size="15"/></button>
            <button role="menuitem" :class="{current:seaTab === 'dynasties'}" @click="goToSeaTab('dynasties')"><Landmark :size="19"/><span><b>{{ m.dynastiesTab }}</b><small>{{ m.dynastiesMenuDesc }}</small></span><CheckCircle2 v-if="seaTab === 'dynasties'" :size="15"/></button>
            <button role="menuitem" :class="{current:seaTab === 'types'}" @click="goToSeaTab('types')"><LibraryBig :size="19"/><span><b>{{ m.typesTab }}</b><small>{{ m.typesMenuDesc }}</small></span><CheckCircle2 v-if="seaTab === 'types'" :size="15"/></button>
          </div>
        </div>
        <a href="#favorites">{{ m.favorite }} <i v-if="favorites.length">{{ favorites.length }}</i></a>
      </nav>
      <div class="nav-actions">
        <div class="language-picker" :title="m.languageTitle">
          <Languages :size="17" />
          <select v-model="uiLang" @change="changeUiLang" :aria-label="m.languageAria">
            <option value="zh-Hans">{{ m.simplifiedChinese }}</option>
            <option value="zh-Hant">{{ m.traditionalChinese }}</option>
          </select>
          <ChevronDown :size="13" />
        </div>
        <a class="icon-button" href="https://github.com/steamaa1/chinese-poetry-vue" target="_blank" rel="noopener" :title="m.myProject"><Github :size="19" /></a>
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
                <div class="card-bottom"><span>第 {{ poem.id }} {{ m.sheet }}</span><div class="card-actions"><button @click="generatePoemCard" :disabled="generatingCard"><Check v-if="cardSaved" :size="16"/><RotateCw v-else-if="generatingCard" class="spin" :size="16"/><ImageDown v-else :size="16"/> {{ cardSaved ? m.cardSaved : (generatingCard ? m.generatingCard : m.generateCard) }}</button><button @click="searchTranslation"><ExternalLink :size="16"/> {{ m.translation }}</button><button @click="sharePoem"><Check v-if="shared" :size="16"/><Share2 v-else :size="16"/> {{ shared ? m.shared : m.share }}</button><button @click="copyPoem"><Check v-if="copied" :size="16"/><Copy v-else :size="16"/> {{ copied ? m.copied : m.copy }}</button></div></div>
              </template>
            </article>

            <div class="poem-controls" v-if="poem">
              <div class="adjacent-controls">
                <button @click="moveHistory(-1)" :disabled="loading || !canGoPrevious"><ChevronLeft :size="17"/> {{ m.previous }}</button>
                <button @click="moveHistory(1)" :disabled="loading || !canGoNext">{{ m.next }} <ChevronRight :size="17"/></button>
              </div>
              <div class="poem-language" role="group" :aria-label="m.poemScript">
                <button class="fullscreen-button" @click="enterFullscreenReading"><Maximize2 :size="15"/> {{ m.fullscreen }}</button>
                <span>{{ m.poemScript }}</span>
                <button :class="{active:poemLang === 'zh-Hans'}" @click="setPoemLang('zh-Hans')">{{ m.simplifiedShort }}</button>
                <button :class="{active:poemLang === 'zh-Hant'}" @click="setPoemLang('zh-Hant')">{{ m.traditionalShort }}</button>
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
            <div v-if="!searching && results.length" class="result-grid" :lang="poemLang">
              <button v-for="p in results" :key="p.id" class="result-card" @click="showPoem(p)">
                <span><template v-for="(part,i) in highlightedParts(`${p.dynasty?.name || ''} · ${p.author?.name || ''}`)" :key="i"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></span>
                <h3><template v-for="(part,i) in highlightedParts(p.title)" :key="i"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></h3>
                <p><template v-for="(part,i) in highlightedParts(p.content?.slice(0,2).join(' '))" :key="i"><mark v-if="part.match">{{ part.text }}</mark><template v-else>{{ part.text }}</template></template></p>
                <i>{{ m.openSheet }}</i>
              </button>
            </div>
            <div v-else-if="!searching" class="empty"><BookOpen :size="34"/><p>{{ searchMessage || m.noResult }}</p></div>
            <div v-if="!searching && results.length" class="search-pagination">
              <button @click="changeSearchPage(-1)" :disabled="searchPage <= 1"><ChevronLeft :size="17"/> {{ m.searchPrevious }}</button>
              <span>{{ m.pageLabel.replace('{page}', searchPage) }}</span>
              <button @click="changeSearchPage(1)" :disabled="!searchHasMore">{{ m.searchNext }} <ChevronRight :size="17"/></button>
            </div>
          </div>
        </div>
      </section>

      <section id="feihua" class="flying-section">
        <div class="wrap narrow">
          <p class="section-kicker"><Flower2 :size="16"/> {{ m.flyingKicker }}</p>
          <h2>{{ m.flyingTitle }}</h2>
          <p>{{ m.flyingDesc }}</p>
          <form class="flying-form" @submit.prevent="runFlyingGame">
            <input v-model="flyingChar" maxlength="1" :placeholder="m.flyingPlaceholder" aria-label="飞花令汉字">
            <button :disabled="flyingLoading"><RotateCw v-if="flyingLoading" class="spin" :size="17"/><Flower2 v-else :size="17"/> {{ flyingLoading ? m.flyingAgain : m.flyingAction }}</button>
          </form>
          <p v-if="flyingError" class="flying-error">{{ flyingError }}</p>
          <div class="flying-quick"><span>{{ m.commonChars }}</span><button v-for="char in commonFlyingChars" :key="char" @click="chooseFlyingChar(char)">{{ char }}</button></div>
        </div>
      </section>

      <section id="sea" class="sea-section">
        <div class="wrap narrow">
          <p class="section-kicker"><Waves :size="16"/> {{ m.seaKicker }}</p>
          <h2>{{ m.seaTitle }}</h2>
          <p class="sea-intro">{{ m.seaDesc }}</p>

          <div class="sea-tabs" role="tablist">
            <button :class="{active:seaTab === 'stats'}" @click="openSeaTab('stats')"><BarChart3 :size="17"/> {{ m.statsTab }}</button>
            <button :class="{active:seaTab === 'poems'}" @click="openSeaTab('poems')"><BookOpen :size="17"/> {{ m.poemsTab }}</button>
            <button :class="{active:seaTab === 'authors'}" @click="openSeaTab('authors')"><Users :size="17"/> {{ m.authorsTab }}</button>
            <button :class="{active:seaTab === 'dynasties'}" @click="openSeaTab('dynasties')"><Landmark :size="17"/> {{ m.dynastiesTab }}</button>
            <button :class="{active:seaTab === 'types'}" @click="openSeaTab('types')"><LibraryBig :size="17"/> {{ m.typesTab }}</button>
          </div>

          <div class="sea-panel" :lang="poemLang">
            <div v-if="seaLoading[seaTab]" class="sea-state"><RotateCw class="spin" :size="28"/><span>{{ m.loadingSea }}</span></div>
            <div v-else-if="seaErrors[seaTab]" class="sea-state"><Info :size="28"/><span>{{ seaErrors[seaTab] }}</span><button @click="loadSeaTab(seaTab,true)">{{ m.reload }}</button></div>

            <template v-else-if="seaTab === 'stats' && stats">
              <div class="stats-grid">
                <button @click="openSeaTab('poems')"><strong>{{ Number(stats.poems || 0).toLocaleString() }}</strong><span>{{ m.statPoems }}</span><BookOpen :size="19"/></button>
                <button @click="openSeaTab('authors')"><strong>{{ Number(stats.authors || 0).toLocaleString() }}</strong><span>{{ m.statAuthors }}</span><Users :size="19"/></button>
                <button @click="openSeaTab('dynasties')"><strong>{{ Number(stats.dynasties || 0).toLocaleString() }}</strong><span>{{ m.statDynasties }}</span><Landmark :size="19"/></button>
                <button @click="openSeaTab('types')"><strong>{{ Number(stats.types || 0).toLocaleString() }}</strong><span>{{ m.statTypes }}</span><LibraryBig :size="19"/></button>
              </div>
            </template>

            <template v-else-if="seaTab === 'poems'">
              <div class="sea-panel-head"><div><h3>{{ m.seaPoemsTitle }}</h3><p>{{ m.seaPoemsDesc }}</p></div><span>{{ m.pageLabel.replace('{page}', seaPoemPage) }}</span></div>
              <div class="sea-poem-grid">
                <button v-for="p in seaPoems" :key="p.id" class="sea-poem-card" @click="showPoem(p)">
                  <span>{{ p.dynasty?.name }} · {{ p.author?.name }} · {{ p.type?.name }}</span>
                  <h4>{{ p.title }}</h4>
                  <p>{{ p.content?.slice(0,2).join(' ') }}</p>
                  <i>{{ m.openSheet }}</i>
                </button>
              </div>
              <div class="search-pagination">
                <button @click="changeSeaPoemPage(-1)" :disabled="seaPoemPage <= 1"><ChevronLeft :size="17"/> {{ m.searchPrevious }}</button>
                <span>{{ m.pageLabel.replace('{page}', seaPoemPage) }}</span>
                <button @click="changeSeaPoemPage(1)" :disabled="!seaPoemHasMore">{{ m.searchNext }} <ChevronRight :size="17"/></button>
              </div>
            </template>

            <template v-else-if="seaTab === 'dynasties'">
              <div class="sea-panel-head"><div><h3>{{ m.dynastiesTitle }}</h3><p>{{ m.dynastiesDesc }}</p></div></div>
              <div class="dynasty-timeline">
                <article v-for="(item,index) in dynasties" :key="item.id" class="dynasty-item">
                  <div class="timeline-mark"><span>{{ index + 1 }}</span></div>
                  <div class="dynasty-card"><span>{{ formatDynastyYears(item) }}</span><h4>{{ item.name }}</h4><small>{{ item.name_en }}</small><button @click="readTaxonomyPoem('dynasty',item.name)" :disabled="Boolean(taxonomyReading)"><RotateCw v-if="taxonomyReading === `dynasty:${item.name}`" class="spin" :size="14"/><BookOpen v-else :size="14"/> {{ taxonomyReading === `dynasty:${item.name}` ? m.taxonomyLoading : m.readDynasty }}</button></div>
                </article>
              </div>
            </template>

            <template v-else-if="seaTab === 'types'">
              <div class="sea-panel-head"><div><h3>{{ m.typesTitle }}</h3><p>{{ m.typesDesc }}</p></div></div>
              <div class="type-knowledge-grid">
                <article v-for="item in types" :key="item.id" class="type-knowledge-card">
                  <div><span>{{ item.category }}</span><small>{{ formatTypeRule(item) }}</small></div>
                  <h4>{{ item.name }}</h4><p>{{ item.description || m.flexibleForm }}</p>
                  <button @click="readTaxonomyPoem('type',item.name)" :disabled="Boolean(taxonomyReading)"><RotateCw v-if="taxonomyReading === `type:${item.name}`" class="spin" :size="14"/><BookOpen v-else :size="14"/> {{ taxonomyReading === `type:${item.name}` ? m.taxonomyLoading : m.readType }}</button>
                </article>
              </div>
            </template>

            <template v-else-if="seaTab === 'authors'">
              <div class="sea-panel-head"><div><h3>{{ m.authorsTitle }}</h3><p>{{ m.authorsDesc }}</p></div><span>{{ m.pageLabel.replace('{page}', authorPage) }}</span></div>
              <h4 class="author-subtitle">{{ m.famousAuthors }}</h4>
              <div class="famous-authors">
                <button v-for="name in famousAuthors" :key="name" @click="readAuthorPoem(name)" :disabled="Boolean(authorReading)"><UserRound :size="18"/><b>{{ name }}</b><small>{{ authorReading === name ? m.authorLoading : m.randomByAuthor }}</small></button>
              </div>

              <div class="author-list-head"><h4>{{ m.allAuthors }}</h4><label><Search :size="16"/><input v-model="authorFilter" :placeholder="m.filterCurrentAuthors"><small>{{ m.currentPageOnly }}</small></label></div>
              <div v-if="filteredAuthors.length" class="author-grid">
                <article v-for="authorItem in filteredAuthors" :key="authorItem.id" class="author-card">
                  <span>{{ authorItem.dynasty?.name || m.poetry }}</span><h4>{{ authorItem.name }}</h4>
                  <div><button @click="readAuthorPoem(authorItem.name)" :disabled="Boolean(authorReading)"><RotateCw v-if="authorReading === authorItem.name" class="spin" :size="14"/><BookOpen v-else :size="14"/> {{ authorReading === authorItem.name ? m.authorLoading : m.randomByAuthor }}</button><button @click="searchAuthorProfile(authorItem.name)"><ExternalLink :size="14"/> {{ m.authorProfile }}</button></div>
                </article>
              </div>
              <div v-else class="empty"><SearchX :size="32"/><p>{{ m.noAuthors }}</p></div>
              <div class="search-pagination">
                <button @click="changeAuthorPage(-1)" :disabled="authorPage <= 1"><ChevronLeft :size="17"/> {{ m.searchPrevious }}</button>
                <span>{{ m.pageLabel.replace('{page}', authorPage) }}</span>
                <button @click="changeAuthorPage(1)" :disabled="!authorHasMore">{{ m.searchNext }} <ChevronRight :size="17"/></button>
              </div>
            </template>
          </div>
        </div>
      </section>

      <section id="favorites" v-if="favorites.length" class="favorites wrap narrow" :lang="poemLang">
        <p class="section-kicker"><Heart :size="16"/> {{ m.favoritesKicker }}</p><h2>{{ m.favoritesTitle }}</h2>
        <div class="fav-row"><button v-for="p in favorites.slice(0,8)" :key="p.id" @click="showPoem(p)"><small>{{p.dynasty?.name}} · {{p.author?.name}}</small><b>{{p.title}}</b></button></div>
      </section>
    </main>

    <div v-if="fullscreenReading && poem" ref="readingOverlay" class="reading-overlay" :lang="poemLang">
      <button class="reading-close" @click="exitFullscreenReading"><Minimize2 :size="19"/> {{ m.exitFullscreen }}</button>
      <div class="reading-paper">
        <span class="reading-kicker">{{ m.immersiveReading }}</span>
        <h2>{{ poem.title }}</h2>
        <p class="reading-byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || m.anonymous }}</p>
        <div class="reading-verses"><p v-for="(line,index) in poem.content" :key="index">{{ line }}</p></div>
        <div class="reading-footer"><span>{{ m.brand }}</span><span>第 {{ poem.id }} {{ m.sheet }}</span></div>
      </div>
    </div>

    <nav class="mobile-bottom-nav" :aria-label="m.languageAria">
      <button @click="goToSection('#today')"><Home :size="20"/><span>{{ m.mobileNavHome }}</span></button>
      <button @click="goToSection('#explore')"><Search :size="20"/><span>{{ m.mobileNavSearch }}</span></button>
      <button :class="{active:mobileSeaOpen}" @click="mobileSeaOpen = true"><Waves :size="20"/><span>{{ m.mobileNavSea }}</span></button>
      <button @click="goToSection(favorites.length ? '#favorites' : '#today')"><Bookmark :size="20"/><span>{{ m.mobileNavFavorite }}</span><i v-if="favorites.length">{{ favorites.length }}</i></button>
    </nav>

    <div v-if="mobileSeaOpen" class="mobile-menu-backdrop" @click="mobileSeaOpen = false"></div>
    <aside :class="['mobile-sea-sheet',{open:mobileSeaOpen}]" :aria-hidden="!mobileSeaOpen">
      <div class="mobile-sheet-handle"></div>
      <div class="mobile-sheet-head"><div><small>{{ m.seaKicker }}</small><h3>{{ m.seaNav }}</h3></div><button @click="mobileSeaOpen = false" :aria-label="m.closeMenu"><X :size="20"/></button></div>
      <button :class="{current:seaTab === 'stats'}" @click="goToSeaTab('stats')"><BarChart3 :size="21"/><span><b>{{ m.statsTab }}</b><small>{{ m.statsMenuDesc }}</small></span><ChevronRight :size="17"/></button>
      <button :class="{current:seaTab === 'poems'}" @click="goToSeaTab('poems')"><BookOpen :size="21"/><span><b>{{ m.poemsTab }}</b><small>{{ m.poemsMenuDesc }}</small></span><ChevronRight :size="17"/></button>
      <button :class="{current:seaTab === 'authors'}" @click="goToSeaTab('authors')"><Users :size="21"/><span><b>{{ m.authorsTab }}</b><small>{{ m.authorsMenuDesc }}</small></span><ChevronRight :size="17"/></button>
      <button :class="{current:seaTab === 'dynasties'}" @click="goToSeaTab('dynasties')"><Landmark :size="21"/><span><b>{{ m.dynastiesTab }}</b><small>{{ m.dynastiesMenuDesc }}</small></span><ChevronRight :size="17"/></button>
      <button :class="{current:seaTab === 'types'}" @click="goToSeaTab('types')"><LibraryBig :size="21"/><span><b>{{ m.typesTab }}</b><small>{{ m.typesMenuDesc }}</small></span><ChevronRight :size="17"/></button>
    </aside>

    <footer><div class="wrap"><div class="brand mini"><span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span><b>{{ m.brand }}</b></div><p>{{ m.dataFrom }}</p><div class="footer-links"><a href="https://github.com/steamaa1/chinese-poetry-vue" target="_blank" rel="noopener"><Github :size="14"/> {{ m.myProject }}</a><a href="/status.html">{{ m.apiStatus }}</a><a href="https://poetry.palemoky.com/" target="_blank" rel="noopener">{{ m.apiLink }}</a></div></div></footer>
  </div>
</template>
