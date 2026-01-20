# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

# Leveling Game for Kids

## 🚀 線上佈署與更新 (GitHub Pages)

本專案已配置 GitHub Actions 自動化佈署。

### 第一次佈署設定
1. 將程式碼推送到您的 GitHub 儲存庫。
2. 前往 GitHub 網頁版 -> **Settings** -> **Pages**。
3. 在 **Build and deployment** 下方的 **Source**，將原本的 `Deploy from a branch` 改為 **`GitHub Actions`**。
4. 稍等 1-2 分鐘，GitHub 會自動完成編譯並提供遊玩網址。

### 未來如何更新？
這是最方便的地方！未來您只要：
1. 在本機修改好程式碼（例如：修改 `APP_VERSION` 或遊戲內容）。
2. 執行 Git **Commit** 與 **Push** 推送到 GitHub。
3. **GitHub 會自動偵測到更新，並重新執行編譯與發布。** 您不需要手動執行任何命令，過幾分鐘後網址就會自動變成最新版。

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
