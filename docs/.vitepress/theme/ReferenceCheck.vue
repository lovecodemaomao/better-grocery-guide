<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import reference from '../../../data/qingpu-retail-reference.json'

const product = ref('大白菜')
const listed = ref('')
const weightKg = ref('')
const shipping = ref('0')
const discount = ref('0')
const currentDate = ref('')
onMounted(() => { const now = new Date(); currentDate.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}` })
const item = computed(() => reference.items.find(row => row.product === product.value)!)
const ageDays = computed(() => currentDate.value ? Math.max(0, Math.floor((Date.parse(`${currentDate.value}T00:00:00Z`) - Date.parse(`${reference.periodEnd}T00:00:00Z`)) / 86400000)) : null)
const result = computed(() => {
  const price = Number(listed.value)
  const weight = Number(weightKg.value)
  const freight = Number(shipping.value)
  const reduction = Number(discount.value)
  if (!listed.value || !weightKg.value || !Number.isFinite(price) || price <= 0 || !Number.isFinite(weight) || weight <= 0 || !Number.isFinite(freight) || freight < 0 || !Number.isFinite(reduction) || reduction < 0 || reduction > price) return null
  const perKg = (price + freight - reduction) / weight
  const benchmark = item.value.cnyPer500g * 2
  return { perKg, benchmark, ratio: perKg / benchmark }
})
</script>

<template>
  <div class="reference-check">
    <div class="reference-table"><table><thead><tr><th>蔬菜（原表名称）</th><th>元／500 克</th><th>元／公斤</th></tr></thead><tbody>
      <tr v-for="row in reference.items" :key="row.product"><td>{{ row.product }}</td><td>{{ row.cnyPer500g.toFixed(2) }}</td><td>{{ (row.cnyPer500g * 2).toFixed(2) }}</td></tr>
    </tbody></table></div>
    <h2>拿到一个报价，快速算一算</h2>
    <p>选择同名蔬菜，填入平台或门店的价格和<strong>净重</strong>。结果与青浦区这期监测均价比较，仅用于提醒复核。</p>
    <div class="reference-fields">
      <label>蔬菜<select v-model="product"><option v-for="row in reference.items" :key="row.product" :value="row.product">{{ row.product }}</option></select></label>
      <label>商品标价（元）<input v-model="listed" type="number" min="0.01" step="0.01" placeholder="例如 12.90" /></label>
      <label>净重（公斤）<input v-model="weightKg" type="number" min="0.001" step="0.001" placeholder="例如 0.5" /></label>
      <label>运费（元）<input v-model="shipping" type="number" min="0" step="0.01" /></label>
      <label>优惠（元）<input v-model="discount" type="number" min="0" step="0.01" /></label>
    </div>
    <div v-if="result" class="reference-result" role="status">
      <strong>这个报价约 ¥{{ result.perKg.toFixed(2) }}/公斤；青浦区历史监测均价为 ¥{{ result.benchmark.toFixed(2) }}/公斤。</strong>
      <p v-if="result.ratio >= 2">约为基准的 {{ result.ratio.toFixed(1) }} 倍：差距较大，先核对品种、等级、净重、配送费、门店及最新行情，再决定是否购买。</p>
      <p v-else-if="result.ratio >= 1.3">约为基准的 {{ result.ratio.toFixed(1) }} 倍：高于这期监测均价，建议查看同类商品的其他报价。</p>
      <p v-else>约为基准的 {{ result.ratio.toFixed(1) }} 倍：仍请核对质量、包装与最新到手价。</p>
    </div>
    <p v-else class="reference-note">填写有效的价格和净重后显示换算结果。优惠不能大于标价。</p>
    <p class="reference-note">“2 倍”是本站的复核提醒线，<strong>不是市场公允价、最高限价或欺诈认定</strong>。监测期为 {{ reference.periodStart }}—{{ reference.periodEnd }}<span v-if="ageDays !== null">，截至今天已过去 {{ ageDays }} 天</span>；下单前须重新核价。</p>
  </div>
</template>

<style scoped>
.reference-check{padding:1rem 1.25rem;border:1px solid var(--vp-c-divider);border-radius:12px;background:var(--vp-c-bg-soft)}
.reference-table{overflow-x:auto}.reference-table table{display:table;width:100%;min-width:300px}.reference-table th,.reference-table td{padding:6px 8px}
.reference-check h2{margin-top:0;padding-top:0;border:0}
.reference-fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(145px,1fr));gap:12px;margin:16px 0}
.reference-fields label{display:grid;gap:5px;font-size:.9rem;font-weight:600}
.reference-fields input,.reference-fields select{min-width:0;padding:8px 10px;border:1px solid var(--vp-c-divider);border-radius:8px;background:var(--vp-c-bg);color:var(--vp-c-text-1);font:inherit}
.reference-result{padding:12px;border-radius:8px;background:var(--vp-c-bg);border:1px solid var(--vp-c-divider)}
.reference-result p{margin:.5rem 0 0}
.reference-note{font-size:.85rem;color:var(--vp-c-text-2)}
</style>
