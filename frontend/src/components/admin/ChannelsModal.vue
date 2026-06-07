<template>
  <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0" enter-to-class="opacity-100">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm admin-modal-overlay" @click="$emit('close')"></div>
      <div class="relative w-full max-w-5xl max-h-[88vh] overflow-hidden flex flex-col glass admin-modal rounded-2xl shadow-2xl" style="animation:modal-in 0.25s ease-out">
        <div class="px-5 sm:px-6 py-5 border-b border-white/5 bg-gradient-to-r from-green-900/15 to-transparent">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-green-500/15 flex items-center justify-center shrink-0">
                <i class="fas fa-bell text-green-400"></i>
              </div>
              <div class="min-w-0">
                <h3 class="text-lg font-bold text-white">通知渠道管理</h3>
                <p class="text-xs text-slate-500 mt-0.5">配置告警、恢复与检测失败的推送目标</p>
              </div>
            </div>
            <div class="flex items-center gap-2 sm:justify-end">
              <div class="hidden sm:flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/30 px-3 py-2 text-xs">
                <span class="text-slate-500">启用</span>
                <span class="font-mono font-bold text-green-400">{{ enabledCount }}</span>
                <span class="text-slate-600">/</span>
                <span class="font-mono text-slate-400">{{ channels.length }}</span>
              </div>
              <button @click="startCreate()" class="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-colors cursor-pointer">
                <i class="fas fa-plus text-xs"></i> 添加渠道
              </button>
              <button @click="$emit('close')" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors cursor-pointer" aria-label="关闭">
                <i class="fas fa-times text-lg"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-5 sm:p-6">
          <div class="grid gap-5 lg:grid-cols-3">
            <section class="lg:col-span-2 space-y-3">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">渠道列表</h4>
                  <p class="text-xs text-slate-600 mt-1">点击渠道卡片可编辑配置。</p>
                </div>
                <button @click="fetchChannels" :disabled="channelsLoading" class="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-green-400 hover:border-green-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:opacity-50 transition-colors cursor-pointer">
                  <i class="fas fa-sync-alt text-[10px]" :class="{ 'fa-spin': channelsLoading }"></i> 刷新
                </button>
              </div>

              <div v-if="channelError" class="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 flex items-center gap-3">
                <i class="fas fa-exclamation-circle text-orange-400 shrink-0"></i>
                <p class="text-sm text-orange-300 flex-1">{{ channelError }}</p>
                <button @click="fetchChannels" class="text-xs font-semibold text-orange-300 hover:text-orange-200 cursor-pointer">重试</button>
              </div>

              <div v-if="channelsLoading && channels.length === 0" class="space-y-3">
                <div v-for="i in 3" :key="i" class="h-24 rounded-xl bg-slate-800/50 animate-pulse"></div>
              </div>

              <div v-else-if="channels.length === 0" class="rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-6 py-12 text-center">
                <div class="mx-auto mb-4 w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                  <i class="fas fa-bell-slash text-slate-500"></i>
                </div>
                <h4 class="text-base font-bold text-white">还没有通知渠道</h4>
                <p class="text-sm text-slate-500 mt-1 mb-5">添加一个渠道后，站点异常和恢复消息会推送到这里。</p>
                <button @click="startCreate()" class="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-colors cursor-pointer">
                  <i class="fas fa-plus text-xs"></i> 添加第一个渠道
                </button>
              </div>

              <div v-else class="space-y-3">
                <article v-for="ch in channels" :key="ch.id"
                  class="rounded-xl border px-4 py-4 transition-all"
                  :class="editing?.id === ch.id ? 'border-green-500/50 bg-green-500/10 shadow-lg shadow-green-500/5' : 'border-slate-700 bg-slate-900/35 hover:border-slate-600 hover:bg-slate-900/55'">
                  <div class="flex flex-col md:flex-row md:items-center gap-4">
                    <div class="flex items-center gap-3 min-w-0 flex-1 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                      role="button" tabindex="0" @click="editCh(ch)" @keydown.enter.prevent="editCh(ch)" @keydown.space.prevent="editCh(ch)"
                      :aria-label="`编辑通知渠道：${ch.name}`">
                      <div class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" :class="getTypeInfo(ch.type).bg">
                        <i :class="getTypeInfo(ch.type).iconClass"></i>
                      </div>
                      <div class="min-w-0">
                        <div class="flex flex-wrap items-center gap-2">
                          <h5 class="text-sm font-bold text-white truncate">{{ ch.name }}</h5>
                          <span class="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">{{ getTypeInfo(ch.type).label }}</span>
                          <span v-if="isEnabled(ch)" class="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-green-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                            已启用
                          </span>
                          <span v-else class="inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                            <span class="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            已停用
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 mt-1">{{ getTypeInfo(ch.type).desc }}</p>
                      </div>
                    </div>

                    <div class="flex items-center justify-between md:justify-end gap-2 shrink-0">
                      <button @click.stop="toggleCh(ch)" :disabled="togglingId === ch.id"
                        class="relative w-14 h-9 rounded-full transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:opacity-60"
                        :class="isEnabled(ch) ? 'bg-green-600' : 'bg-slate-700'"
                        role="switch" :aria-checked="isEnabled(ch)" :aria-label="`${isEnabled(ch) ? '停用' : '启用'}通知渠道：${ch.name}`" :title="isEnabled(ch) ? '停用渠道' : '启用渠道'">
                        <span class="absolute top-1 w-7 h-7 rounded-full bg-white shadow transition-all" :class="isEnabled(ch) ? 'left-6' : 'left-1'"></span>
                      </button>
                      <button @click.stop="testCh(ch)" :disabled="testingId === ch.id" class="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-400 hover:bg-green-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:opacity-60 transition-colors cursor-pointer" :aria-label="`测试通知渠道：${ch.name}`">
                        <i class="fas text-[10px]" :class="testingId === ch.id ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                        测试
                      </button>
                      <button @click.stop="editCh(ch)" class="w-9 h-9 rounded-lg flex items-center justify-center text-blue-500/80 hover:text-blue-400 hover:bg-blue-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-colors cursor-pointer" :aria-label="`编辑通知渠道：${ch.name}`" title="编辑">
                        <i class="fas fa-pen text-xs"></i>
                      </button>
                      <button @click.stop="deleteCh(ch)" :disabled="deletingId === ch.id" class="w-9 h-9 rounded-lg flex items-center justify-center text-red-500/80 hover:text-red-400 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 disabled:opacity-50 transition-colors cursor-pointer" :aria-label="`删除通知渠道：${ch.name}`" title="删除">
                        <i class="fas text-xs" :class="deletingId === ch.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                      </button>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <aside class="lg:col-span-1">
              <div v-if="!editing" class="rounded-2xl border border-slate-700 bg-slate-900/30 p-5">
                <div class="w-11 h-11 rounded-xl bg-green-500/15 flex items-center justify-center mb-4">
                  <i class="fas fa-route text-green-400"></i>
                </div>
                <h4 class="text-base font-bold text-white">选择或添加渠道</h4>
                <p class="text-sm text-slate-500 mt-1 mb-5">从左侧选择已有渠道，或直接选择一种类型开始添加。</p>
                <div class="grid grid-cols-2 gap-2">
                  <button v-for="item in channelTypeOptions" :key="item.key" @click="startCreate(item.key)"
                    class="rounded-xl border border-slate-700 bg-slate-900/50 px-3 py-3 text-left hover:border-green-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-colors cursor-pointer">
                    <i :class="item.iconClass"></i>
                    <span class="block text-xs font-semibold text-slate-300 mt-2">{{ item.label }}</span>
                  </button>
                </div>
              </div>

              <div v-else class="rounded-2xl border border-slate-700 bg-slate-900/30 overflow-hidden">
                <div class="px-5 py-4 border-b border-slate-700/70 bg-slate-900/35">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3 min-w-0">
                      <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" :class="currentEditingInfo.bg">
                        <i :class="currentEditingInfo.iconClass"></i>
                      </div>
                      <div class="min-w-0">
                        <h4 class="text-base font-bold text-white">{{ editing.id ? '编辑渠道' : '添加渠道' }}</h4>
                        <p class="text-xs text-slate-500 mt-0.5">{{ currentEditingInfo.label }} 通知配置</p>
                      </div>
                    </div>
                    <button @click="editing = null" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors cursor-pointer" title="收起表单" aria-label="收起表单">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div class="p-5 space-y-5">
                  <div v-if="!editing.id">
                    <label class="block text-xs font-semibold text-slate-400 mb-2">渠道类型</label>
                    <div class="grid grid-cols-2 gap-2">
                      <button v-for="item in channelTypeOptions" :key="item.key" @click="selectType(item.key)"
                        class="rounded-xl border px-3 py-3 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer"
                        :class="editing.type === item.key ? 'border-green-500 bg-green-900/20' : 'border-slate-700 bg-slate-900/40 hover:border-green-500/40'">
                        <i :class="item.iconClass"></i>
                        <span class="block text-xs font-semibold mt-2" :class="editing.type === item.key ? 'text-green-400' : 'text-slate-300'">{{ item.label }}</span>
                        <span v-if="item.badge" class="block text-[10px] text-slate-500 mt-0.5">{{ item.badge }}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label class="block text-xs font-semibold text-slate-400 mb-2">渠道名称 <span class="text-red-400">*</span></label>
                    <input v-model="editing.name" placeholder="例如：研发群机器人" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white focus:border-green-500 outline-none placeholder-slate-600">
                  </div>

                  <template v-if="editing.type === 'dingtalk'">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Access Token</label>
                      <input v-model="editing.config.access_token" :placeholder="editing.id ? '留空则保留原密钥' : '机器人的 access_token'" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">签名密钥 <span class="text-slate-600">可选</span></label>
                      <input v-model="editing.config.secret" :placeholder="editing.id ? '留空则保留原密钥' : '加签 Secret'" type="password" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                  </template>

                  <template v-if="editing.type === 'wecom'">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Webhook Key</label>
                      <input v-model="editing.config.key" :placeholder="editing.id ? '留空则保留原密钥' : 'Webhook URL 中的 key'" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                  </template>

                  <template v-if="editing.type === 'feishu'">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Webhook URL</label>
                      <input v-model="editing.config.webhook_url" type="url" placeholder="https://open.feishu.cn/..." class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">签名密钥 <span class="text-slate-600">可选</span></label>
                      <input v-model="editing.config.secret" type="password" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                  </template>

                  <template v-if="editing.type === 'telegram'">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Bot Token</label>
                      <input v-model="editing.config.bot_token" type="password" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Chat ID</label>
                      <input v-model="editing.config.chat_id" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                  </template>

                  <template v-if="editing.type === 'webhook'">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Webhook URL</label>
                      <input v-model="editing.config.url" type="url" placeholder="https://your-server.com/webhook" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">HTTP Method</label>
                      <select v-model="editing.config.method" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none font-mono">
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">自定义 Headers</label>
                      <input v-model="editing.config.headers" placeholder='{"Authorization":"Bearer xxx"}' class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                  </template>

                  <template v-if="editing.type === 'email'">
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">Resend API Key</label>
                      <input v-model="editing.config.api_key" type="password" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">发件人邮箱</label>
                      <input v-model="editing.config.from_email" placeholder="Uptime Monitor <notify@yourdomain.com>" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                    <div>
                      <label class="block text-xs font-semibold text-slate-400 mb-2">收件人邮箱</label>
                      <input v-model="editing.config.to_email" type="email" placeholder="admin@example.com" class="input-field w-full border border-slate-700 rounded-xl px-4 py-3 text-sm bg-slate-800/80 text-white outline-none placeholder-slate-600 font-mono">
                    </div>
                  </template>
                </div>

                <div class="px-5 py-4 border-t border-slate-700/70 bg-slate-900/35 flex flex-col sm:flex-row gap-2 sm:justify-end">
                  <button @click="editing = null" class="px-4 py-2.5 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors cursor-pointer">
                    取消
                  </button>
                  <button @click="saveCh" :disabled="saving" class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400 transition-colors disabled:opacity-50 cursor-pointer">
                    <i class="fas text-xs" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                    {{ saving ? '保存中...' : (editing.id ? '保存修改' : '添加渠道') }}
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useToast } from '../../composables/useToast';
import { API_BASE, fetchT } from '../../utils/api';

