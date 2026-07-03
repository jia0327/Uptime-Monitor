<template>
  <div class="min-h-screen flex flex-col text-slate-800 dark:text-slate-200 grid-bg">
    <StatusHeader :loading="loading" :isDark="isDark" :siteSettings="siteSettings" @toggle-theme="toggleTheme" />

    <main class="flex-1 max-w-5xl w-full mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-6 fade-up">
        <div class="flex items-center gap-3">
          <div class="w-1 h-5 rounded-full bg-blue-500"></div>
          <div>
            <h1 class="text-sm font-bold text-slate-600 dark:text-slate-400">书签</h1>
            <p class="text-[11px] text-slate-500 dark:text-slate-600 mt-0.5">内网或私有链接，不参与可用性检测</p>
          </div>
        </div>
        <span v-if="bookmarkItems.length > 0" class="text-[11px] font-mono text-slate-400 dark:text-slate-600">{{ bookmarkItems.length }} 项</span>
      </div>

      <div v-if="loading && bookmarkItems.length === 0" class="space-y-3 fade-up-d1">
        <div v-for="i in 4" :key="i" class="glass rounded-2xl h-16 animate-pulse"></div>
      </div>

      <div v-else-if="!loading && bookmarkItems.length === 0" class="text-center py-24 glass rounded-2xl border border-dashed border-slate-200 dark:border-white/[0.06] fade-up-d1">
        <div class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"/>
          </svg>
        </div>
        <p class="text-slate-400 dark:text-slate-600 font-mono text-sm tracking-widest">NO BOOKMARKS</p>
        <p class="text-xs text-slate-500 dark:text-slate-600 mt-2">暂无书签，可在管理后台添加「不检测」模式的监控项</p>
        <router-link to="/" class="inline-flex items-center gap-1.5 mt-4 text-xs text-blue-500 hover:text-blue-400 transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"/></svg>
          返回状态页
        </router-link>
      </div>

      <template v-else>
        <div v-if="categoryNames.length > 1" class="flex flex-wrap items-center gap-1.5 mb-6 fade-up-d1">
          <button class="tag-filter-btn" :class="!activeTag ? 'active' : ''" @click="activeTag = ''">全部</button>
          <button v-for="tag in categoryNames" :key="tag" class="tag-filter-btn" :class="activeTag === tag ? 'active' : ''" @click="activeTag = activeTag === tag ? '' : tag">{{ tag }}</button>
        </div>

        <div class="space-y-8 fade-up-d2">
          <section v-for="section in visibleSections" :key="section.name" class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <h2 class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                {{ section.name }}
              </h2>
              <span class="text-[11px] font-mono text-slate-400 dark:text-slate-600">{{ section.items.length }} 项</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <BookmarkCard v-for="(m, idx) in section.items" :key="m.id" :monitor="m" :index="idx" />
            </div>
          </section>
        </div>
      </template>
    </main>

    <StatusFooter :loading="loading" :refreshing="refreshing" @refresh="manualRefresh" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTheme } from '../composables/useTheme';
import { API_BASE, fetchT, withRetry } from '../utils/api';
import { isBookmark, groupMonitorsByTag } from '../utils/monitor';

import StatusHeader from '../components/status/StatusHeader.vue';
import BookmarkCard from '../components/status/BookmarkCard.vue';
import StatusFooter from '../components/status/StatusFooter.vue';

const { isDark, toggleTheme } = useTheme('theme');

const monitors = ref([]);
const loading = ref(false);
const refreshing = ref(false);
const activeTag = ref('');
const siteSettings = ref({ site_title: 'Uptime Monitor', site_description: '', site_logo_url: '' });

const bookmarkItems = computed(() => monitors.value.filter(m => isBookmark(m)));
const bookmarkSections = computed(() => groupMonitorsByTag(bookmarkItems.value));
const categoryNames = computed(() => bookmarkSections.value.map(s => s.name));
const visibleSections = computed(() => {
    if (!activeTag.value) return bookmarkSections.value;
    return bookmarkSections.value.filter(s => s.name === activeTag.value);
});

const fetchMonitors = async () => {
    loading.value = true;
    try {
        const res = await withRetry(() => fetchT(`${API_BASE}/monitors/public/details`));
        if (res.ok) {
            const data = await res.json();
            monitors.value = data.monitors || [];
        }
    } catch {} finally {
        loading.value = false;
    }
};

const manualRefresh = async () => {
    refreshing.value = true;
    await fetchMonitors();
    setTimeout(() => { refreshing.value = false; }, 700);
};

const fetchSettings = async () => {
    try {
        const r = await fetchT(`${API_BASE}/settings`);
        if (r.ok) {
            const d = await r.json();
            siteSettings.value = d;
            if (d.site_title) document.title = d.site_title + ' — 书签';
            const meta = document.querySelector('meta[name=description]');
            if (meta && d.site_description) meta.content = d.site_description;
        }
    } catch {}
};

onMounted(() => {
    fetchMonitors();
    fetchSettings();
});
</script>
