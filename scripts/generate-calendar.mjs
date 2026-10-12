import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const entries = JSON.parse(readFileSync(resolve('data/seasons.json'), 'utf8'))
const sources = JSON.parse(readFileSync(resolve('data/sources.json'), 'utf8'))
const check = process.argv.includes('--check')

for (let month = 1; month <= 12; month++) {
  const rows = { fruit: [], vegetable: [] }
  for (const entry of entries) {
    const status = entry.matureMonths.includes(month) ? '产地采收' : entry.peakMonths.includes(month) ? '集中上市' : entry.supplyMonths.includes(month) ? '市场供应' : null
    if (!status) continue
    const monthSourceIds = entry.sourceIdsByMonth[String(month)]
    const refs = monthSourceIds.map(id => `[${sources[id].title}](${sources[id].url})`).join('、')
    rows[entry.category].push(`### [${entry.product}](/produce/${entry.slug}) · ${status}\n\n- 品种或范围：${entry.variety}\n- 产地与适用范围：${entry.origin}；${entry.region}\n- 资料说明：${entry.evidenceYear} 年资料。${entry.note}\n- 直接来源：${refs}`)
  }
  const title = `${String(month).padStart(2, '0')} 月采购线索`
  const section = (category, label) => `## ${label}\n\n${rows[category].length ? rows[category].join('\n\n') : `暂无已核实的${label}条目。欢迎按[贡献规范](/contributing)补充资料。`}`
  const output = `---\ntitle: ${title}\n---\n\n# ${title}\n\n> 本页是有出处的历史供应线索，**不是今年实时行情或最低价榜**。同一商品的“采收、集中上市、市场供应”含义不同；到手品质和价格仍要结合本地情况。\n\n${section('fruit', '水果')}\n\n${section('vegetable', '蔬菜')}\n\n[返回全年日历](/calendar/) · [查看商品指南](/produce/) · [比较零售价格](/compare/)\n`
  const path = resolve(`docs/calendar/${String(month).padStart(2, '0')}.md`)
  if (check) {
    if (readFileSync(path, 'utf8') !== output) throw new Error(`${path} 需要重新生成，请运行 npm run calendar`)
  } else writeFileSync(path, output)
}

const sourceRows = Object.entries(sources).map(([id, source]) =>
  `| \`${id}\` | [${source.title}](${source.url}) | ${source.publisher} | ${source.published} | ${source.scope} |`
)
const sourcePage = `# 来源与核实方法\n\n季节资料的来源元数据统一登记在仓库 \`data/sources.json\`。每条包含标题、发布机构、发布日期、链接和适用范围；日历记录引用来源 ID，商品页在关键结论旁直接链接原资料。\n\n市场月报描述**当年观察或预测**；专业贮藏规程描述**商用条件**。编辑时必须保留这些限制。社区帖子可提供待验证线索，但点赞数不代表正确；不复制原文或图片。\n\n| ID | 资料 | 发布机构 | 日期 | 使用边界 |\n| --- | --- | --- | --- | --- |\n${sourceRows.join('\n')}\n\n发现失效链接或来源与结论不相符，请按[纠错说明](/contributing)提交。\n`
const sourcePath = resolve('docs/sources.md')
if (check) {
  if (readFileSync(sourcePath, 'utf8') !== sourcePage) throw new Error(`${sourcePath} 需要重新生成，请运行 npm run calendar`)
} else writeFileSync(sourcePath, sourcePage)
