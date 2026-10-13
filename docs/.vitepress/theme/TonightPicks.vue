<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import reference from '../../../data/qingpu-retail-reference.json'

const options = [
  { product: '大白菜', purpose: '预算紧，先看这项', quantity: '先看切份或小颗，按两餐用量买', use: '清炒或煮汤', check: '看切面、菜心和根部', guide: 'cabbage' },
  { product: '青菜', purpose: '今晚只想快炒一盘', quantity: '买一把，按今晚食量定', use: '清炒', check: '翻看底层是否积水或烂叶', guide: 'leafy-greens' },
  { product: '鸡毛菜', purpose: '想做一碗快手菜汤', quantity: '买一把，尽快吃', use: '煮汤', check: '看叶片是否黏滑、失水', guide: 'leafy-greens' }
] as const

const today = ref('')
onMounted(() => {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date())
  const value = (type: string) => parts.find(part => part.type === type)?.value ?? ''
  today.value = `${value('year')}-${value('month')}-${value('day')}`
})
const ageDays = computed(() => today.value ? Math.floor((Date.parse(`${today.value}T00:00:00Z`) - Date.parse(`${reference.periodEnd}T00:00:00Z`)) / 86400000) : null)
const priceRecent = computed(() => ageDays.value !== null && ageDays.value >= 0 && ageDays.value <= 14)
const picks = options.map(option => ({ ...option, price: reference.items.find(item => item.product === option.product)!.cnyPer500g }))
</script>

<template>
  <section id="tonight" class="tonight-picks" aria-label="今晚采购候选">
    <p class="tonight-kicker">上海青浦 · 先挑一个</p>
    <h2>今晚可以先看这 3 样</h2>
    <p class="tonight-intro">按预算或做法选一张。标价是有日期的青浦零售监测均价，买前再看门店到手价。</p>
    <div class="tonight-grid">
      <article v-for="option in picks" :key="option.product" class="tonight-card">
        <p class="tonight-purpose">{{ option.purpose }}</p>
        <h3>{{ option.product }}</h3>
        <p v-if="priceRecent" class="tonight-price">¥{{ option.price.toFixed(2) }} <small>／500 克 · 历史监测均价</small></p>
        <p v-else class="tonight-price-missing">近期参考价待更新</p>
        <p class="tonight-meta">{{ option.use }} · {{ option.quantity }}</p>
        <p class="tonight-check">挑选：{{ option.check }}</p>
        <a :href="withBase(`/produce/${option.guide}`)">看购买要点 →</a>
      </article>
    </div>
    <p class="tonight-source">监测期：{{ reference.periodStart }}—{{ reference.periodEnd }}；样本：{{ reference.sample }}。<a :href="reference.sourceUrl" target="_blank" rel="noopener noreferrer">青浦区原始来源</a> · <a :href="withBase('/compare/reference')">价格范围与核价</a></p>
    <p class="tonight-next">去哪里买：顺路的农贸市场或超市可现场检查、结账带走；想配送可打开<a href="https://fresh.jd.com/" target="_blank" rel="noopener noreferrer">京东生鲜</a>或盒马 App，先填青浦收货地址，再看商品、到手价和可选时段。本站没有可核实的实时库存与配送时间。</p>
  </section>
</template>

<style scoped>
.tonight-picks{margin:1rem 0 1.5rem}.tonight-kicker{margin:0;color:var(--vp-c-brand-1);font-size:.8rem;font-weight:700}.tonight-picks h2{margin:.2rem 0 .5rem;padding:0;border:0}.tonight-intro,.tonight-source,.tonight-next{font-size:.85rem;color:var(--vp-c-text-2);line-height:1.55}.tonight-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.7rem;margin:1rem 0}.tonight-card{min-width:0;padding:1rem;border:1px solid var(--vp-c-divider);border-radius:12px;background:var(--vp-c-bg-soft)}.tonight-purpose{margin:0;font-size:.8rem;color:var(--vp-c-brand-1);font-weight:700}.tonight-card h3{margin:.25rem 0;border:0;padding:0}.tonight-price{margin:.4rem 0;font-size:1.3rem;font-weight:700}.tonight-price small{display:block;font-size:.72rem;font-weight:400;color:var(--vp-c-text-2)}.tonight-price-missing{font-size:.88rem;color:var(--vp-c-text-2)}.tonight-meta,.tonight-check{font-size:.82rem;line-height:1.5;margin:.4rem 0}.tonight-card a{font-size:.85rem;font-weight:600}@media(max-width:700px){.tonight-grid{grid-template-columns:1fr}.tonight-card{padding:.85rem 1rem}}
</style>
