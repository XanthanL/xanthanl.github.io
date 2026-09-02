<p align="center">
  <img src="public/logo.svg" width="96" alt="XanthanL Logo" />
</p>

<h1 align="center">XanthanL | Project Constellation 项目星系</h1>

<p align="center">
  一个 3D 太阳系风格的个人项目导航站——每一颗行星都是一个已部署上线的真实项目，点击行星即可跃迁前往。
</p>

<p align="center">
  <a href="https://xanthanl.github.io/"><b>🌌 进入观测站 →</b></a>
</p>

<p align="center">
  <img src="assets-src/screenshot.png" width="600" alt="站点截图" />
</p>

## 🪐 星系成员

| 编号 | 天体 | 项目 | 传送门 |
|:---:|:---:|---|---|
| 01 | ☀️ 恒星 | Xanthan 观测站（本站） | [xanthanl.github.io](https://xanthanl.github.io/) |
| 02 | 🪐 气态巨星 | DIAGONAL 对角线计划 | [diagonal-art.com](https://www.diagonal-art.com/) |
| 03 | 🔷 二十面体 | GAME LAB 前端游戏实验场 | [/game-lab](https://xanthanl.github.io/game-lab/) |
| 04 | 🌀 环结 | NeonDAW 浏览器音频工作站 | [neon-daw](https://xanthanl.github.io/neon-daw/) |
| 05 | 🔶 十二面体 | 图印工坊 PicMark Studio | [/picmark-studio](https://xanthanl.github.io/picmark-studio/) |
| 06 | 💍 环体 | 树言·旅记 | [game-lab/shuyan-travel](https://xanthanl.github.io/game-lab/shuyan-travel/) |
| 07 | 🔵 球体 | Electric Mirage 专辑 | [game-lab/XanthanLMusic](https://xanthanl.github.io/game-lab/XanthanLMusic/dist/) |
| 08 | 🔸 八面体 | 弦诵 XianSong（Android 阅读器） | [Releases 下载 APK](https://github.com/XanthanL/XianSong/releases) |
| 09 | 📦 立方体 | Photoria · Backrooms Camera（Android 滤镜相机） | [Releases 下载 APK](https://github.com/XanthanL/backrooms-camera/releases) |

## 🛠️ 技术栈

React 18 · TypeScript · Vite 5 · Three.js（@react-three/fiber + drei + postprocessing）· Tailwind CSS · Framer Motion

## 🚀 本地开发

```bash
npm install        # 安装依赖
npm run dev        # 本地开发（Vite）
npm run build      # 生产构建
npm run icons      # 从 SVG 源文件重新生成 favicon / 分享图
```

新增项目只需在 [`src/data/projects.ts`](src/data/projects.ts) 里加一条记录——形状、颜色、轨道、介绍全部数据驱动。

## 📦 部署

推送到 `main` 分支后由 GitHub Actions 自动构建部署到 GitHub Pages。
