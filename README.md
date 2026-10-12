# 高性价比生活采购指南

面向中国大陆普通消费者的免费、开放采购知识库。先从果蔬开始：什么时候关注、怎样挑、哪里买、怎样保存，以及怎样把运费和损耗算进价格。

**性价比不等于最低标价。** 本站区分自然成熟、集中上市和市场供应；历史资料不代表今年的实时价格。每条重要建议尽量附上适用范围和出处，缺少可靠资料时明确写“待核实”。

当前公开版本为**样板版**：十二个月日历已可浏览，六类重点指南较完整，其他关联页仅收录已核实线索。约三十种水果与更多蔬菜的扩充进度见[阶段进度](docs/roadmap.md)。编辑方法参考[《高性价比人生指南》](https://github.com/eternity4719/HowToLiveBetter)的来源核实思路；本站内容独立编写。

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
