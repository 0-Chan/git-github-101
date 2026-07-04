<script setup lang="ts">
// public/ 에셋은 배포 base(/slides/)가 붙어야 하므로 BASE_URL로 조립한다
const bg = `${import.meta.env.BASE_URL}background-1.png`
</script>

<template>
  <div class="absolute inset-0">
    <img :src="bg" class="h-full w-full object-cover" alt="" />
    <div class="absolute inset-0 bg-black/45" />
  </div>
</template>
