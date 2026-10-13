<script setup lang="ts">
import cards from '../../../data/decision-cards.json'

const props = defineProps<{ product: keyof typeof cards }>()
const card = cards[props.product]
</script>

<template>
  <section class="buying-card" aria-label="30 秒购买卡">
    <p class="buying-card-kicker">30 秒购买卡</p>
    <p class="buying-card-lead">{{ card.lead }}</p>
    <div class="buying-card-tags"><span>{{ card.onlineTag }}</span><span>{{ card.stockTag }}</span></div>
    <dl>
      <div><dt>怎么挑</dt><dd>{{ card.check }}</dd></div>
      <div><dt>去哪里买</dt><dd>{{ card.channel }}</dd></div>
      <div><dt>买多少</dt><dd>{{ card.quantity }}</dd></div>
      <div><dt>到家后</dt><dd>{{ card.storage }}</dd></div>
    </dl>
    <p class="buying-card-note">具体品种、地区和依据见下文；购买前再核对到手价。</p>
  </section>
</template>

<style scoped>
.buying-card{margin:1rem 0 1.5rem;padding:1rem 1.25rem;border:1px solid var(--vp-c-divider);border-radius:14px;background:var(--vp-c-bg-soft)}
.buying-card-kicker{margin:0;color:var(--vp-c-brand-1);font-size:.8rem;font-weight:700}
.buying-card-lead{margin:.35rem 0 .6rem;font-size:1.15rem;font-weight:700;line-height:1.5}
.buying-card-tags{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:.75rem}.buying-card-tags span{padding:.2rem .55rem;border-radius:999px;background:var(--vp-c-bg);color:var(--vp-c-text-2);font-size:.78rem}
.buying-card dl{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.7rem;margin:0}.buying-card dl>div{min-width:0}.buying-card dt{font-size:.78rem;color:var(--vp-c-text-2)}.buying-card dd{margin:.15rem 0 0;font-size:.9rem;line-height:1.5}
.buying-card-note{margin:.8rem 0 0;font-size:.78rem;color:var(--vp-c-text-2)}
@media(max-width:600px){.buying-card dl{grid-template-columns:1fr}.buying-card{padding:.9rem 1rem}}
</style>