const emit = defineEmits(['close']);
const { storedToken } = useAuth();
const { addToast } = useToast();

const channels = ref([]);
const channelsLoading = ref(false);
const channelError = ref('');
const editing = ref(null);
const saving = ref(false);
const testingId = ref(null);
const togglingId = ref(null);
const deletingId = ref(null);

const typeInfo = {
    wecom: { iconClass: 'fab fa-weixin text-green-400 text-lg', label: '企业微信', desc: '适合企业微信群机器人', bg: 'bg-green-900/40' },
    feishu: { iconClass: 'fas fa-paper-plane text-purple-400 text-lg', label: '飞书', desc: '适合飞书群机器人', bg: 'bg-purple-900/40' },
    dingtalk: { iconClass: 'fas fa-comment-dots text-blue-400 text-lg', label: '钉钉', desc: '适合钉钉自定义机器人', bg: 'bg-blue-900/40' },
    webhook: { iconClass: 'fas fa-link text-orange-400 text-lg', label: 'Webhook', desc: '推送到自定义 HTTP 接口', bg: 'bg-orange-900/40' },
    telegram: { iconClass: 'fab fa-telegram text-sky-400 text-lg', label: 'Telegram', desc: '通过 Bot 推送到聊天', badge: '海外', bg: 'bg-sky-900/40' },
    email: { iconClass: 'fas fa-envelope text-rose-400 text-lg', label: 'Email', desc: '通过 Resend 发送邮件', badge: '海外', bg: 'bg-rose-900/40' },
};

