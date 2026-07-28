// ============================================================
// 品牌资源生成脚本：从 SVG 源文件生成 favicon.ico 与微信分享图
// 用法：npm run icons
// ============================================================
import sharp from 'sharp'
import pngToIco from 'png-to-ico'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const publicDir = path.join(root, 'public')

async function main() {
  await mkdir(publicDir, { recursive: true })

  // 1. favicon.ico：从 favicon.svg 渲染 16/32/48/64 四档尺寸合成
  const faviconSvg = await readFile(path.join(publicDir, 'favicon.svg'))
  const sizes = [16, 32, 48, 64]
  const pngs = await Promise.all(
    sizes.map((s) => sharp(faviconSvg, { density: 300 }).resize(s, s).png().toBuffer())
  )
  await writeFile(path.join(publicDir, 'favicon.ico'), await pngToIco(pngs))
  console.log('✓ public/favicon.ico  (16/32/48/64)')

  // 2. 微信转发缩略图：120x120 PNG
  const shareSvg = await readFile(path.join(root, 'assets-src', 'wechat-share.svg'))
  await sharp(shareSvg, { density: 300 })
    .resize(120, 120)
    .png()
    .toFile(path.join(publicDir, 'wechat-share.png'))
  console.log('✓ public/wechat-share.png  (120x120)')

  // 3. 大尺寸分享图（Open Graph 通用，微信外的平台也能用）
  await sharp(shareSvg, { density: 300 })
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'share-512.png'))
  console.log('✓ public/share-512.png  (512x512)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
