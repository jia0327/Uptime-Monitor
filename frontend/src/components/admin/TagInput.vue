<template>
  <div>
    <input
      :value="modelValue"
      :list="listId"
      :placeholder="placeholder"
      :class="inputClass"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <datalist :id="listId">
      <option v-for="tag in suggestions" :key="tag" :value="tag" />
    </datalist>
    <div v-if="suggestions.length > 0" class="mt-2 flex flex-wrap gap-1.5">
      <button
        v-for="tag in suggestions"
        :key="'pick-' + tag"
        type="button"
        class="tag-chip cursor-pointer hover:border-green-500/50 hover:text-green-400 transition-colors"
        :class="selectedSet.has(tag) ? 'border-green-500/40 text-green-400' : ''"
        @click="toggleTag(tag)"
      >{{ tag }}</button>
    </div>
    <p v-if="suggestions.length > 0" class="mt-1.5 text-[10px] text-slate-600">点击标签快速添加，或在输入框中选择/输入，多个标签用逗号分隔</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { parseTags } from '../../utils/monitor';

const props = defineProps({
  modelValue: { type: String, default: '' },
  suggestions: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'prod,web,api' },
  inputClass: { type: String, default: '' },
  listId: { type: String, required: true },
});

const emit = defineEmits(['update:modelValue']);

const selectedSet = computed(() => new Set(parseTags(props.modelValue)));

const toggleTag = (tag) => {
  const tags = parseTags(props.modelValue);
  const idx = tags.indexOf(tag);
  if (idx >= 0) tags.splice(idx, 1);
  else tags.push(tag);
  emit('update:modelValue', tags.join(','));
};
</script>
