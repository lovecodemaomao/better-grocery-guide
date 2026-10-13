# 高性价比生活采购指南

在线使用：[省心买菜首页](https://lovecodemaomao.github.io/better-grocery-guide/) · [今晚买菜](https://lovecodemaomao.github.io/better-grocery-guide/scenes/tonight.html)。仓库中的 `docs/scenes/tonight.md` 是源文件，网页入口以以上地址为准。

面向中国大陆普通消费者的免费、开放采购知识库。先从果蔬开始：什么时候关注、怎样挑、哪里买、怎样保存，以及怎样把运费和损耗算进价格。

**性价比不等于最低标价。** 本站区分自然成熟、集中上市和市场供应；历史资料不代表今年的实时价格。每条重要建议尽量附上适用范围和出处，缺少可靠资料时明确写“待核实”。

当前公开版本从[今晚买菜](docs/scenes/tonight.md)、[买点水果](docs/scenes/fruit.md)和[备点存货](docs/scenes/stock.md)三个场景进入，首页自动展示当月候选。也可查按水果、蔬菜分栏的[十二个月日历](docs/calendar/index.md)。[青浦区蔬菜价格参考](docs/compare/reference.md)提供有日期的历史监测范围和快速核价；[零售比价页](docs/compare/index.md)可记录京东、盒马等渠道的同区报价并按元/公斤换算。记录先保存在用户自己的浏览器，公开平台报价仍在采集与核实中。约三十种水果与更多蔬菜的扩充进度见[阶段进度](docs/roadmap.md)。编辑方法参考[《高性价比人生指南》](https://github.com/eternity4719/HowToLiveBetter)的来源核实思路；本站内容独立编写。

## 阅读与运行

内容在 [`docs`](docs/index.md)，可直接在 GitHub 阅读。网页用 VitePress 构建：

```sh
npm ci
npm run docs:dev
npm run check
```

首次安装依赖时使用 `npm install` 生成锁文件。`npm run calendar` 会从 [`data/seasons.json`](data/seasons.json) 生成十二个月页面；不要手改生成页。`npm run check` 会核对数据、链接、生成结果并构建网站。

## 内容维护

- [投稿与纠错](docs/contributing.md)
- [来源登记](docs/sources.md)
- [商品模板](templates/produce.md)
- [阶段进度](docs/roadmap.md)

原创正文使用 [CC BY 4.0](LICENSE-CONTENT)，代码使用 [MIT](LICENSE-CODE)。站点引用的外部资料及图片不因本仓库授权而改变其原有权利。
