<script setup lang="ts">
const props = withDefaults(defineProps<{ current?: number; marker?: string }>(), {
  current: 0,
  marker: "",
})

const sections = [
  "worktree로 작업 공간 분리하기",
  "gh CLI로 PR 흐름 이어가기",
]
</script>

<template>
  <div class="flex flex-col gap-3">
    <div
      v-for="(section, index) in sections"
      :key="index"
      class="flex items-center gap-4"
      :class="props.current && index + 1 < props.current ? 'opacity-30' : (props.current && index + 1 > props.current ? 'opacity-70' : '')"
    >
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-base font-bold"
        :style="index + 1 === props.current
          ? 'background: var(--lane-main); border-color: var(--lane-main); color: #18181b'
          : 'border-color: rgba(156,163,175,0.4); color: #e5e7eb'"
      >{{ String(index + 1).padStart(2, "0") }}</span>
      <span
        class="text-xl"
        :class="index + 1 === props.current ? 'font-bold' : ''"
        :style="index + 1 === props.current ? 'color: var(--lane-main)' : ''"
      >{{ section }}</span>
      <span
        v-if="props.marker && index + 1 === props.current"
        class="text-sm opacity-80"
      >{{ props.marker }}</span>
    </div>
  </div>
</template>
