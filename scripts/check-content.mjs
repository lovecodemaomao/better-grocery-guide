import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname, extname } from 'node:path'

const sources = JSON.parse(readFileSync('data/sources.json', 'utf8'))
const seasons = JSON.parse(readFileSync('data/seasons.json', 'utf8'))
const errors = []
const validMonth = m => Number.isInteger(m) && m >= 1 && m <= 12
for (const [id, source] of Object.entries(sources)) {
  if (!source.title || !source.publisher || !source.published || !/^https:\/\//.test(source.url) || !source.scope) errors.push(`来源 ${id} 缺少必要字段`)
}
for (const [index, row] of seasons.entries()) {
  for (const key of ['slug', 'product', 'variety', 'origin', 'region', 'evidenceYear', 'note', 'reviewedAt']) if (!row[key]) errors.push(`季节条目 ${index} 缺少 ${key}`)
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