const fallbackTypeInfo = { iconClass: 'fas fa-bell text-slate-400 text-lg', label: '未知渠道', desc: '自定义通知渠道', bg: 'bg-slate-700' };
const channelTypeOptions = computed(() => Object.entries(typeInfo).map(([key, info]) => ({ key, ...info })));
const enabledCount = computed(() => channels.value.filter(ch => isEnabled(ch)).length);
const currentEditingInfo = computed(() => editing.value ? getTypeInfo(editing.value.type) : fallbackTypeInfo);

const getTypeInfo = (type) => typeInfo[type] || { ...fallbackTypeInfo, label: type || fallbackTypeInfo.label };
const isEnabled = (ch) => ch.enabled === true || Number(ch.enabled) === 1;

const authFetch = async (url, options = {}) => {
    const headers = { ...options.headers, 'Authorization': `Bearer ${storedToken.value}` };
    return fetchT(url, { ...options, headers });
};

const fetchChannels = async () => {
    channelsLoading.value = true;
    channelError.value = '';
    try {
        const res = await authFetch(`${API_BASE}/notification-channels`);
        if (res?.ok) channels.value = await res.json();
        else channelError.value = '通知渠道加载失败';
    } catch {
        channelError.value = '通知渠道加载失败';
    } finally {
        channelsLoading.value = false;
    }
};

