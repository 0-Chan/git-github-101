<script setup lang="ts">
const props = withDefaults(defineProps<{ current?: number }>(), {
  current: 0,
})

const sections = [
  "되돌리기와 이력 정리",
  "저장소의 약속 파일들",
  "고급 명령어 지도",
  "협업 루프 재소환",
  "CI/CD는 짧은 피드백 루프다",
  "애자일 관행과 자동화",
  "GitHub Actions 구조",
  "CI 실습: 자동 검사 붙이기",
  "코드 리뷰는 CI 위에서 판단한다",
  "CD와 릴리스: 태그로 회수하기",
  "worktree로 작업 공간 분리하기",
  "4일차와 AI 병렬 실험으로 연결하기",
]

// 좌측 열에 앞 절반, 우측 열에 뒤 절반을 세로로 채우기 위한 행 수.
const rows = Math.ceil(sections.length / 2)
</script>

<template>
  <div
    class="grid gap-x-8 gap-y-2"
    :style="{
      gridAutoFlow: 'column',
      gridTemplateRows: `repeat(${rows}, auto)`,
      gridAutoColumns: 'minmax(0, 1fr)',
    }"
  >
    <div
      v-for="(s, i) in sections"
      :key="i"
      class="flex items-center gap-3"
      :class="props.current && i + 1 < props.current ? 'opacity-30' : (props.current && i + 1 > props.current ? 'opacity-70' : '')"
    >
      <span
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-bold"
        :style="i + 1 === props.current
          ? 'background: var(--lane-main); border-color: var(--lane-main); color: #18181b'
          : 'border-color: rgba(156,163,175,0.4); color: #e5e7eb'"
      >{{ String(i + 1).padStart(2, "0") }}</span>
      <span
        class="text-base leading-tight"
        :class="i + 1 === props.current ? 'font-bold' : ''"
        :style="i + 1 === props.current ? 'color: var(--lane-main)' : ''"
      >{{ s }}</span>
      <span
        v-if="i + 1 === props.current"
        class="text-base leading-none"
        aria-hidden="true"
      >👈</span>
    </div>
  </div>
</template>
