<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import seasons from '../../../data/seasons.json'
import cards from '../../../data/decision-cards.json'

const props = defineProps<{ category?: 'fruit' | 'vegetable' }>()
const month = ref<number | null>(null)
onMounted(() => { month.value = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Shanghai', month: 'numeric' }).format(new Date())) })
const monthLink = computed(() => withBase(`/calendar/${String(month.value ?? 1).padStart(2, '0')}.html`))
function status(entry: typeof seasons[number], current: number) {
  if (entry.matureMonths.includes(current)) return { label: '产地采收线索', rank: 0 }
  if (entry.peakMonths.includes(current)) return { label: '集中上市线索', rank: 1 }
  return { label: '市场供应线索', rank: 2 }
}
const picks = computed(() => {
  if (!month.value) return []
  const current = month.value
  const candidates = seasons.filter(entry => (entry.matureMonths.includes(current) || entry.peakMonths.includes(current) || entry.supplyMonths.includes(current)) && Object.prototype.hasOwnProperty.call(cards, entry.slug))
    .sort((a, b) => status(a, current).rank - status(b, current).rank)
  const chosen = new Set<string>()
  return (props.category ? [props.category] : ['fruit', 'vegetable'] as const).flatMap(category => candidates.filter(entry => {
    if (entry.category !== category || chosen.has(entry.slug)) return false
    chosen.add(entry.slug)
    return true
  }).slice(0, 4).map(entry => ({ ...entry, ...status(entry, current), card: cards[entry.slug as keyof typeof cards] })))
})
</script>

<template>
  <section id="this-month" class="month-picks" aria-label="本月采购候选">
    <div class="month-picks-heading">
      <div><p class="month-picks-kicker">省心先选</p><h2>{{ month ? `${month} 月先看看这些${props.category === 'fruit' ? '水果' : props.category === 'vegetable' ? '蔬菜' : '果蔬'}` : '正在读取本月清单' }}</h2></div>
      <a v-if="month" :href="monthLink">看 {{ month }} 月完整清单 →</a>
    </div>
    <p class="month-picks-intro">从有出处的历史采收或供应记录中，先挑几样常见食材供你缩小选择；不是实时低价或品质保证。</p>
    <div v-if="picks.length" class="month-picks-grid">
      <a v-for="entry in picks" :key="entry.slug" class="month-pick" :href="withBase(`/produce/${entry.slug}`)">
        <span class="month-pick-status">{{ entry.label }} · {{ entry.origin }}</span>
        <strong>{{ entry.card.title }}</strong>
        <span>{{ entry.card.lead }}</span>
        <span class="month-pick-tags"><small>{{ entry.card.onlineTag }}</small><small>{{ entry.card.stockTag }}</small></span>
      </a>
    </div>
    <p v-else-if="month">本月尚无可用的简短购买卡。<a :href="monthLink">查看有来源的完整清单 →</a></p>
    <p class="month-picks-foot">要判断是否划算，再看<a :href="withBase('/compare/reference')">青浦价格参考</a>和实际到手价。</p>
  </section>
</template>

<style scoped>
.month-picks{margin:1rem 0 2rem;scroll-margin-top:5rem}.month-picks-heading{display:flex;justify-content:space-between;align-items:end;gap:1rem}.month-picks-heading h2{margin:.15rem 0 0;padding:0;border:0}.month-picks-heading a{white-space:nowrap}.month-picks-kicker{margin:0;color:var(--vp-c-brand-1);font-size:.85rem;font-weight:700}.month-picks-intro,.month-picks-foot{color:var(--vp-c-text-2);font-size:.9rem}.month-picks-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.month-pick{display:flex;flex-direction:column;gap:.35rem;padding:1rem;border:1px solid var(--vp-c-divider);border-radius:12px;background:var(--vp-c-bg-soft);color:var(--vp-c-text-1);text-decoration:none!important}.month-pick:hover{border-color:var(--vp-c-brand-1)}.month-pick strong{font-size:1.1rem}.month-pick-status{font-size:.75rem;color:var(--vp-c-text-2)}.month-pick-tags{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.25rem}.month-pick-tags small{padding:.1rem .4rem;border-radius:999px;background:var(--vp-c-bg);color:var(--vp-c-text-2)}
@media(max-width:600px){.month-picks-heading{display:block}.month-picks-heading a{display:inline-block;margin-top:.5rem}.month-picks-grid{grid-template-columns:1fr}}
</style>