const startCreate = (type = 'wecom') => {
    editing.value = { type, name: '', config: type === 'webhook' ? { method: 'POST' } : {} };
};

const selectType = (type) => {
    if (!editing.value || editing.value.id) return;
    editing.value = { type, name: editing.value.name, config: type === 'webhook' ? { method: 'POST' } : {} };
};

const saveCh = async () => {
    const ch = editing.value;
    if (!ch.name || !ch.type) { addToast('请填写渠道名称', 'error'); return; }
    saving.value = true;
    try {
        const url = ch.id ? `${API_BASE}/notification-channels/${ch.id}` : `${API_BASE}/notification-channels`;
        const res = await authFetch(url, { method: ch.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: ch.type, name: ch.name, config: ch.config }) });
        if (res.ok) {
            addToast(ch.id ? '渠道已更新' : '渠道已添加', 'success');
            editing.value = null;
            await fetchChannels();
        } else {
            const d = await res.json();
            addToast(d.error || '操作失败', 'error');
        }
    } catch {
        addToast('网络错误', 'error');
    } finally {
        saving.value = false;
    }
};

const editCh = (ch) => {
    let parsedConfig = {};
    try { parsedConfig = typeof ch.config === 'string' ? JSON.parse(ch.config) : (ch.config || {}); } catch {}
    const secretKeys = ['secret', 'token', 'access_token', 'bot_token', 'key', 'api_key'];
    const cleanConfig = {};
    for (const [k, v] of Object.entries(parsedConfig)) {
        const isSecret = secretKeys.some(s => k.toLowerCase().includes(s));
        cleanConfig[k] = (isSecret || (typeof v === 'string' && v.includes('****'))) ? '' : v;
    }
    editing.value = { id: ch.id, type: ch.type, name: ch.name, config: cleanConfig };
};

const deleteCh = async (ch) => {
    if (!confirm(`确定删除通知渠道「${ch.name}」？`)) return;
    deletingId.value = ch.id;
    try {
        const res = await authFetch(`${API_BASE}/notification-channels/${ch.id}`, { method: 'DELETE' });
        if (res.ok) {
            addToast('渠道已删除', 'success');
            if (editing.value?.id === ch.id) editing.value = null;
            await fetchChannels();
        } else {
            addToast('删除失败', 'error');
        }
    } catch {
        addToast('删除失败', 'error');
    } finally {
        deletingId.value = null;
    }
};

const toggleCh = async (ch) => {
    togglingId.value = ch.id;
    try {
        const enabled = isEnabled(ch) ? 0 : 1;
        const res = await authFetch(`${API_BASE}/notification-channels/${ch.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled }) });
        if (res.ok) ch.enabled = enabled;
        else addToast('操作失败', 'error');
    } catch {
        addToast('操作失败', 'error');
    } finally {
        togglingId.value = null;
    }
};

const testCh = async (ch) => {
    testingId.value = ch.id;
    addToast('正在发送测试消息...', 'info');
    try {
        const res = await authFetch(`${API_BASE}/notification-channels/${ch.id}/test`, { method: 'POST' });
        const d = await res.json();
        addToast(d.success ? '测试消息发送成功' : '测试失败，请检查配置', d.success ? 'success' : 'error');
    } catch {
        addToast('测试失败', 'error');
    } finally {
        testingId.value = null;
    }
};

fetchChannels();
</script>
