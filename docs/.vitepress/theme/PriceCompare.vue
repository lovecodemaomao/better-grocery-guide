<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

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
const products = ['苹果', '香蕉', '柑橘', '草莓', '番茄', '黄瓜', '大白菜', '白萝卜', '马铃薯']
const cities = ['上海', '北京', '广州', '深圳']
const kindLabel = { listing: '公开标价', checkout: '结算页到手价', paid: '实付价' }
const rows = computed(() => city.value.trim() ? quotes.value.filter(q => q.city === city.value.trim() && q.district === district.value.trim() && q.product === product.value).map(q => ({ ...q, total: q.listedCny - q.discountCny + q.shippingCny, unit: (q.listedCny - q.discountCny + q.shippingCny) / q.weightKg, ageDays: Math.floor((Date.now() - new Date(`${q.observedAt}T00:00:00`).getTime()) / 86400000) })).sort((a, b) => a.unit - b.unit) : [])
onMounted(() => {
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
    <p v-if="!rows.length" class="compare-empty">{{ city }}{{ district }}的{{ product }}还没有可比较的记录。可以从下方录入盒马、京东或其他平台的结算页价格。</p>
    <p v-if="rows.length" class="compare-privacy">手机上可横向滑动表格查看完整价格。</p>
    <div v-if="rows.length" class="compare-table-wrap"><table><thead><tr><th>渠道与规格</th><th>价格口径</th><th>含优惠与运费合计</th><th>元/公斤</th><th>记录</th></tr></thead><tbody>
      <tr v-for="q in rows" :key="q.id"><td><strong>{{ q.channel }}</strong> · {{ q.product }} {{ q.variety }}<br /><small>{{ q.seller }} {{ q.specification }} · 净重 {{ q.weightKg }} 公斤</small><br /><small v-if="q.popularity">{{ q.popularity }}（不能直接当作销量）</small></td><td>{{ kindLabel[q.priceKind] }}</td><td>¥{{ q.total.toFixed(2) }}<br /><small>标价 {{ q.listedCny }} − 优惠 {{ q.discountCny }} + 运费 {{ q.shippingCny }}</small></td><td><strong>¥{{ q.unit.toFixed(2) }}</strong></td><td>{{ q.observedAt }}<br /><small v-if="q.ageDays > 7">超过 7 天，请重新核价</small><small v-else>请在下单前复核</small><br /><a v-if="q.sourceUrl" :href="q.sourceUrl" target="_blank" rel="noopener noreferrer">查看来源</a><button class="remove-quote" type="button" @click="removeQuote(q.id)">删除</button></td></tr>
    </tbody></table></div>
    <h2>添加价格记录</h2>
    <p>最好记录同一城市、同一品种和相近规格的价格。没有结算页信息时请选择“公开标价”，不要把页面评价数写成销量。</p>
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
    <datalist id="produce-names"><option v-for="name in products" :key="name" :value="name" /></datalist>
    <datalist id="first-tier-cities"><option v-for="name in cities" :key="name" :value="name" /></datalist>
    <p role="status">{{ message }}</p>
    <p class="compare-privacy">记录仅保存在当前浏览器，没有上传到项目或平台。清除浏览器数据会删除记录。</p>
  </div>
</template>

<style scoped>
.compare-controls,.quote-form{display:grid;grid-template-columns:repeat(auto-fit,minmax(175px,1fr));gap:12px;margin:18px 0}.price-compare label{display:grid;gap:5px;font-size:.9rem;font-weight:600}.price-compare input,.price-compare select{min-width:0;padding:8px 10px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg);color:var(--vp-c-text-1);font:inherit}.quote-form button{align-self:end;padding:10px;border:0;border-radius:8px;background:var(--vp-c-brand-1);color:#fff;font:inherit;cursor:pointer}.compare-empty{padding:16px;border-radius:10px;background:var(--vp-c-bg-soft)}.compare-table-wrap{overflow-x:auto}.compare-table-wrap table{width:100%;min-width:650px;display:table}.compare-table-wrap th,.compare-table-wrap td{vertical-align:top}.compare-table-wrap small{color:var(--vp-c-text-2)}.remove-quote{display:block;border:0;background:none;color:var(--vp-c-brand-1);padding:2px 0;cursor:pointer}.compare-privacy{font-size:.85rem;color:var(--vp-c-text-2)}
</style>
