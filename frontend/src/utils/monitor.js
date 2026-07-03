export const MONITOR_INTERVAL_OPTIONS = [
  { value: 60, label: '1 分钟' },
  { value: 180, label: '3 分钟' },
  { value: 300, label: '5 分钟' },
  { value: 600, label: '10 分钟' },
  { value: 900, label: '15 分钟' },
  { value: 1800, label: '30 分钟' },
  { value: 0, label: '不检测' },
];

export const isBookmark = (monitor) => Number(monitor?.interval) === 0;

export const isPrivate = (monitor) => Number(monitor?.is_private) === 1;

/** 状态页展示/点击用的 URL；检测 URL 永不公开，私密项隐藏跳转链接 */
export const getVisitUrl = (monitor) => {
  if (isPrivate(monitor)) return null;
  const link = monitor?.link_url?.trim();
  if (link) return link;
  if (isBookmark(monitor)) return monitor?.url?.trim() || null;
  return null;
};

export const formatIntervalLabel = (interval) => {
  const opt = MONITOR_INTERVAL_OPTIONS.find(o => o.value === Number(interval));
  return opt ? opt.label : `${interval}s`;
};

export const parseTags = (tags) => (tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);

export const collectAllTags = (monitors) => {
  const set = new Set();
  (monitors || []).forEach(m => parseTags(m?.tags).forEach(t => set.add(t)));
  return [...set].sort((a, b) => a.localeCompare(b, 'zh-CN'));
};

export const groupMonitorsByTag = (monitors, defaultTag = '未分组') => {
  const groups = new Map();
  for (const monitor of monitors || []) {
    const tag = parseTags(monitor.tags)[0] || defaultTag;
    if (!groups.has(tag)) groups.set(tag, []);
    groups.get(tag).push(monitor);
  }
  return [...groups.entries()].map(([name, items]) => ({ name, items }));
};
