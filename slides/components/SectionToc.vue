<script setup lang="ts">
// 목차 슬라이드와 막별 구분 슬라이드가 공유하는 섹션 네비게이션.
// current = 지금 들어가는 섹션 번호(1~6). 지난 섹션은 흐리게, 현재만 강조.
// current = 0이면 강조 없이 전체 여정만 보여준다(맨 앞 목차용).
const props = withDefaults(defineProps<{ current?: number; marker?: string }>(), {
  current: 0,
  marker: "",
})

const sections = [
  "first-contributions 복기",
  "Git의 원리",
  "실무 워크플로우",
  "협업의 구조",
  "기록이 자산이 된다",
  "다음 걸음",
]
</script>

<template>
  <div class="flex flex-col gap-2.5">
    <div
      v-for="(s, i) in sections"
      :key="i"
      class="flex items-center gap-4"
      :class="props.current && i + 1 < props.current ? 'opacity-30' : (props.current && i + 1 > props.current ? 'opacity-70' : '')"
    >
      <span
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-base font-bold"
        :style="i + 1 === props.current
          ? 'background: var(--lane-main); border-color: var(--lane-main); color: #18181b'
          : 'border-color: rgba(156,163,175,0.4); color: #e5e7eb'"
      >{{ i + 1 }}</span>
      <span
        class="text-xl"
        :class="i + 1 === props.current ? 'font-bold' : ''"
        :style="i + 1 === props.current ? 'color: var(--lane-main)' : ''"
      >{{ s }}</span>
      <span
        v-if="props.marker && i + 1 === props.current"
        class="text-sm opacity-80"
      >{{ props.marker }}</span>
    </div>
  </div>
</template>
