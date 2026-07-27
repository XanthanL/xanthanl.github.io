// ============================================================
// 星系数据档案：每一个天体对应一个已部署的项目。
// 新增项目时只需在 SECTORS 中追加一条记录即可自动入轨。
// ============================================================

export interface Sector {
  id: string
  index: string        // 编号，如 '01'
  label: string        // HUD 代号，如 'DGN_08'
  name: string         // 项目名
  desc: string         // 项目描述
  tags: string[]       // 技术 / 主题标签
  color: string        // 天体主色
  url: string          // 主链接
  mirror?: string      // 镜像站
  repo?: string        // 仓库地址
  // ---- 轨道参数（太阳忽略 dist/speed）----
  dist: number         // 轨道半径
  speed: number        // 公转速度
  size: number         // 天体尺寸
  kind: 'sun' | 'sphere' | 'torusKnot' | 'octahedron' | 'icosahedron' | 'box' | 'dodecahedron' | 'gasGiant' | 'torus'
  moon?: boolean       // 环绕卫星
  cloud?: boolean      // 大气云层
  rings?: boolean      // 行星环
}

export const SECTORS: Sector[] = [
  {
    id: 'CORE',
    index: '01',
    label: 'OBS_01',
    name: 'Xanthan 观测站',
    desc: '你现在所在的地方。整个星系的观测枢纽——每一颗行星都是一个已经部署上线的项目，点击行星即可锁定目标，建立链接后跃迁前往。',
    tags: ['REACT', 'THREE.JS', 'R3F'],
    color: '#32cd32',
    url: 'https://github.com/XanthanL',
    repo: 'https://github.com/XanthanL/xanthanl.github.io',
    dist: 0,
    speed: 0,
    size: 2.5,
    kind: 'sun',
  },
  {
    id: 'ASCII',
    index: '02',
    label: 'ASC_02',
    name: 'ASCII LAB 文字工坊',
    desc: '把文字变成字符艺术。支持中文多行、八种字体、实心/空心/渐变/立体等样式，字符集从经典 10 阶到汉字笔画、盲文点阵；附带创意特效实验室——数字雨、等离子、图像转字符。纯前端无依赖。',
    tags: ['ASCII', '字符画', '纯前端'],
    color: '#00ff9f',
    url: 'https://ascii-art-two-theta.vercel.app/',
    repo: 'https://github.com/XanthanL/ascii-art',
    dist: 8,
    speed: 0.4,
    size: 0.28,
    kind: 'box',
  },
  {
    id: 'PICMARK',
    index: '03',
    label: 'PMK_03',
    name: '图印工坊 PicMark Studio',
    desc: '浏览器内批量个性化图片生成：上传底图、拖拽标记文字区域、导入名单，一键生成并打包 ZIP。工牌、证书、邀请函六套预设模板，自适应字号，水墨印章风 UI。图片不出本机，隐私无忧。',
    tags: ['批量生成', 'CANVAS', 'MIT'],
    color: '#ff6ec7',
    url: 'https://xanthanl.github.io/picmark-studio/',
    mirror: 'https://picmark-studio.vercel.app/',
    repo: 'https://github.com/XanthanL/picmark-studio',
    dist: 11.5,
    speed: 0.28,
    size: 0.5,
    kind: 'icosahedron',
  },
  {
    id: 'SHUYAN',
    index: '04',
    label: 'SHY_04',
    name: '树言·旅记',
    desc: '一位行走者的八年旅途（2018–2026）。从故宫红墙到梅里雪山，在零下三十度的松花江上听见冰裂，在大漠深处触碰千年壁画。时间线 + 交互式旅行地图，记录带有体温与泥土味的真实生活。',
    tags: ['旅行', '时间线', '地图'],
    color: '#38bdf8',
    url: 'https://xanthanl.github.io/shuyan-travel/',
    repo: 'https://github.com/XanthanL/shuyan-travel',
    dist: 15,
    speed: 0.2,
    size: 0.55,
    kind: 'torus',
    cloud: true,
  },
  {
    id: 'MUSIC',
    index: '05',
    label: 'MUS_05',
    name: 'Electric Mirage',
    desc: '独立音乐人 XanthanL 的首张作品。融合 Synth-Pop、80s Disco 鼓点与 Neo-Psychedelic 质感的迷幻声景，邀请你进入一个梦幻的 Lo-Fi 宇宙。',
    tags: ['SYNTH-POP', 'PSYCHEDELIC', 'LO-FI'],
    color: '#8b00ff',
    url: 'https://xanthanl.github.io/XanthanLMusic/',
    repo: 'https://github.com/XanthanL/XanthanLMusic',
    dist: 18.5,
    speed: 0.15,
    size: 0.6,
    kind: 'torusKnot',
    moon: true,
  },
  {
    id: 'ARH',
    index: '06',
    label: 'ARH_06',
    name: 'ARH 意识形态测试',
    desc: '政治光谱测试站。在经济、权力、文化、认同、生态、科技六个维度上作答，算法从三十余种意识形态标签中判定你的坐标——从赛博亚当·斯密到血肉苦弱，机械飞升。',
    tags: ['测试', '六维坐标', 'REACT'],
    color: '#c8d8ff',
    url: 'https://xanthanl.github.io/ARH',
    repo: 'https://github.com/XanthanL/ARH',
    dist: 22.5,
    speed: 0.11,
    size: 0.55,
    kind: 'octahedron',
    moon: true,
  },
  {
    id: 'MARS',
    index: '07',
    label: 'MRS_07',
    name: '强渡火星 Forcing Mars',
    desc: '卡牌 Roguelike。二十八世纪末，你是独自下潜火星地底的先遣宇航员：从地表荒原到 2000 米地核深处，电池有限，氧气有限，勇气也一样。击败火星吞噬者，为人类建立第一个前哨站。',
    tags: ['卡牌', 'ROGUELIKE', '科幻'],
    color: '#ff4500',
    url: 'https://xanthanl.github.io/forcing-mars/',
    repo: 'https://github.com/XanthanL/forcing-mars',
    dist: 27,
    speed: 0.08,
    size: 0.65,
    kind: 'dodecahedron',
  },
  {
    id: 'DIAGONAL',
    index: '08',
    label: 'DGN_08',
    name: 'DIAGONAL 对角线计划',
    desc: '从中国东北延伸至西南的长期艺术项目，呼应胡焕庸线。以行为艺术档案、跨学科研究与在地创作为核心，在自贡、鹤岗、成都等地展开实践——文献、地图集与艺术家档案持续更新中。',
    tags: ['当代艺术', '在地创作', 'NEXT.JS'],
    color: '#e8b04b',
    url: 'https://www.diagonal-art.com/',
    repo: 'https://github.com/XanthanL/Diagonal',
    dist: 32.5,
    speed: 0.055,
    size: 0.9,
    kind: 'gasGiant',
    rings: true,
  },
]

export const PLANETS = SECTORS.filter((s) => s.kind !== 'sun')

export const getSector = (id: string): Sector =>
  SECTORS.find((s) => s.id === id) ?? SECTORS[0]
