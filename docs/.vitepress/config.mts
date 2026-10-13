import { defineConfig } from 'vitepress'

const base = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/'
const repository = process.env.GITHUB_REPOSITORY

export default defineConfig({
  lang: 'zh-CN',
  title: '高性价比生活采购指南',
  description: '有出处的果蔬采购、挑选与家庭储存指南',
  base,
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }]],
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '应季日历', link: '/calendar/' },
      { text: '零售比价', link: '/compare/' },
      { text: '商品指南', link: '/produce/' },
      { text: '购买渠道', link: '/channels/' },
      { text: '成本计算', link: '/value/' }
    ],
    sidebar: {
      '/compare/': [{ text: '零售比价', items: [
        { text: '录入与比较', link: '/compare/' },
        { text: '青浦区价格参考', link: '/compare/reference' },
        { text: '青浦区采集进度', link: '/compare/qingpu' }
      ] }],
      '/calendar/': [{ text: '应季采购', items: [
        { text: '说明', link: '/calendar/' },
        ...Array.from({ length: 12 }, (_, i) => ({ text: `${i + 1} 月`, link: `/calendar/${String(i + 1).padStart(2, '0')}` }))
      ] }],
      '/produce/': [{ text: '商品指南', items: [
        { text: '全部商品', link: '/produce/' },
        { text: '苹果', link: '/produce/apple' },
        { text: '香蕉', link: '/produce/banana' },
        { text: '柑橘', link: '/produce/citrus' },
        { text: '草莓', link: '/produce/strawberry' },
        { text: '番茄', link: '/produce/tomato' },
        { text: '叶菜', link: '/produce/leafy-greens' }
      ] }],
      '/channels/': [{ text: '购买渠道', items: [
        { text: '渠道判断', link: '/channels/' },
        { text: '网购判断表', link: '/channels/online' }
      ] }],
      '/value/': [{ text: '性价比', items: [{ text: '到手成本', link: '/value/' }] }]
    },
    search: { provider: 'local', options: { locales: { root: { translations: {
      button: { buttonText: '搜索商品或主题', buttonAriaLabel: '搜索' },
      modal: { noResultsText: '没有找到结果', resetButtonTitle: '清空', displayDetails: '显示详情',
        footer: { selectText: '选择', selectKeyAriaLabel: '选择', navigateText: '切换', navigateUpKeyAriaLabel: '上', navigateDownKeyAriaLabel: '下', closeText: '关闭' } }
    } } } } },
    editLink: repository ? { pattern: `https://github.com/${repository}/edit/main/docs/:path`, text: '建议修改此页' } : undefined,
    footer: { message: '采购建议有地区与时间限制，请查看每页来源和核实日期。', copyright: '正文 CC BY 4.0 · 代码 MIT' }
  }
})
