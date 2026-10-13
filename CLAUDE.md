# 项目协作约定

- 完成功能改动后，先运行 `npm run lint`、`npm run build` 和必要的功能检查。
- 验证通过后及时提交并推送到 `main`，由 `.github/workflows/deploy.yml` 自动部署至 GitHub Pages；随后检查对应 GitHub Actions workflow/run，确认部署成功后再汇报。不要把“本地验证通过”当作部署完成。
- 组件保持职责单一。大组件（尤其 Canvas / D3 渲染）应将纯渲染、数据转换或交互状态拆分到同目录的小型模块，避免单文件长期增长。
- 代码示例高亮必须以 React 文本节点渲染，不要将输入/代码拼接进 `dangerouslySetInnerHTML`。
