<template>
  <component
    :is="linkTag"
    v-bind="linkProps"
    class="glass-card rounded-xl px-4 py-3 flex items-center gap-3 transition-colors group"
    :class="clickable ? 'hover:border-blue-500/30 cursor-pointer' : 'cursor-default'"
    :style="{ animationDelay: (index * 0.04) + 's' }">

    <div class="w-2 h-2 rounded-full shrink-0" :class="isPrivate && !visitUrl ? 'bg-purple-400' : 'bg-blue-400'"></div>

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5 min-w-0">
        <span class="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">{{ monitor.name }}</span>
        <svg v-if="isPrivate" class="w-3 h-3 shrink-0 text-purple-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" title="私密"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/></svg>
      </div>
      <p v-if="visitUrl" class="text-[11px] font-mono text-slate-500 dark:text-slate-600 truncate mt-0.5">{{ visitUrl }}</p>
      <p v-else class="text-[11px] text-slate-500 dark:text-slate-600 mt-0.5">链接未公开</p>
    </div>

    <svg v-if="clickable" class="w-3.5 h-3.5 shrink-0 text-slate-400 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"/></svg>
  </component>
</template>

<script setup>
import { computed } from 'vue';
import { isPrivate as checkPrivate, getVisitUrl as resolveVisitUrl } from '../../utils/monitor';

const props = defineProps({
  monitor: { type: Object, required: true },
  index: { type: Number, default: 0 },
});

const isPrivate = computed(() => checkPrivate(props.monitor));
const visitUrl = computed(() => resolveVisitUrl(props.monitor));
const clickable = computed(() => !!visitUrl.value);
const linkTag = computed(() => clickable.value ? 'a' : 'div');
const linkProps = computed(() => clickable.value
  ? { href: visitUrl.value, target: '_blank', rel: 'noopener' }
  : {});
</script>
