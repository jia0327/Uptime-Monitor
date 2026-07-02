<template>
  <div class="glass-card monitor-card rounded-xl px-5 py-3.5 cursor-default group"
    :class="[
      monitor.paused ? 'opacity-50 monitor-status-paused' : '',
      isBookmark ? 'monitor-status-bookmark' : '',
      monitor.status === 'UP' && !monitor.paused && !isBookmark ? 'monitor-status-up' : '',
      monitor.status === 'DOWN' && !isBookmark ? 'monitor-status-down' : '',
      monitor.status === 'RETRYING' && !isBookmark ? 'monitor-status-retrying' : '',
    ]"
    :style="{ animationDelay: (index * 0.06) + 's' }">

    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-3">
          <div class="relative shrink-0">
            <div class="w-2.5 h-2.5 rounded-full"
              :class="{
                'bg-emerald-400': monitor.status === 'UP' && !monitor.paused && !isBookmark,
                'bg-red-400': monitor.status === 'DOWN' && !isBookmark,
                'bg-yellow-400': monitor.status === 'RETRYING' && !isBookmark,
                'bg-slate-400 dark:bg-slate-600': monitor.paused,
                'bg-blue-400': isBookmark && !monitor.paused,
                'bg-purple-400': isPrivate && !isBookmark && !monitor.paused,
              }"></div>
            <div v-if="monitor.status === 'UP' && !monitor.paused && !isBookmark && !isPrivate" class="absolute inset-0 rounded-full bg-emerald-400/40 pulse-dot"></div>
          </div>
          <h3 class="font-bold text-slate-900 dark:text-white text-base truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5 min-w-0">
            <span class="truncate">{{ monitor.name }}</span>
            <span v-if="isPrivate" class="inline-flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/10 text-purple-500 dark:text-purple-300 border border-purple-500/20" title="私密监控，链接不公开">
              <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            </span>
          </h3>
        </div>

        <div class="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 pl-5">
          <a v-if="!isPrivate && monitor.url" :href="monitor.url" target="_blank" rel="noopener" class="text-[11px] sm:text-[13px] font-mono text-slate-500 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors truncate max-w-full sm:max-w-[420px] cursor-pointer flex items-center gap-1.5 group/link">
            {{ monitor.url }}
            <svg class="w-2.5 h-2.5 opacity-70 group-hover/link:opacity-100 transition-opacity duration-200 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
          </a>
          <span v-if="!isBookmark" class="text-[10px] sm:text-[11px] font-mono text-slate-400 dark:text-slate-600">{{ formatDate(monitor.last_check) }}</span>
          <span v-if="monitor.cert_expiry && !isBookmark" class="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono border" :class="getExpiryClass(monitor.cert_expiry)">
            <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
            SSL {{ formatExpiry(monitor.cert_expiry) }} · {{ formatExpiryDate(monitor.cert_expiry) }}
          </span>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap items-center gap-2 md:justify-end monitor-meta">
        <span v-if="isPrivate && !isBookmark" class="inline-flex min-w-[64px] justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/20">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
          私密
        </span>
        <span v-if="isBookmark" class="inline-flex min-w-[64px] justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20">书签</span>
        <span v-else-if="monitor.paused" class="inline-flex min-w-[64px] justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">暂停</span>
        <span v-else-if="monitor.status === 'UP'" class="inline-flex min-w-[64px] justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/20">在线</span>
        <span v-else-if="monitor.status === 'DOWN'" class="inline-flex min-w-[64px] justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/25">异常</span>
        <span v-else class="inline-flex min-w-[64px] justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors bg-yellow-50 dark:bg-yellow-400/10 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-400/25">重试中</span>

        <div v-if="monitor.latency != null && !monitor.paused && !isBookmark" class="latency-badge flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-medium border cursor-default"
          :class="latencyClass(monitor.latency)">
          <svg class="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
          {{ monitor.latency }}ms
        </div>

        <div v-if="monitor.uptime_24h != null && !monitor.paused && !isBookmark" class="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-mono font-bold border"
          :class="monitor.uptime_24h >= 99.9 ? 'text-emerald-600 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' : monitor.uptime_24h >= 95 ? 'text-yellow-600 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-400/10 border-yellow-200 dark:border-yellow-400/20' : 'text-red-600 dark:text-red-300 bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20'">
          24h {{ monitor.uptime_24h }}%
        </div>

        <svg v-if="sparkline && !monitor.paused && !isBookmark" class="sparkline-wrap hidden lg:block w-[92px] h-[26px]" :class="monitor.status === 'DOWN' ? 'text-red-500' : monitor.status === 'RETRYING' ? 'text-yellow-500' : 'text-emerald-500'" viewBox="0 0 120 28" preserveAspectRatio="none" aria-label="延迟趋势">
          <path :d="sparkline.area" class="sparkline-area" fill="currentColor"/>
          <path :d="sparkline.line" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.7"/>
          <circle :cx="sparkline.dot.x" :cy="sparkline.dot.y" r="2.5" fill="currentColor" opacity="0.9"/>
        </svg>
      </div>
    </div>

    <UptimeBar v-if="monitor.daily_stats && monitor.daily_stats.length > 0 && !monitor.paused && !isBookmark" :monitor="monitor" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { formatDate, getExpiryClass, formatExpiry, formatExpiryDate, latencyClass } from '../../utils/format';
import { isBookmark as checkBookmark, isPrivate as checkPrivate } from '../../utils/monitor';
import UptimeBar from './UptimeBar.vue';

const props = defineProps({
    monitor: { type: Object, required: true },
    index:   { type: Number, required: true },
});

const isBookmark = computed(() => checkBookmark(props.monitor));
const isPrivate = computed(() => checkPrivate(props.monitor));

const sparkline = computed(() => {
    if (isBookmark.value) return null;
    const lats = props.monitor.recent_latencies;
    if (!lats || lats.length < 3) return null;

    const W = 120, H = 28, P = 2;
    const max = Math.max(...lats), min = Math.min(...lats);
    const range = max - min || 1;

    const pts = lats.map((v, i) => ({
        x: P + (i / (lats.length - 1)) * (W - 2 * P),
        y: H - P - ((v - min) / range) * (H - 2 * P),
    }));

    const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const ptStr = pts.map(p => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    const area = `M${ptStr[0]} L${ptStr.join(' L')} L${(W - P).toFixed(1)} ${H} L${P} ${H} Z`;

    return { line, area, dot: pts[pts.length - 1] };
});
</script>
