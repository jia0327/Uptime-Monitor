<template>
  <div class="space-y-2.5 fade-up-d2" ref="listRef">
    <div class="flex flex-col gap-2 mb-3">
      <div class="flex items-center justify-between gap-3">
        <h2 class="text-xs font-semibold uppercase tracking-widest text-slate-500 shrink-0">监控列表</h2>
        <div class="flex items-center gap-2 flex-1 justify-end">
          <div class="relative">
            <i class="fas fa-search absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-500"></i>
            <input :value="searchQuery" @input="$emit('update:searchQuery', $event.target.value)" type="text" placeholder="搜索名称或 URL..." class="search-input">
          </div>
          <select :value="sortKey" @change="$emit('update:sortKey', $event.target.value)" class="text-[11px] font-mono bg-transparent border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg px-2 py-1.5 cursor-pointer focus:outline-none focus:border-green-500" style="appearance:none;-webkit-appearance:none">
            <option value="">默认排序</option><option value="name">按名称</option><option value="status">按状态</option><option value="latency">按延迟</option><option value="ssl">按SSL到期</option>
          </select>
          <span class="text-xs font-mono text-slate-500 dark:text-slate-600 shrink-0">{{ filteredMonitors.length }} / {{ monitors.length }}</span>
        </div>
      </div>
      <!-- Tag 筛选 -->
      <div v-if="allTags.length > 0" class="flex flex-wrap items-center gap-1.5">
        <button class="tag-filter-btn" :class="!activeTag ? 'active' : ''" @click="$emit('update:activeTag', '')">全部</button>
        <button v-for="tag in allTags" :key="tag" class="tag-filter-btn" :class="activeTag === tag ? 'active' : ''" @click="$emit('update:activeTag', activeTag === tag ? '' : tag)">{{ tag }}</button>
      </div>
      <!-- 批量操作栏 -->
      <div v-if="selectedIds.length > 0" class="bulk-bar">
        <span class="text-xs text-green-400 font-medium">已选 {{ selectedIds.length }} 项</span>
        <button @click="$emit('batch-action', 'pause')" class="text-xs px-3 py-1.5 rounded-lg bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 transition cursor-pointer"><i class="fas fa-pause mr-1"></i>暂停</button>
        <button @click="$emit('batch-action', 'resume')" class="text-xs px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 hover:bg-green-500/25 transition cursor-pointer"><i class="fas fa-play mr-1"></i>恢复</button>
        <button @click="$emit('batch-action', 'delete')" class="text-xs px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 transition cursor-pointer"><i class="fas fa-trash mr-1"></i>删除</button>
        <button @click="$emit('update:selectedIds', [])" class="ml-auto text-xs text-slate-500 hover:text-white cursor-pointer"><i class="fas fa-times"></i></button>
      </div>
    </div>

    <!-- 监控卡片列表 -->
    <div v-for="m in filteredMonitors" :key="m.id"
      class="relative glass rounded-xl px-5 py-4 card-hover flex flex-col md:flex-row md:items-center md:justify-between gap-4 cursor-default group"
      :class="[m.paused ? 'opacity-50' : '', m.interval === 0 ? 'opacity-80' : '', openMenuId === m.id ? 'z-40' : 'z-0']">
      <div class="flex items-center gap-3 min-w-0">
        <div class="drag-handle shrink-0 cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" title="拖拽排序">
          <i class="fas fa-grip-vertical text-sm"></i>
        </div>
        <input type="checkbox" :value="m.id" :checked="selectedIds.includes(m.id)" @change="toggleSelected(m.id)"
          class="w-4 h-4 rounded accent-green-500 shrink-0 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          :class="selectedIds.includes(m.id) ? 'opacity-100' : ''">
        <div class="relative shrink-0">
          <div class="w-2.5 h-2.5 rounded-full" :class="{ 'bg-green-400': m.status === 'UP' && m.interval !== 0, 'bg-red-400': m.status === 'DOWN', 'bg-yellow-400': m.status === 'RETRYING', 'bg-slate-500': m.status === 'PAUSED', 'bg-blue-400': m.interval === 0 }"></div>
          <div v-if="m.status === 'UP' && m.interval !== 0" class="absolute inset-0 w-2.5 h-2.5 rounded-full bg-green-400/40 animate-ping"></div>
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2 mb-0.5">
            <a v-if="getAdminVisitUrl(m)" :href="getAdminVisitUrl(m)" target="_blank" rel="noopener" :title="getAdminVisitUrl(m)"
              class="font-semibold text-slate-900 dark:text-white truncate underline underline-offset-[3px] decoration-slate-400/50 hover:decoration-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
              {{ m.name }}
            </a>
            <h3 v-else class="font-semibold text-slate-900 dark:text-white truncate">{{ m.name }}</h3>
            <span class="text-[10px] font-mono text-slate-600 shrink-0">{{ m.method || 'GET' }}</span>
            <span v-if="m.interval === 0" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">书签</span>
            <span v-if="m.is_private === 1" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400"><i class="fas fa-lock text-[8px] mr-0.5"></i>私密</span>
            <span v-if="m.status === 'DOWN'" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 animate-pulse">DOWN</span>
            <span v-if="m.status === 'RETRYING'" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-yellow-500/20 text-yellow-400">重试中</span>
            <span v-if="m.paused" class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-700 text-slate-400">已暂停</span>
          </div>
          <div class="flex flex-wrap items-center gap-1.5 mt-1">
            <span v-if="m.keyword" class="text-[10px] text-slate-600 flex items-center gap-1"><i class="fas fa-filter text-[8px]"></i>{{ m.keyword }}</span>
            <span v-for="tag in parseTags(m.tags)" :key="tag" class="tag-chip">{{ tag }}</span>
          </div>
        </div>
      </div>
      <!-- 右侧状态与操作 -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full md:w-auto border-t md:border-t-0 border-slate-100 dark:border-white/5 pt-3 md:pt-0">
        <div class="flex flex-wrap sm:grid sm:grid-cols-4 md:flex md:items-center gap-3 md:gap-4 text-left md:text-right flex-1 md:flex-none w-full sm:w-auto">
          <div v-if="m._latency != null && !m.paused && m.interval !== 0" class="flex flex-col w-[calc(50%-6px)] sm:w-auto">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-600 font-bold">Latency</span>
            <span class="text-[11px] font-mono font-bold" :class="m._latency < 200 ? 'text-green-500' : m._latency < 500 ? 'text-yellow-500' : 'text-red-500'">{{ m._latency }}ms</span>
          </div>
          <div v-if="m._sparkData && m._sparkData.length > 2 && !m.paused && m.interval !== 0" class="hidden lg:block">
            <svg class="w-[80px] h-[24px] mini-sparkline" :class="m.status === 'DOWN' ? 'text-red-500' : 'text-green-500'" viewBox="0 0 80 24" preserveAspectRatio="none">
              <path :d="miniSparkline(m._sparkData)" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
            </svg>
          </div>
          <div class="flex flex-col w-[calc(50%-6px)] sm:w-auto">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-600 font-bold">Interval</span>
            <span class="text-[11px] font-mono font-medium" :class="m.interval === 0 ? 'text-blue-400' : 'text-slate-500 dark:text-slate-400'">{{ formatIntervalLabel(m.interval) }}</span>
          </div>
          <div v-if="m.interval !== 0" class="flex flex-col w-[calc(50%-6px)] sm:w-auto">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-600 font-bold">Last Check</span>
            <span class="text-[11px] font-mono text-slate-500 dark:text-slate-400">{{ formatDateFull(m.last_check) }}</span>
          </div>
          <div v-if="m.interval !== 0" class="flex flex-col w-[calc(50%-6px)] sm:w-auto">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-600 font-bold">SSL</span>
            <span class="text-[11px] font-mono font-medium" :class="getExpiryClassAdmin(m.cert_expiry)">{{ m.cert_expiry ? getDaysRemaining(m.cert_expiry) + 'd · ' + formatExpiryDate(m.cert_expiry) : '-' }}</span>
          </div>
          <div v-if="m.interval !== 0" class="flex flex-col w-[calc(50%-6px)] sm:w-auto">
            <span class="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-600 font-bold">Domain</span>
            <span class="text-[11px] font-mono font-medium" :class="getExpiryClassAdmin(m.domain_expiry)">{{ m.domain_expiry ? getDaysRemaining(m.domain_expiry) + 'd' : '-' }}</span>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-end gap-0.5 sm:gap-1 w-full sm:w-auto border-t sm:border-t-0 border-slate-100 dark:border-white/5 pt-2 sm:pt-0 mt-1 sm:mt-0">
          <button @click="$emit('force-check', m)" class="p-2 text-slate-500 hover:text-green-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50" :disabled="m._checking || m.interval === 0" :title="m.interval === 0 ? '书签模式不检测' : '立即检查'">
            <i class="fas fa-sync-alt text-sm" :class="{ 'fa-spin text-green-400': m._checking }"></i>
          </button>
          <button @click="$emit('toggle-pause', m)" class="p-2 rounded-lg transition-colors cursor-pointer" :class="m.paused ? 'text-green-500 hover:bg-slate-100 dark:hover:bg-slate-800' : 'text-slate-400 dark:text-slate-500 hover:text-yellow-500 hover:bg-slate-100 dark:hover:bg-slate-800'" :title="m.paused ? '恢复监控' : '暂停监控'">
            <i :class="m.paused ? 'fas fa-play' : 'fas fa-pause'" class="text-sm"></i>
          </button>
          <button @click="$emit('open-config', m)" class="p-2 text-slate-500 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer" title="配置监控"><i class="fas fa-sliders-h text-sm"></i></button>
          <div class="relative">
            <button type="button" @click.stop="toggleMore(m.id)" class="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-500/10 rounded-lg transition-colors cursor-pointer" title="更多操作" aria-label="更多操作" :aria-expanded="openMenuId === m.id">
              <i class="fas fa-ellipsis-h text-sm"></i>
            </button>
            <div v-if="openMenuId === m.id" @click.stop data-more-menu class="absolute right-full top-1/2 z-50 mr-2 w-36 -translate-y-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 text-xs shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <button type="button" @click="runMore('view-logs', m)" class="w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-blue-400 cursor-pointer">
                <i class="fas fa-list-ul w-4"></i> 查看日志
              </button>
              <button type="button" @click="runMore('clone', m)" class="w-full px-3 py-2 text-left text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400 cursor-pointer">
                <i class="far fa-copy w-4"></i> 复制监控
              </button>
              <button type="button" @click="runMore('delete', m)" class="w-full px-3 py-2 text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer">
                <i class="far fa-trash-alt w-4"></i> 删除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import Sortable from 'sortablejs';
