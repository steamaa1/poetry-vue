<script setup>
import { Github } from 'lucide-vue-next'
defineProps({ messages: { type: Object, required: true }, uiLang: { type: String, required: true } })
</script>

<template>
  <footer>
    <div class="wrap">
      <div class="brand mini"><span class="seal">{{ uiLang === 'zh-Hant' ? '詩' : '诗' }}</span><b>{{ messages.brand }}</b></div>
      <p>{{ messages.dataFrom }}</p>
      <div class="footer-links">
        <a href="https://github.com/steamaa1/chinese-poetry-vue" target="_blank" rel="noopener"><Github :size="14"/> {{ messages.myProject }}</a>
        <a href="/status.html">{{ messages.apiStatus }}</a>
        <a href="https://poetry.palemoky.com/" target="_blank" rel="noopener">{{ messages.apiLink }}</a>
      </div>
    </div>
  </footer>
</template>
