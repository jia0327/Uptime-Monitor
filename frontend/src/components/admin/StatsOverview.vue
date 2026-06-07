<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4 fade-up-d1">
    <div class="glass rounded-xl px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold text-slate-500">总计</p>
          <p class="text-xl font-bold text-slate-900 dark:text-white font-mono">{{ stats.total }}</p>
        </div>
        <i class="fas fa-server text-slate-400 dark:text-slate-500 text-sm"></i>
      </div>
    </div>
    <div class="glass rounded-xl px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold text-emerald-500">在线</p>
          <p class="text-xl font-bold text-emerald-500 font-mono">{{ stats.online }}</p>
        </div>
        <i class="fas fa-check text-emerald-400 text-sm"></i>
      </div>
    </div>
    <div class="glass rounded-xl px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold text-red-400">故障</p>
          <p class="text-xl font-bold text-red-400 font-mono">{{ stats.offline }}</p>
        </div>
        <i class="fas fa-times text-red-400 text-sm"></i>
      </div>
    </div>
    <div class="glass rounded-xl px-4 py-3">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-[11px] font-semibold text-slate-500">暂停</p>
          <p class="text-xl font-bold text-slate-600 dark:text-slate-400 font-mono">{{ stats.paused }}</p>
        </div>
        <i class="fas fa-pause text-slate-400 dark:text-slate-500 text-sm"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ stats: Object });
</script>