import { formatDateFull, formatExpiryDate, getDaysRemaining, getExpiryClassAdmin } from '../../utils/format';
import { formatIntervalLabel, parseTags, getAdminVisitUrl } from '../../utils/monitor';

const props = defineProps({
    monitors: Array, filteredMonitors: Array, allTags: Array,
    activeTag: String, selectedIds: Array, searchQuery: String, sortKey: String,
});
const emit = defineEmits([
    'update:activeTag', 'update:selectedIds', 'update:searchQuery', 'update:sortKey',
    'force-check', 'toggle-pause', 'open-config', 'view-logs', 'clone', 'delete', 'batch-action', 'reorder'
]);

const listRef = ref(null);
const openMenuId = ref(null);
let sortableInstance = null;

const toggleMore = (id) => {
    openMenuId.value = openMenuId.value === id ? null : id;
};

const closeMore = () => {
    openMenuId.value = null;
};

const runMore = (eventName, monitor) => {
    closeMore();
    emit(eventName, monitor);
};

const toggleSelected = (id) => {
    const current = [...props.selectedIds];
    const idx = current.indexOf(id);
    if (idx >= 0) current.splice(idx, 1); else current.push(id);
    emit('update:selectedIds', current);
};

const miniSparkline = (lats) => {
    if (!lats || lats.length < 2) return '';
    const W = 80, H = 24, P = 2;
    const max = Math.max(...lats), min = Math.min(...lats);
    const range = max - min || 1;
    return lats.map((v, i) => {
        const x = P + (i / (lats.length - 1)) * (W - 2 * P);
        const y = H - P - ((v - min) / range) * (H - 2 * P);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
};

const initSortable = () => {
    if (sortableInstance) sortableInstance.destroy();
    const el = listRef.value;
    if (!el) return;
    sortableInstance = new Sortable(el, {
        handle: '.drag-handle', animation: 200, ghostClass: 'opacity-30', draggable: '.card-hover',
        onEnd: () => {
            const cards = el.querySelectorAll('.card-hover');
            const ids = [...cards].map((_, idx) => props.filteredMonitors[idx]?.id).filter(Boolean);
            if (ids.length > 0) emit('reorder', ids);
        }
    });
};

watch(() => props.filteredMonitors.length, () => nextTick(initSortable));
onMounted(() => {
    nextTick(initSortable);
    window.addEventListener('click', closeMore);
});
onBeforeUnmount(() => {
    window.removeEventListener('click', closeMore);
    if (sortableInstance) sortableInstance.destroy();
});
</script>
