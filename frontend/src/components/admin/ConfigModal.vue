<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-black/60 backdrop-blur-sm admin-modal-overlay" @click="emit('close')"></div>
    <div class="relative w-full max-w-xl glass admin-modal rounded-2xl shadow-2xl flex flex-col overflow-hidden" style="animation:modal-in 0.25s ease-out; max-height: 85vh">
      <div class="px-8 py-5 border-b border-white/5 bg-gradient-to-r from-purple-900/15 to-transparent flex justify-between items-center">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-purple-500/15 rounded-xl flex items-center justify-center"><i class="fas fa-sliders-h text-purple-400"></i></div>
          <div><h3 class="text-lg font-bold text-white">{{ configTarget?.name }}</h3><p class="text-xs text-slate-500 mt-0.5">功能开关与通知配置</p></div>
        </div>
        <button type="button" @click="emit('close')" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" aria-label="关闭">
          <i class="fas fa-times text-lg"></i>
        </button>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
        <!-- 基础信息 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><i class="fas fa-edit text-green-500 text-[10px]"></i> 基础信息</h4>
          <div class="space-y-3">
            <div><label class="block text-xs font-medium text-slate-400 mb-1">网站名称</label><input v-model="form.name" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none"></div>
            <div><label class="block text-xs font-medium text-slate-400 mb-1">检测 URL</label><input v-model="form.url" placeholder="用于 HTTP 探测的地址" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none font-mono"></div>
            <div><label class="block text-xs font-medium text-slate-400 mb-1">跳转链接 <span class="text-slate-600 font-normal">可选</span></label><input v-model="form.link_url" placeholder="状态页展示与点击跳转，检测 URL 不会公开" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none font-mono"></div>
            <div class="grid grid-cols-2 gap-3">
              <div><label class="block text-xs font-medium text-slate-400 mb-1">关键词验证</label><input v-model="form.keyword" placeholder="留空则不检测" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none"></div>
              <div><label class="block text-xs font-medium text-slate-400 mb-1">User-Agent</label><input v-model="form.user_agent" placeholder="Uptime-Monitor/1.0" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none font-mono text-xs"></div>
            </div>
          </div>
        </div>
        <!-- 高级请求设置 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2"><i class="fas fa-cogs text-blue-500 text-[10px]"></i> 高级请求设置</h4>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-400 mb-1">请求方法</label>
                <select v-model="form.method" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none"><option value="GET">GET</option><option value="POST">POST</option><option value="HEAD">HEAD</option><option value="PUT">PUT</option></select>
              </div>
              <div><label class="block text-xs font-medium text-slate-400 mb-1">标签</label><TagInput v-model="form.tags" :suggestions="allTags" list-id="config-monitor-tags" input-class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none placeholder-slate-600" /></div>
            </div>
            <div><label class="block text-xs font-medium text-slate-400 mb-1">自定义请求头</label><input v-model="form.request_headers" placeholder='{"Authorization":"Bearer xxx"}' class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white outline-none font-mono placeholder-slate-600 text-xs"></div>
            <div v-show="['POST','PUT','PATCH'].includes(form.method)"><label class="block text-xs font-medium text-slate-400 mb-1">请求体</label><textarea v-model="form.request_body" placeholder='{"key":"value"}' rows="2" class="w-full border border-slate-700 rounded-lg px-3 py-2 text-sm bg-slate-800/80 text-white outline-none font-mono placeholder-slate-600 resize-none text-xs"></textarea></div>
          </div>
        </div>
        <!-- 功能开关 -->
        <div v-show="!isBookmarkMode">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">检测功能</h4>
          <div class="space-y-3">
            <label class="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 cursor-pointer"><div class="flex items-center gap-2 text-sm text-slate-300"><i class="fas fa-lock text-blue-400 w-4"></i><span>SSL 证书到期检测</span></div><input type="checkbox" v-model="form.check_ssl" class="w-4 h-4 rounded accent-green-500"></label>
            <label class="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 cursor-pointer"><div class="flex items-center gap-2 text-sm text-slate-300"><i class="fas fa-globe text-green-400 w-4"></i><span>域名到期检测</span></div><input type="checkbox" v-model="form.check_domain" class="w-4 h-4 rounded accent-green-500"></label>
          </div>
        </div>
        <!-- 可见性 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">可见性</h4>
          <label class="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 cursor-pointer">
            <div class="flex items-center gap-2 text-sm text-slate-300"><i class="fas fa-lock text-purple-400 w-4"></i><div><span>私密监控</span><p class="text-xs text-slate-500 mt-0.5">公开页隐藏跳转链接，仅展示名称与状态</p></div></div>
            <input type="checkbox" v-model="form.is_private" class="w-4 h-4 rounded accent-purple-500">
          </label>
        </div>
        <!-- 监测频率 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">监测频率</h4>
          <div class="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            <button
              v-for="opt in intervalOptions"
              :key="'interval-' + opt.value"
              type="button"
              class="flex flex-col items-center justify-center py-2 rounded-lg border-2 cursor-pointer transition-all text-center text-sm font-bold"
              :class="Number(form.interval) === opt.value ? (opt.value === 0 ? 'border-blue-500 bg-blue-900/20 text-blue-400' : 'border-green-500 bg-green-900/20 text-green-400') : 'border-slate-700 text-slate-400 hover:border-green-500/40'"
              @click="setInterval(opt.value)"
            >{{ opt.label }}</button>
          </div>
          <p v-if="isBookmarkMode" class="mt-2 text-xs text-blue-400/80"><i class="fas fa-bookmark mr-1"></i>书签模式：不发起检测，下方告警设置已隐藏</p>
        </div>
        <!-- 告警静默窗口 -->
        <div v-show="!isBookmarkMode">
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">告警通知频率</h4>
          <p class="text-xs text-slate-500 mb-4">同一问题在选定时间内只发送一次告警，避免重复轰炸。下面三组分别对应不同类型的告警。</p>
          <div class="mb-5 pb-4 border-b border-slate-700/50">
            <div class="flex items-center gap-2 text-xs text-slate-400 mb-2"><i class="fas fa-exclamation-triangle text-orange-400 w-3"></i><span>错误率阈值告警</span></div>
            <div class="flex items-center justify-between bg-slate-900/50 p-3 rounded-lg border border-slate-700">
              <div class="text-xs text-slate-500 mr-2 flex-1">0=关闭。如设定 50，表示近 5 分钟内失败率 ≥50% 时才告警。</div>
              <div class="flex items-center gap-2 shrink-0">
                <input type="number" v-model.number="form.alert_error_rate" min="0" max="100" placeholder="0" class="w-16 border border-slate-700 rounded text-center px-1 py-1 text-sm bg-slate-800 text-white focus:border-green-500 outline-none block">
                <span class="text-slate-400 text-sm">%</span>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div v-for="item in silenceItems" :key="item.key">
              <div class="flex items-center gap-2 text-xs text-slate-400 mb-1"><i :class="item.icon + ' w-3'"></i><span>{{ item.label }}</span><span class="text-slate-600">· {{ item.desc }}</span></div>
              <div class="grid grid-cols-5 gap-1.5">
                <button
                  v-for="opt in silenceOptions"
                  :key="item.key + '-' + opt.value"
                  type="button"
                  class="flex flex-col items-center justify-center py-2 rounded-lg border-2 cursor-pointer transition-all text-center text-sm font-bold"
                  :class="Number(form[item.key]) === opt.value ? 'border-green-500 bg-green-900/20 text-green-400' : 'border-slate-700 text-slate-400 hover:border-green-500/40'"
                  :title="opt.hint"
                  @click="setSilence(item.key, opt.value)"
                >{{ opt.label }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="px-6 py-4 border-t border-white/5 bg-slate-900/30">
        <button type="button" @click="submitSave" :disabled="configSaving" class="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer">
          <i v-if="configSaving" class="fas fa-spinner fa-spin"></i><i v-else class="fas fa-save"></i>
          {{ configSaving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch } from 'vue';
import { MONITOR_INTERVAL_OPTIONS, isBookmark } from '../../utils/monitor';
import TagInput from './TagInput.vue';

const props = defineProps({
  configTarget: Object,
  configSaving: Boolean,
  allTags: { type: Array, default: () => [] },
});
const emit = defineEmits(['close', 'save']);

const intervalOptions = MONITOR_INTERVAL_OPTIONS;

const defaultForm = () => ({
  name: '',
  url: '',
  link_url: '',
  method: 'GET',
  keyword: '',
  user_agent: '',
  tags: '',
  request_headers: '',
  request_body: '',
  interval: 300,
  check_ssl: true,
  check_domain: true,
  alert_silence_uptime: 24,
  alert_silence_ssl: 24,
  alert_silence_domain: 24,
  alert_error_rate: 0,
  is_private: false,
});

const normalizeFromMonitor = (source = {}) => ({
  ...defaultForm(),
  name: source.name || '',
  url: source.url || '',
  link_url: source.link_url || '',
  method: source.method || 'GET',
  keyword: source.keyword || '',
  user_agent: source.user_agent || '',
  tags: source.tags || '',
  request_headers: source.request_headers || '',
  request_body: source.request_body || '',
  interval: Number(source.interval ?? 300),
  check_ssl: source.check_ssl !== 0 && source.check_ssl !== false,
  check_domain: source.check_domain !== 0 && source.check_domain !== false,
  is_private: source.is_private === 1 || source.is_private === true,
  alert_silence_uptime: Number(source.alert_silence_uptime ?? 24),
  alert_silence_ssl: Number(source.alert_silence_ssl ?? 24),
  alert_silence_domain: Number(source.alert_silence_domain ?? 24),
  alert_error_rate: Number(source.alert_error_rate ?? 0),
});

const form = reactive(defaultForm());

watch(
  () => props.configTarget?.id,
  () => {
    if (!props.configTarget) return;
    Object.assign(form, normalizeFromMonitor(props.configTarget));
  },
  { immediate: true },
);

const isBookmarkMode = computed(() => isBookmark(form));

const setInterval = (value) => {
  form.interval = Number(value);
  if (Number(value) === 0) {
    form.check_ssl = false;
    form.check_domain = false;
    form.alert_error_rate = 0;
  }
};

const setSilence = (key, value) => {
  form[key] = Number(value);
};

const submitSave = () => {
  emit('save', {
    name: form.name,
    url: form.url,
    link_url: form.link_url,
    method: form.method,
    keyword: form.keyword,
    user_agent: form.user_agent,
    tags: form.tags,
    request_headers: form.request_headers,
    request_body: form.request_body,
    interval: Number(form.interval),
    check_ssl: form.check_ssl,
    check_domain: form.check_domain,
    is_private: form.is_private,
    alert_silence_uptime: Number(form.alert_silence_uptime),
    alert_silence_ssl: Number(form.alert_silence_ssl),
    alert_silence_domain: Number(form.alert_silence_domain),
    alert_error_rate: Number(form.alert_error_rate ?? 0),
  });
};

const silenceOptions = [
  { value: 1, label: '1h', hint: '1 小时' },
  { value: 4, label: '4h', hint: '4 小时' },
  { value: 12, label: '12h', hint: '12 小时' },
  { value: 24, label: '24h', hint: '24 小时' },
  { value: 72, label: '72h', hint: '72 小时' },
];
const silenceItems = [
  { key: 'alert_silence_uptime', label: '可用性告警', desc: '服务宕机/恢复', icon: 'fas fa-heartbeat text-red-400' },
  { key: 'alert_silence_ssl', label: 'SSL 证书告警', desc: '证书即将到期', icon: 'fas fa-lock text-blue-400' },
  { key: 'alert_silence_domain', label: '域名到期告警', desc: '域名即将到期', icon: 'fas fa-globe text-green-400' },
];
</script>
