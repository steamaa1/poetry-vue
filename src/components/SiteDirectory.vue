<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { CalendarDays, ChevronRight, ExternalLink, Gamepad2, Github, Home, Menu, X } from 'lucide-vue-next'

const props = defineProps({ messages: { type: Object, required: true } })
const desktopOpen = ref(false)
const mobileOpen = ref(false)
const root = ref(null)

function navigate(path) {
  close()
  window.location.assign(path)
}
function toggle() {
  if (window.innerWidth <= 850) mobileOpen.value = true
  else desktopOpen.value = !desktopOpen.value
}
function close() { desktopOpen.value = false; mobileOpen.value = false }
function outside(event) { if (!root.value?.contains(event.target)) desktopOpen.value = false }
function keydown(event) { if (event.key === 'Escape') close() }

onMounted(() => { document.addEventListener('click', outside); document.addEventListener('keydown', keydown) })
onBeforeUnmount(() => { document.removeEventListener('click', outside); document.removeEventListener('keydown', keydown) })
</script>

<template>
  <div ref="root" class="site-directory">
    <button class="icon-button" @click.stop="toggle" :title="messages.siteDirectory" aria-haspopup="menu" :aria-expanded="desktopOpen || mobileOpen"><Menu :size="20" /></button>

    <div v-show="desktopOpen" class="site-directory-menu" role="menu" @click.stop>
      <div class="directory-heading"><small>{{ messages.siteDirectory }}</small><b>{{ messages.brand }}</b></div>
      <button class="directory-home" role="menuitem" @click="navigate('/')"><Home :size="20"/><span><b>{{ messages.directoryHome }}</b><small>{{ messages.directoryHomeDesc }}</small></span><ChevronRight :size="16"/></button>
      <button class="directory-group-title" @click="navigate('/yaji.html')"><Gamepad2 :size="18"/><span><b>{{ messages.elegantGathering }}</b><small>{{ messages.elegantGatheringDesc }}</small></span><ChevronRight :size="15"/></button>
      <div class="directory-future-list directory-page-list">
        <button @click="navigate('/yaji.html#daily')"><CalendarDays :size="17"/><span><b>{{ messages.dailyPoem }}</b><small>{{ messages.dailyPoemDesc }}</small></span><ChevronRight :size="14"/></button>
        <button @click="navigate('/yaji.html#games')"><Gamepad2 :size="17"/><span><b>{{ messages.poetryInteraction }}</b><small>{{ messages.poetryInteractionDesc }}</small></span><ChevronRight :size="14"/></button>
      </div>
      <a class="directory-source" href="https://github.com/steamaa1/chinese-poetry-vue" target="_blank" rel="noopener"><Github :size="16"/> {{ messages.projectSource }} <ExternalLink :size="13"/></a>
    </div>

    <div v-if="mobileOpen" class="mobile-menu-backdrop" @click="close"></div>
    <aside :class="['mobile-sea-sheet','mobile-directory-sheet',{open:mobileOpen}]" :aria-hidden="!mobileOpen">
      <div class="mobile-sheet-handle"></div>
      <div class="mobile-sheet-head"><div><small>{{ messages.brand }}</small><h3>{{ messages.siteDirectory }}</h3></div><button @click="close" :aria-label="messages.closeMenu"><X :size="20"/></button></div>
      <button @click="navigate('/')"><Home :size="21"/><span><b>{{ messages.directoryHome }}</b><small>{{ messages.directoryHomeDesc }}</small></span><ChevronRight :size="17"/></button>
      <button class="mobile-directory-title" @click="navigate('/yaji.html')"><Gamepad2 :size="19"/><span><b>{{ messages.elegantGathering }}</b><small>{{ messages.elegantGatheringDesc }}</small></span><ChevronRight :size="16"/></button>
      <div class="mobile-future-items mobile-page-list">
        <button @click="navigate('/yaji.html#daily')"><CalendarDays :size="18"/><span><b>{{ messages.dailyPoem }}</b><small>{{ messages.dailyPoemDesc }}</small></span><ChevronRight :size="14"/></button>
        <button @click="navigate('/yaji.html#games')"><Gamepad2 :size="18"/><span><b>{{ messages.poetryInteraction }}</b><small>{{ messages.poetryInteractionDesc }}</small></span><ChevronRight :size="14"/></button>
      </div>
      <a class="mobile-directory-source" href="https://github.com/steamaa1/chinese-poetry-vue" target="_blank" rel="noopener"><Github :size="17"/> {{ messages.projectSource }} <ExternalLink :size="13"/></a>
    </aside>
  </div>
</template>
