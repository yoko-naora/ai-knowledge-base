// category-mapping.js — Topic-to-category matching for recommend-prompts endpoint
// Auto-generated from prompts/data.json categories
const CATEGORIES = [
  { id: "dian-shang", name: "电商/商业海报", keywords: ["电商","商业","海报","产品","广告","品牌","营销","促销","商品","店铺","卖货"] },
  { id: "chuan-da", name: "穿搭/形象/造型", keywords: ["穿搭","形象","造型","时尚","服装","搭配","风格","穿衣","配色","衣橱"] },
  { id: "jiao-yu", name: "教育/科普/图解", keywords: ["教育","科普","图解","学习","教程","知识","教学","课程","考试","学校"] },
  { id: "you-xi", name: "游戏/娱乐/影视", keywords: ["游戏","娱乐","影视","动漫","电影","视频","音乐","综艺","动画","电视剧"] },
  { id: "pin-pai", name: "品牌/VI/包装", keywords: ["品牌","VI","包装","logo","视觉","标识","商标","设计系统","品牌形象"] },
  { id: "zi-pai", name: "自拍类", keywords: ["自拍","人像","写真","美颜","自画像","大头贴","头像"] },
  { id: "quan-jing", name: "全景/3D/空间", keywords: ["全景","3D","空间","VR","AR","三维","沉浸","虚拟","建模"] },
  { id: "jian-kang", name: "健康/生活/实用工具", keywords: ["健康","生活","实用","工具","健身","饮食","养生","医疗","运动","美容"] },
  { id: "shi-pin", name: "视频制作/Seedance", keywords: ["视频","制作","Seedance","动画","剪辑","短视频","vlog","影片"] },
];

const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

function matchCategory(topic) {
  if (!topic || typeof topic !== "string") return CATEGORIES[0].name;
  const t = topic.toLowerCase();
  let best = null, bestScore = 0;
  for (const cat of CATEGORIES) {
    let score = 0;
    for (const kw of cat.keywords) {
      if (t.includes(kw)) score += kw.length;
    }
    if (score > bestScore) { bestScore = score; best = cat.name; }
  }
  return best || CATEGORIES[0].name;
}

function recommendCategories(topic, count = 3) {
  if (!topic) return CATEGORY_NAMES.slice(0, count);
  const t = topic.toLowerCase();
  const scored = CATEGORIES.map(c => {
    let score = 0;
    for (const kw of c.keywords) if (t.includes(kw)) score += kw.length;
    return { name: c.name, score };
  });
  scored.sort((a, b) => b.score - a.score);
  if (scored[0].score === 0) return CATEGORY_NAMES.slice(0, count);
  return scored.slice(0, count).filter(s => s.score > 0).map(s => s.name);
}

module.exports = { CATEGORIES, CATEGORY_NAMES, matchCategory, recommendCategories };
