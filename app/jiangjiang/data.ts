export type JiangjiangMediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  posterSrc?: string;
  alt: string;
  title: string;
  description: string;
  meta: string;
  width?: number;
  height?: number;
};

export type JiangjiangGallerySection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  items: JiangjiangMediaItem[];
};

export type JiangjiangMemory = {
  date: string;
  title: string;
  description: string;
  note?: string;
};

export const heroStats = [
  { label: "照片", value: "2 张" },
  { label: "视频", value: "6 段" },
  { label: "最近整理", value: "3 次分享" },
] as const;

export const gallerySections: JiangjiangGallerySection[] = [
  {
    id: "outdoor",
    eyebrow: "相册一",
    title: "出门的时候，尾巴像一小朵云",
    description: "先把散步和草地上的轻快片段放在前面，看起来就像一本刚翻开的春天小册子。",
    items: [
      {
        id: "park-walk-01",
        type: "image",
        src: "/jiangjiang/park-walk-01.jpg",
        alt: "穿着菠萝花纹小衣服的酱酱走在公园石板路上",
        title: "树荫下的散步背影",
        description: "安安静静往前走的时候，背影也很有自己的节奏。",
        meta: "照片",
        width: 853,
        height: 1280,
      },
      {
        id: "park-walk-02",
        type: "image",
        src: "/jiangjiang/park-walk-02.jpg",
        alt: "酱酱站在公园小路上回头张望",
        title: "回头看一眼",
        description: "像是在确认身后的人有没有好好跟上。",
        meta: "照片",
        width: 853,
        height: 1280,
      },
      {
        id: "park-chase",
        type: "video",
        src: "/jiangjiang/park-chase.mp4",
        posterSrc: "/jiangjiang/posters/park-chase.jpg",
        alt: "酱酱在草地上和另一只小动物追逐玩耍的视频",
        title: "草地上的追逐",
        description: "跑起来的时候，整片草地都跟着热闹一点。",
        meta: "视频 · 5 秒",
      },
    ],
  },
  {
    id: "close",
    eyebrow: "相册二",
    title: "被抱着、被看着，也认真看世界",
    description: "这些片段更近一点，像把酱酱抱到镜头前，也把日常贴得更近一点。",
    items: [
      {
        id: "car-cuddle",
        type: "video",
        src: "/jiangjiang/car-cuddle.mp4",
        posterSrc: "/jiangjiang/posters/car-cuddle.jpg",
        alt: "酱酱被抱在怀里坐车的视频",
        title: "坐车时的小依靠",
        description: "被抱在怀里的时候，镜头里的空气都变得软下来。",
        meta: "视频 · 4 秒",
      },
      {
        id: "window-rest",
        type: "video",
        src: "/jiangjiang/window-rest.mp4",
        posterSrc: "/jiangjiang/posters/window-rest.jpg",
        alt: "酱酱趴在窗边的小垫子上抱着玩具休息的视频",
        title: "窗边的小窝",
        description: "抱着玩具歇一会儿，窗外的光正好落下来。",
        meta: "视频 · 14 秒",
      },
    ],
  },
  {
    id: "quiet",
    eyebrow: "相册三",
    title: "在家里和夜色里，也有自己的小神气",
    description: "不一定需要很大的场景，小小走几步、夜里站一会儿，就已经足够让人记住。",
    items: [
      {
        id: "home-steps",
        type: "video",
        src: "/jiangjiang/home-steps.mp4",
        posterSrc: "/jiangjiang/posters/home-steps.jpg",
        alt: "酱酱在家里木地板上慢慢走动的视频",
        title: "地板上的小步子",
        description: "还带着一点奶呼呼的样子，走起来却已经很认真。",
        meta: "视频 · 10 秒",
      },
      {
        id: "night-pause",
        type: "video",
        src: "/jiangjiang/night-pause.mp4",
        posterSrc: "/jiangjiang/posters/night-pause.jpg",
        alt: "酱酱夜里站在石台边停下来看向镜头的视频",
        title: "夜里停一停",
        description: "灯光不亮，但那种小小的专注还是一下子就能看见。",
        meta: "视频 · 12 秒",
      },
      {
        id: "night-ball",
        type: "video",
        src: "/jiangjiang/night-ball.mp4",
        posterSrc: "/jiangjiang/posters/night-ball.jpg",
        alt: "酱酱夜里站在石台上看着手里的网球的视频",
        title: "看着球，也看着你",
        description: "像是在等一句话，也像是在等下一次把球轻轻丢出去。",
        meta: "视频 · 12 秒",
      },
    ],
  },
];

export const memoryTimeline: JiangjiangMemory[] = [
  {
    date: "2026.03.08",
    title: "一下子收进来好几段新片段",
    description:
      "聊天记录里，这一天有何韦连续发来的多张照片和视频。先不急着把故事讲满，只把那份“忽然看见酱酱”的开心记下来。",
    note: "先按分享日期粗略整理，具体的细节以后慢慢补。",
  },
  {
    date: "2026.03.10",
    title: "又补来一张照片",
    description:
      "隔了两天，又收到一张新的照片。单独的一张也很好，像是提醒这本小册子可以一点点长出来。",
  },
  {
    date: "2026.03.11",
    title: "回家的感觉，被一句话轻轻点出来",
    description:
      "这天又有照片和视频继续传来，聊天里还回了一句“这是刚回来那天吧”。于是这一页不只是影像，也多了一点时间的温度。",
  },
];

export const noteLines = [
  "希望你一直都能这样轻轻松松地散步、看人、看树，也看见每一个愿意停下来陪你的人。",
  "以后再收到新的照片和视频，就继续往这页里贴，让这本关于酱酱的小册子慢慢变厚。",
  "谢谢你把很普通的一天，也变成了值得留心、值得记住的一天。",
] as const;
