import { categories } from '@/components/utils/categories/data'
// import supportedNames from './supported-names.json'

const supportedNames = [
  '推广',
  '正在直播',
  '动画',
  '番剧',
  '番剧动态',
  '国创',
  '国产原创相关',
  '漫画',
  '音乐',
  '舞蹈',
  '游戏',
  '知识',
  '课堂',
  '科技',
  '运动',
  '汽车',
  '生活',
  '美食',
  '动物圈',
  '鬼畜',
  '时尚',
  '资讯',
  '娱乐',
  '专栏',
  '电影',
  '电视剧',
  '影视',
  '纪录片',
  '特别推荐',
]

const excludedNames = [
  '推广',
  '正在直播',
  '番剧动态',
  '国产原创相关',
  '漫画',
  '课堂',
  '专栏',
  '特别推荐',
]

export const supportedCategories = Object.fromEntries(
  Object.entries(categories).filter(([name]) => {
    if (excludedNames.includes(name)) {
      return false
    }
    if (!supportedNames.includes(name)) {
      return false
    }
    return true
  }),
)
