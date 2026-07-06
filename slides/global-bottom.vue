<script setup lang="ts">
import { configs } from '@slidev/client'

// 회차별 배경은 headmatter의 deckBackground 키로 지정한다 (public/ 기준 경로).
// public/ 에셋은 배포 base(/slides/sN/)가 붙어야 하므로 BASE_URL로 조립한다.
const path = (configs as Record<string, unknown>).deckBackground ?? 's1/background-s1.png'
const bg = `${import.meta.env.BASE_URL}${path}`
</script>

<template>
  <div class="absolute inset-0">
    <img :src="bg" class="h-full w-full object-cover" alt="" />
    <div class="absolute inset-0 bg-black/45" />
  </div>
</template>
