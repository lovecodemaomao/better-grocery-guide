<script setup lang="ts">
import { withBase } from 'vitepress'
const tasks = [
  { title: '今晚买菜', detail: '想快点做饭：先选容易买、容易检查的菜。', link: '/scenes/tonight' },
  { title: '买点水果', detail: '从本月候选里挑，再决定买小份还是整箱。', link: '/scenes/fruit' },
  { title: '备点存货', detail: '看储存条件和食用计划，减少买多后的损耗。', link: '/scenes/stock' }
]
</script>

<template>
  <nav class="task-nav" aria-label="按购买目的查找">
    <a v-for="task in tasks" :key="task.link" :href="withBase(task.link)">
      <strong>{{ task.title }} →</strong><span>{{ task.detail }}</span>
    </a>
  </nav>
</template>

<style scoped>
.task-nav{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.75rem;margin:1rem 0 2rem}.task-nav a{display:flex;flex-direction:column;gap:.35rem;padding:1rem;border:1px solid var(--vp-c-divider);border-radius:12px;background:var(--vp-c-bg-soft);text-decoration:none!important;color:var(--vp-c-text-1)}.task-nav a:hover{border-color:var(--vp-c-brand-1)}.task-nav strong{color:var(--vp-c-brand-1)}.task-nav span{font-size:.85rem;line-height:1.5;color:var(--vp-c-text-2)}
@media(max-width:700px){.task-nav{grid-template-columns:1fr}}
</style>
