<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import qingpuReference from '../../../data/qingpu-retail-reference.json'

type Quote = {
  id: string
  city: string
  district: string
  product: string
  variety: string
  channel: string
  seller: string
  specification: string
  weightKg: number
  listedCny: number
  discountCny: number
  shippingCny: number
  observedAt: string
  priceKind: 'listing' | 'checkout' | 'paid'
  sourceUrl: string
  popularity: string
}
const key = 'better-grocery-price-quotes-v2'
const previousKey = 'better-grocery-price-quotes-v1'
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const quotes = ref<Quote[]>([])
const city = ref('上海')
const district = ref('青浦区')
const product = ref('苹果')
const form = ref({ city: '上海', district: '青浦区', product: '苹果', variety: '', channel: '京东', seller: '', specification: '', weightKg: '', listedCny: '', discountCny: '0', shippingCny: '0', observedAt: today(), priceKind: 'listing' as Quote['priceKind'], sourceUrl: '', popularity: '' })
const message = ref('')
const products = ['苹果', '香蕉', '柑橘', '草莓', '番茄', '黄瓜', '白萝卜', '马铃薯', ...qingpuReference.items.map(item => item.product)]
const cities = ['上海', '北京', '广州', '深圳']
const kindLabel = { listing: '公开标价', checkout: '结算页到手价', paid: '实付价' }
const rows = computed(() => city.value.trim() ? quotes.value.filter(q => q.city === city.value.trim() && q.district === district.value.trim() && q.product === product.value).map(q => ({ ...q, total: q.listedCny - q.discountCny + q.shippingCny, unit: (q.listedCny - q.discountCny + q.shippingCny) / q.weightKg, ageDays: Math.floor((Date.now() - new Date(`${q.observedAt}T00:00:00`).getTime()) / 86400000) })) : [])
const groups = computed(() => {
  const map = new Map<string, { variety: string, specification: string, priceKind: Quote['priceKind'], observedAt: string, quotes: typeof rows.value }>()
  for (const quote of rows.value) {
    const variety = quote.variety.trim() || '品种未注明'
    const specification = quote.specification.trim()
    const key = [variety, specification, quote.priceKind, quote.observedAt].join('\u0000')
    if (!map.has(key)) map.set(key, { variety, specification, priceKind: quote.priceKind, observedAt: quote.observedAt, quotes: [] })
    map.get(key)!.quotes.push(quote)
  }
  return [...map.values()].map(group => {
    const comparable = group.quotes.length >= 2 && group.variety !== '品种未注明'
    return { ...group, comparable, quotes: comparable ? group.quotes.sort((a, b) => a.unit - b.unit) : group.quotes }
  })
})
const currentDate = ref('')
const referenceItem = computed(() => city.value.trim() === '上海' && district.value.trim() === '青浦区' ? qingpuReference.items.find(item => item.product === product.value) : undefined)
const referenceUpper = computed(() => referenceItem.value ? Math.max(referenceItem.value.cnyPer500g, ...qingpuReference.previousPeriods.map(period => period.prices[referenceItem.value!.product as keyof typeof period.prices])) * 2 : null)
const referenceStale = computed(() => currentDate.value ? (Date.parse(`${currentDate.value}T00:00:00Z`) - Date.parse(`${qingpuReference.periodEnd}T00:00:00Z`)) / 86400000 > 14 : false)
onMounted(() => {
  currentDate.value = today()
  form.value.observedAt = today()
  try {
    const saved = JSON.parse(localStorage.getItem(key) || localStorage.getItem(previousKey) || '[]')
    if (Array.isArray(saved)) quotes.value = saved.filter(q => q && q.id && q.city && q.product && Number.isFinite(q.weightKg) && q.weightKg > 0).map(q => ({ ...q, district: typeof q.district === 'string' ? q.district : '' }))
  } catch { message.value = '本机旧记录无法读取，请重新录入。' }
})
watch(quotes, value => localStorage.setItem(key, JSON.stringify(value)), { deep: true })
function addQuote() {
  const f = form.value
  const weightKg = Number(f.weightKg), listedCny = Number(f.listedCny), discountCny = Number(f.discountCny), shippingCny = Number(f.shippingCny)
  if (!f.city.trim() || !f.district.trim() || !f.product.trim() || !f.channel.trim() || !f.specification.trim() || !f.observedAt || !Number.isFinite(weightKg) || weightKg <= 0 || !Number.isFinite(listedCny) || listedCny < 0 || !Number.isFinite(discountCny) || discountCny < 0 || !Number.isFinite(shippingCny) || shippingCny < 0 || discountCny > listedCny) { message.value = '请填写城市、区县、商品、平台、规格、日期和有效的价格与净重。'; return }
  if (f.observedAt > today()) { message.value = '记录日期不能晚于今天。'; return }
  if (f.sourceUrl && !/^https:\/\//.test(f.sourceUrl)) { message.value = '来源链接请使用 https:// 地址。'; return }
  quotes.value.push({ id: crypto.randomUUID(), city: f.city.trim(), district: f.district.trim(), product: f.product.trim(), variety: f.variety.trim(), channel: f.channel.trim(), seller: f.seller.trim(), specification: f.specification.trim(), weightKg, listedCny, discountCny, shippingCny, observedAt: f.observedAt, priceKind: f.priceKind, sourceUrl: f.sourceUrl.trim(), popularity: f.popularity.trim() })
  city.value = f.city.trim(); district.value = f.district.trim(); product.value = f.product.trim(); message.value = '已保存到这台设备的浏览器。'
  form.value = { ...f, variety: '', seller: '', specification: '', weightKg: '', listedCny: '', discountCny: '0', shippingCny: '0', sourceUrl: '', popularity: '' }
}
function removeQuote(id: string) { quotes.value = quotes.value.filter(q => q.id !== id) }
</script>

<template>
  <div class="price-compare">
    <div class="compare-controls">
      <label>比较城市<input v-model="city" list="first-tier-cities" placeholder="例如：上海" /></label>
      <label>区县<input v-model="district" placeholder="例如：青浦区" /></label>
      <label>商品<input v-model="product" list="produce-names" /></label>
    </div>
    <p v-if="!rows.length" class="compare-empty">这台设备还没有{{ city }}{{ district }}的{{ product }}记录。先看<a :href="withBase('/compare/reference')">已有的青浦价格参考</a>；需要自己记价时再展开下方表单。</p>
    <p v-if="referenceUpper !== null" class="compare-privacy">青浦区近三期监测均价上沿：¥{{ referenceUpper.toFixed(2) }}/公斤（截至 2026-10-02，<span v-if="referenceStale">已过期，仅作历史参考</span><span v-else>仅作复核参考</span>）。<a :href="withBase('/compare/reference')">查看来源与范围</a>。</p>
    <section v-for="(group, index) in groups" :key="index" class="quote-group">
      <h3>{{ group.variety }} · {{ group.specification }} · {{ kindLabel[group.priceKind] }} · {{ group.observedAt }}</h3>
      <p class="compare-privacy">{{ group.comparable ? '本组按元／公斤排序；仍需核对等级、卖家和配送条件。' : '同口径记录不足或品种未注明，暂不形成价格排名。' }}</p>
      <div class="quote-grid">
        <article v-for="q in group.quotes" :key="q.id" class="quote-card">
          <div class="quote-card-top"><strong>{{ q.channel }}</strong><span>{{ kindLabel[q.priceKind] }}</span></div>
          <p class="quote-card-price">¥{{ (q.unit / 2).toFixed(2) }}<small>／500 克</small></p>
          <p class="quote-card-sub">¥{{ q.unit.toFixed(2) }}／公斤 · {{ q.observedAt }}</p>
          <p v-if="q.ageDays > 7" class="quote-card-note">记录已超过 7 天，请重新核价。</p>
          <p v-if="referenceUpper !== null && !referenceStale" class="quote-card-note">约为青浦历史监测上沿的 {{ (q.unit / referenceUpper).toFixed(1) }} 倍；先核对品质和规格。</p>
          <details><summary>查看规格与计算</summary><p>{{ q.seller || '卖家未注明' }} · {{ q.specification }} · 净重 {{ q.weightKg }} 公斤</p><p>标价 ¥{{ q.listedCny }} − 优惠 ¥{{ q.discountCny }} + 运费 ¥{{ q.shippingCny }} = ¥{{ q.total.toFixed(2) }}</p><p v-if="q.popularity">页面热度：{{ q.popularity }}（不能直接当作销量）</p></details>
          <div class="quote-card-actions"><a v-if="q.sourceUrl" :href="q.sourceUrl" target="_blank" rel="noopener noreferrer">查看来源</a><button class="remove-quote" type="button" @click="removeQuote(q.id)">删除记录</button></div>
        </article>
      </div>
    </section>
    <details class="quote-editor"><summary>自己记录价格（可选）</summary>
    <p>这份详细表单供愿意留存报价的人使用。仅同一品种、规格、日期和价格口径的记录形成组内排序；页面评价数不能当作销量。</p>
    <form class="quote-form" @submit.prevent="addQuote">
      <label>城市<input v-model="form.city" list="first-tier-cities" placeholder="例如：上海" required /></label>
      <label>区县<input v-model="form.district" placeholder="例如：青浦区" required /></label>
      <label>商品<input v-model="form.product" list="produce-names" required /></label>
      <label>平台或商场<input v-model="form.channel" placeholder="京东 / 盒马 / 其他" required /></label>
      <label>卖家或门店<input v-model="form.seller" placeholder="选填" /></label>
      <label>品种<input v-model="form.variety" placeholder="例如：红富士" /></label>
      <label>规格<input v-model="form.specification" placeholder="例如：5 斤装 75–80 mm" required /></label>
      <label>净重（公斤）<input v-model="form.weightKg" type="number" min="0.001" step="0.001" required /></label>
      <label>标价（元）<input v-model="form.listedCny" type="number" min="0" step="0.01" required /></label>
      <label>优惠（元）<input v-model="form.discountCny" type="number" min="0" step="0.01" /></label>
      <label>运费（元）<input v-model="form.shippingCny" type="number" min="0" step="0.01" /></label>
      <label>价格口径<select v-model="form.priceKind"><option value="listing">公开标价</option><option value="checkout">结算页到手价</option><option value="paid">实付价</option></select></label>
      <label>记录日期<input v-model="form.observedAt" type="date" required /></label>
      <label>商品链接<input v-model="form.sourceUrl" type="url" placeholder="https://…（选填）" /></label>
      <label>热度信息<input v-model="form.popularity" placeholder="例如：页面显示 1 万+评价；选填" /></label>
      <button type="submit">保存并比较</button>
    </form>
    <p class="compare-privacy">记录仅保存在当前浏览器，没有上传到项目或平台。清除浏览器数据会删除记录。</p>
    </details>
    <datalist id="produce-names"><option v-for="name in products" :key="name" :value="name" /></datalist>
    <datalist id="first-tier-cities"><option v-for="name in cities" :key="name" :value="name" /></datalist>
    <p role="status">{{ message }}</p>
  </div>
</template>

<style scoped>
.compare-controls,.quote-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;margin:18px 0}.price-compare label{display:grid;gap:5px;font-size:.9rem;font-weight:600}.price-compare input,.price-compare select{min-width:0;padding:8px 10px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg);color:var(--vp-c-text-1);font:inherit}.quote-form button{align-self:end;padding:10px;border:0;border-radius:8px;background:var(--vp-c-brand-1);color:#fff;font:inherit;cursor:pointer}.compare-empty{padding:16px;border-radius:10px;background:var(--vp-c-bg-soft)}.compare-privacy{font-size:.85rem;color:var(--vp-c-text-2)}.quote-group{margin:1.5rem 0}.quote-group h3{margin-bottom:.3rem}.quote-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:.75rem}.quote-card{padding:1rem;border:1px solid var(--vp-c-divider);border-radius:12px;background:var(--vp-c-bg-soft)}.quote-card-top,.quote-card-actions{display:flex;justify-content:space-between;gap:.6rem}.quote-card-top span,.quote-card-sub,.quote-card-note{font-size:.8rem;color:var(--vp-c-text-2)}.quote-card-price{margin:.5rem 0 0;font-size:1.35rem;font-weight:700}.quote-card-price small{font-size:.75rem;font-weight:400}.quote-card-sub{margin:.1rem 0}.quote-card-note{margin:.3rem 0}.quote-card details{margin:.7rem 0;font-size:.85rem}.quote-card details p{margin:.3rem 0}.quote-card-actions{font-size:.8rem}.remove-quote{border:0;background:none;color:var(--vp-c-brand-1);padding:0;cursor:pointer}.quote-editor{margin:1.5rem 0;padding:1rem;border:1px solid var(--vp-c-divider);border-radius:12px}.quote-editor>summary{cursor:pointer;font-weight:700}
</style>
