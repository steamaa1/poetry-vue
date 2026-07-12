<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Shuffle, Heart, Copy, Check, Github, Languages, ChevronDown, X, BookOpen, Sparkles, RotateCw } from 'lucide-vue-next'

const API = 'https://poetry.palemoky.com'
const poem = ref(null)
const loading = ref(true)
const error = ref('')
const query = ref('')
const searchType = ref('all')
const results = ref([])
const searched = ref(false)
const searching = ref(false)
const lang = ref('zh-Hans')
const dynasty = ref('')
const type = ref('')
const dynasties = ref([])
const types = ref([])
const copied = ref(false)
const favorites = ref(JSON.parse(localStorage.getItem('poetry-favorites') || '[]'))

const isFavorite = computed(() => poem.value && favorites.value.some(p => p.id === poem.value.id))
const poemText = computed(() => poem.value ? `${poem.value.title}\n${poem.value.dynasty?.name || ''} · ${poem.value.author?.name || '佚名'}\n\n${poem.value.content.join('\n')}` : '')

async function getJSON(path) {
  const joiner = path.includes('?') ? '&' : '?'
  const res = await fetch(`${API}${path}${joiner}lang=${lang.value}`)
  if (!res.ok) throw new Error(`请求失败（${res.status}）`)
  return res.json()
}
async function randomPoem() {
  loading.value = true; error.value = ''
  try {
    const p = new URLSearchParams()
    if (dynasty.value) p.set('dynasty', dynasty.value)
    if (type.value) p.set('type', type.value)
    const data = await getJSON(`/api/poems/random${p.size ? '?' + p : ''}`)
    poem.value = data.data
  } catch (e) { error.value = e.message || '诗意暂时走远了，请稍后重试。' }
  finally { loading.value = false }
}
async function searchPoems() {
  if (!query.value.trim()) return
  searching.value = true; searched.value = true; error.value = ''
  try {
    const p = new URLSearchParams({ q: query.value.trim(), type: searchType.value })
    const data = await getJSON(`/api/search?${p}`)
    results.value = data.data || data.poems || []
  } catch (e) { results.value = []; error.value = e.message }
  finally { searching.value = false }
}
function showPoem(p) { poem.value = p; searched.value = false; window.scrollTo({ top: 0, behavior: 'smooth' }) }
function toggleFavorite() {
  if (!poem.value) return
  const i = favorites.value.findIndex(p => p.id === poem.value.id)
  i >= 0 ? favorites.value.splice(i, 1) : favorites.value.unshift(poem.value)
  localStorage.setItem('poetry-favorites', JSON.stringify(favorites.value))
}
async function copyPoem() {
  await navigator.clipboard.writeText(poemText.value); copied.value = true
  setTimeout(() => copied.value = false, 1600)
}
async function switchLang() { lang.value = lang.value === 'zh-Hans' ? 'zh-Hant' : 'zh-Hans'; await Promise.all([randomPoem(), loadFilters()]) }
async function loadFilters() {
  try {
    const [d, t] = await Promise.all([getJSON('/api/dynasties'), getJSON('/api/types')])
    dynasties.value = d.data || []; types.value = t.data || []
  } catch (_) {}
}
onMounted(() => Promise.all([randomPoem(), loadFilters()]))
</script>

