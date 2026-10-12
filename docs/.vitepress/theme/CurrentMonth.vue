<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

const month = ref<number | null>(null)
onMounted(() => { month.value = new Date().getMonth() + 1 })
const link = computed(() => withBase(`/calendar/${String(month.value ?? 1).padStart(2, '0')}.html`))
</script>

<template>
  <div class="month-card">
    <strong>本月采购线索</strong>
    <p>按设备当前月份查看历史采收与供应资料。购买前仍需核对本地天气、商品状态和到手价。</p>
    <a v-if="month" :href="link">查看 {{ month }} 月 →</a>
    <a v-else :href="withBase('/calendar/')">查看全年日历 →</a>
  </div>
</template>
