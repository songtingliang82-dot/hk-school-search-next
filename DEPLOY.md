# 部署说明

## 当前状态

项目已构建完成，静态文件位于 `dist/` 目录（约 900+ 页面）。

## 方案一：Vercel（推荐，支持自动更新）

1. 打开 https://vercel.com/new
2. 用 GitHub 账号登录
3. 导入 `hk-school-search-next` 仓库
4. 框架预设选 `Next.js`
5. 点击 Deploy

**后续更新**：修改代码 → git push → 自动重新部署

## 方案二：Netlify Drop（最快，立即可用）

1. 打开 https://app.netlify.com/drop
2. 把 `dist/` 文件夹拖进去
3. 10 秒内获得 HTTPS 链接

**后续更新**：重新拖放 `dist/` 文件夹即可

## 方案三：GitHub Pages（免费，适合国内访问）

1. 把 `dist/` 内容 push 到 `gh-pages` 分支
2. 在仓库 Settings > Pages 中启用

## 本地预览

```bash
npx serve dist -l 3000
```
