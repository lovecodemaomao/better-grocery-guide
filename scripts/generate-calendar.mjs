import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const entries = JSON.parse(readFileSync(resolve('data/seasons.json'), 'utf8'))
const sources = JSON.parse(readFileSync(resolve('data/sources.json'), 'utf8'))
const check = process.argv.includes('--check')
const link = entry => `[${entry.product}](/produce/${entry.slug})`
const uniqueLinks = entries => [...new Map(entries.map(entry => [entry.product, link(entry)])).values()].join('、') || '暂无已核实条目'
const statusFor = (entry, month) => entry.matureMonths.includes(month) ? '产地采收' : entry.peakMonths.includes(month) ? '集中上市' : entry.supplyMonths.includes(month) ? '市场供应' : null
const monthEntries = month => entries.filter(entry => statusFor(entry, month))
const latestSeasonReview = entries.map(entry => entry.reviewedAt).sort().at(-1)

for (let month = 1; month <= 12; month++) {
  const rows = { fruit: [], vegetable: [] }
  for (const entry of entries) {
    const status = statusFor(entry, month)
    if (!status) continue
    const monthSourceIds = entry.sourceIdsByMonth[String(month)]
    const refs = monthSourceIds.map(id => `[${sources[id].title}](${sources[id].url})`).join('、')
    rows[entry.category].push(`### [${entry.product}](/produce/${entry.slug}) · ${status}\n\n- 品种或范围：${entry.variety}\n- 产地与适用范围：${entry.origin}；${entry.region}\n- 资料说明：${entry.evidenceYear} 年资料。${entry.note}\n- 直接来源：${refs}`)
  }
  const title = `${String(month).padStart(2, '0')} 月采购线索`
  const section = (category, label) => `## ${label}\n\n${rows[category].length ? rows[category].join('\n\n') : `暂无已核实的${label}条目。欢迎按[贡献规范](/contributing)补充资料。`}`
  const quickRow = (category, label) => {
    const selected = monthEntries(month).filter(entry => entry.category === category)
    const ranked = selected.sort((a, b) => ['产地采收', '集中上市', '市场供应'].indexOf(statusFor(a, month)) - ['产地采收', '集中上市', '市场供应'].indexOf(statusFor(b, month)))
    const options = [...new Map(ranked.map(entry => [entry.product, `${link(entry)}（${statusFor(entry, month)}）`])).values()]
    return `- **${label}**：${options.join('、') || '暂无已核实条目'}。`
  }
  const output = `---\ntitle: ${title}\n---\n\n# ${title}\n\n## 这个月可以先看\n\n${quickRow('fruit', '水果')}\n${quickRow('vegetable', '蔬菜')}\n\n这些是有出处的历史供应线索，**不是今年实时行情或最低价榜**。“市场供应”可能来自库存、设施栽培和跨产区供应，不等于自然成熟。购买时核对产地、品质和本地到手价；下方逐项列出资料年份、适用范围与来源。\n\n${section('fruit', '水果')}\n\n${section('vegetable', '蔬菜')}\n\n[返回全年日历](/calendar/) · [查看商品指南](/produce/) · [比较零售价格](/compare/)\n`
  const path = resolve(`docs/calendar/${String(month).padStart(2, '0')}.md`)
  if (check) {
    if (readFileSync(path, 'utf8') !== output) throw new Error(`${path} 需要重新生成，请运行 npm run calendar`)
  } else writeFileSync(path, output)
}

const overviewRows = Array.from({ length: 12 }, (_, index) => {
  const month = index + 1
  const selected = monthEntries(month)
  const shortlist = (category, statuses) => uniqueLinks(selected.filter(entry => entry.category === category && statuses.includes(statusFor(entry, month))))
  return `## [${month} 月](./${String(month).padStart(2, '0')})\n\n- **水果**：采收／集中上市：${shortlist('fruit', ['产地采收', '集中上市'])}；其他市场供应：${shortlist('fruit', ['市场供应'])}。\n- **蔬菜**：采收／集中上市：${shortlist('vegetable', ['产地采收', '集中上市'])}；其他市场供应：${shortlist('vegetable', ['市场供应'])}。`
})
const overview = `# 全年果蔬采购清单\n\n按月份先看**产地采收或集中上市**，再看其他市场供应。没有已核实条目，**不表示当月没有可买的果蔬**。月份依据所列年份的公开资料；地区、品种及天气会改变上市时间。点击月份可看产区、品种和直接来源。\n\n[1 月](./01) · [2 月](./02) · [3 月](./03) · [4 月](./04) · [5 月](./05) · [6 月](./06) · [7 月](./07) · [8 月](./08) · [9 月](./09) · [10 月](./10) · [11 月](./11) · [12 月](./12)\n\n${overviewRows.join('\n\n')}\n\n## 怎么用这份清单\n\n- **产地采收**：资料明确提到产区采摘；购买时再核对产地和批次。\n- **集中上市**：资料明确提到上市量增多；集中上市不保证零售价最低。\n- **市场供应**：可能来自库存、设施栽培或其他产区，适合补充日常采购选择。\n\n每月页面还会给出水果、蔬菜的完整线索和直接来源。做采购决定时，结合[同城零售比价](/compare/)和实际品质。资料核实：${latestSeasonReview}。\n`
const overviewPath = resolve('docs/calendar/index.md')
if (check) {
  if (readFileSync(overviewPath, 'utf8') !== overview) throw new Error(`${overviewPath} 需要重新生成，请运行 npm run calendar`)
} else writeFileSync(overviewPath, overview)

const sourceRows = Object.entries(sources).map(([id, source]) =>
  `| \`${id}\` | [${source.title}](${source.url}) | ${source.publisher} | ${source.published} | ${source.scope} |`
)
const sourcePage = `# 来源与核实方法\n\n季节资料的来源元数据统一登记在仓库 \`data/sources.json\`。每条包含标题、发布机构、发布日期、链接和适用范围；日历记录引用来源 ID，商品页在关键结论旁直接链接原资料。\n\n市场月报描述**当年观察或预测**；专业贮藏规程描述**商用条件**。编辑时必须保留这些限制。社区帖子可提供待验证线索，但点赞数不代表正确；不复制原文或图片。\n\n| ID | 资料 | 发布机构 | 日期 | 使用边界 |\n| --- | --- | --- | --- | --- |\n${sourceRows.join('\n')}\n\n发现失效链接或来源与结论不相符，请按[纠错说明](/contributing)提交。\n`
const sourcePath = resolve('docs/sources.md')
if (check) {
  if (readFileSync(sourcePath, 'utf8') !== sourcePage) throw new Error(`${sourcePath} 需要重新生成，请运行 npm run calendar`)
} else writeFileSync(sourcePath, sourcePage)