<template>
  <div class="app-shell">
    <header class="nav wrap">
      <a class="brand" href="#" @click.prevent="randomPoem"><span class="seal">诗</span><span><b>诗笺</b><small>一卷诗心，半生清欢</small></span></a>
      <nav>
        <a class="active" href="#today">今日一诗</a><a href="#explore">寻诗</a><a href="#favorites">收藏 <i v-if="favorites.length">{{ favorites.length }}</i></a>
      </nav>
      <div class="nav-actions">
        <button class="icon-button" @click="switchLang" :title="lang === 'zh-Hans' ? '切换繁体' : '切换简体'"><Languages :size="19" /></button>
        <a class="icon-button" href="https://github.com/palemoky/chinese-poetry-api" target="_blank" title="项目源码"><Github :size="19" /></a>
      </div>
    </header>

    <main>
      <section id="today" class="hero wrap">
        <div class="hero-copy">
          <p class="eyebrow"><span></span> 每日，与古人相逢</p>
          <h1>读一首诗，<br><em>见一方天地。</em></h1>
          <p class="intro">从近四十万首古典诗词中，撷取一瞬风月。<br>愿字句越过千年，恰好落在你的心上。</p>
          <div class="filters">
            <label>朝代<div class="select-wrap"><select v-model="dynasty"><option value="">不限朝代</option><option v-for="d in dynasties" :key="d.id">{{ d.name }}</option></select><ChevronDown :size="15" /></div></label>
            <label>体裁<div class="select-wrap"><select v-model="type"><option value="">不限体裁</option><option v-for="t in types" :key="t.id">{{ t.name }}</option></select><ChevronDown :size="15" /></div></label>
            <button class="primary" @click="randomPoem"><Shuffle :size="17" /> 随缘一首</button>
          </div>
        </div>

        <div class="poem-stage">
          <span class="sun"></span><span class="mountain m1"></span><span class="mountain m2"></span>
          <article class="poem-card">
            <div v-if="loading" class="state"><RotateCw class="spin" :size="28"/><span>正在山水间寻诗…</span></div>
            <div v-else-if="error && !poem" class="state"><span>{{ error }}</span><button @click="randomPoem">再试一次</button></div>
            <template v-else-if="poem">
              <div class="card-top"><span>{{ poem.type?.name || '古诗词' }}</span><button @click="toggleFavorite" :class="{liked:isFavorite}"><Heart :size="19" :fill="isFavorite ? 'currentColor' : 'none'"/></button></div>
              <div class="poem-body">
                <h2>{{ poem.title }}</h2><p class="byline">{{ poem.dynasty?.name }} · {{ poem.author?.name || '佚名' }}</p>
                <div class="verses"><p v-for="(line,i) in poem.content" :key="i">{{ line }}</p></div>
              </div>
              <div class="card-bottom"><span>第 {{ poem.id }} 号诗笺</span><button @click="copyPoem"> <Check v-if="copied" :size="16"/><Copy v-else :size="16"/> {{ copied ? '已抄录' : '抄录全诗' }}</button></div>
            </template>
          </article>
        </div>
      </section>

      <section id="explore" class="explore">
        <div class="wrap narrow">
          <p class="section-kicker"><Sparkles :size="16"/> 寻章摘句</p><h2>心有所念，诗有所应</h2><p>输入一字、一句，或一位诗人的名字，去浩瀚诗海里寻觅。</p>
          <form class="searchbox" @submit.prevent="searchPoems"><Search :size="21"/><input v-model="query" placeholder="试试「明月」「春风」或「李白」…"><select v-model="searchType"><option value="all">全文</option><option value="title">标题</option><option value="content">正文</option><option value="author">作者</option></select><button>寻诗</button></form>
          <div class="quick"><span>不知寻什么？</span><button v-for="q in ['明月','故乡','春风','长安','李白']" :key="q" @click="query=q;searchPoems()">{{ q }}</button></div>

          <div v-if="searched" class="results">
            <div class="results-head"><b>{{ searching ? '正在翻阅诗卷…' : `寻得 ${results.length} 篇` }}</b><button @click="searched=false"><X :size="18"/> 收起</button></div>
            <div v-if="!searching && results.length" class="result-grid"><button v-for="p in results.slice(0,12)" :key="p.id" class="result-card" @click="showPoem(p)"><span>{{ p.dynasty?.name }} · {{ p.author?.name }}</span><h3>{{ p.title }}</h3><p>{{ p.content?.slice(0,2).join(' ') }}</p><i>展开诗笺 →</i></button></div>
            <div v-else-if="!searching" class="empty"><BookOpen :size="34"/><p>没有寻到相关诗句，换个词试试吧。</p></div>
          </div>
        </div>
      </section>

      <section id="favorites" v-if="favorites.length" class="favorites wrap narrow">
        <p class="section-kicker"><Heart :size="16"/> 私藏诗笺</p><h2>曾与你相逢的诗</h2>
        <div class="fav-row"><button v-for="p in favorites.slice(0,8)" :key="p.id" @click="showPoem(p)"><small>{{p.dynasty?.name}} · {{p.author?.name}}</small><b>{{p.title}}</b></button></div>
      </section>
    </main>

    <footer><div class="wrap"><div class="brand mini"><span class="seal">诗</span><b>诗笺</b></div><p>数据由「诗泉」API 提供 · 字句有尽，诗意无穷</p><a href="https://poetry.palemoky.com/" target="_blank">poetry.palemoky.com ↗</a></div></footer>
  </div>
</template>
