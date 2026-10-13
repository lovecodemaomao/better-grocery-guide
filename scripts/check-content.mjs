import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname, extname } from 'node:path'

const sources = JSON.parse(readFileSync('data/sources.json', 'utf8'))
const seasons = JSON.parse(readFileSync('data/seasons.json', 'utf8'))
const decisionCards = JSON.parse(readFileSync('data/decision-cards.json', 'utf8'))
const qingpuReference = JSON.parse(readFileSync('data/qingpu-retail-reference.json', 'utf8'))
const errors = []
const validMonth = m => Number.isInteger(m) && m >= 1 && m <= 12

if (qingpuReference.city !== '上海' || qingpuReference.district !== '青浦区' || !qingpuReference.periodStart || !qingpuReference.periodEnd || !qingpuReference.sourceUrl.startsWith('https://') || !qingpuReference.sourceChartUrl.startsWith('https://')) errors.push('青浦价格参考缺少地区、时间或直接来源')
if (qingpuReference.periodStart > qingpuReference.periodEnd) errors.push('青浦价格参考日期顺序无效')
if (!Array.isArray(qingpuReference.items) || qingpuReference.items.length !== 12 || new Set(qingpuReference.items.map(item => item.product)).size !== qingpuReference.items.length || qingpuReference.items.some(item => !item.product || !Number.isFinite(item.cnyPer500g) || item.cnyPer500g <= 0)) errors.push('青浦价格参考逐品种数据无效')
if (!Array.isArray(qingpuReference.previousPeriods) || qingpuReference.previousPeriods.length !== 2 || qingpuReference.previousPeriods.some(period => !period.periodStart || !period.periodEnd || period.periodStart > period.periodEnd || period.periodEnd >= qingpuReference.periodStart || !period.sourceUrl?.startsWith('https://') || !period.sourceChartUrl?.startsWith('https://') || qingpuReference.items.some(item => !Number.isFinite(period.prices?.[item.product]) || period.prices[item.product] <= 0))) errors.push('青浦价格参考历史期次缺少完整逐品种数据')
for (const [id, source] of Object.entries(sources)) {
  if (!source.title || !source.publisher || !source.published || !/^https:\/\//.test(source.url) || !source.scope) errors.push(`来源 ${id} 缺少必要字段`)
}
for (const [index, row] of seasons.entries()) {
  for (const key of ['slug', 'product', 'variety', 'origin', 'region', 'evidenceYear', 'note', 'reviewedAt']) if (!row[key]) errors.push(`季节条目 ${index} 缺少 ${key}`)
  if (!['fruit', 'vegetable'].includes(row.category)) errors.push(`季节条目 ${index} 的 category 无效`)
  for (const key of ['matureMonths', 'peakMonths', 'supplyMonths']) if (!Array.isArray(row[key]) || !row[key].every(validMonth)) errors.push(`季节条目 ${index} 的 ${key} 无效`)
  if (![...row.matureMonths, ...row.peakMonths, ...row.supplyMonths].length) errors.push(`季节条目 ${index} 没有月份`)
  for (const id of row.sourceIds ?? []) if (!sources[id]) errors.push(`季节条目 ${index} 引用未知来源 ${id}`)
  for (const month of [...row.matureMonths, ...row.peakMonths, ...row.supplyMonths]) {
    const monthIds = row.sourceIdsByMonth?.[String(month)]
    if (!Array.isArray(monthIds) || !monthIds.length) errors.push(`季节条目 ${index} 的 ${month} 月缺少直接来源`)
    else for (const id of monthIds) if (!sources[id]) errors.push(`季节条目 ${index} 的 ${month} 月引用未知来源 ${id}`)
  }
  if (!existsSync(resolve(`docs/produce/${row.slug}.md`))) errors.push(`季节条目 ${index} 缺少商品页 ${row.slug}`)
}
for (const [slug, card] of Object.entries(decisionCards)) {
  if (!existsSync(resolve(`docs/produce/${slug}.md`))) errors.push(`购买卡 ${slug} 缺少商品页`)
  if (!seasons.some(row => row.slug === slug)) errors.push(`购买卡 ${slug} 缺少季节条目`)
  for (const key of ['title', 'lead', 'check', 'channel', 'storage', 'quantity', 'onlineTag', 'stockTag']) if (typeof card[key] !== 'string' || !card[key].trim()) errors.push(`购买卡 ${slug} 缺少 ${key}`)
  if (!readFileSync(resolve(`docs/produce/${slug}.md`), 'utf8').includes(`<BuyingCard product="${slug}"`)) errors.push(`商品页 ${slug} 未显示购买卡`)
}
for (let month = 1; month <= 12; month++) {
  for (const category of ['fruit', 'vegetable']) {
    if (!seasons.some(row => row.category === category && [...row.matureMonths, ...row.peakMonths, ...row.supplyMonths].includes(month))) errors.push(`${month} 月缺少${category === 'fruit' ? '水果' : '蔬菜'}线索`)
  }
}
function walk(dir) {
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, item.name)
    if (item.isDirectory() && item.name !== '.vitepress') walk(path)
    else if (extname(path) === '.md') {
      const body = readFileSync(path, 'utf8')
      for (const match of body.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const link = match[1].split('#')[0]
        if (!link || /^https?:\/\//.test(link) || link.startsWith('mailto:')) continue
        const target = link.startsWith('/') ? resolve('docs', link.slice(1)) : resolve(dirname(path), link)
        if (![target, `${target}.md`, resolve(target, 'index.md')].some(existsSync)) errors.push(`${path}: 无效本地链接 ${link}`)
      }
    }
  }
}
walk('docs')
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1 }
else console.log(`内容结构检查通过：${seasons.length} 条季节记录，${Object.keys(sources).length} 条来源。`)
