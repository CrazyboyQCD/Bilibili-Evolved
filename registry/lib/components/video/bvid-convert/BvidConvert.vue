<template>
  <div class="bvid-convert">
    <div v-if="aid" class="bvid-convert-item">
      {{ aid }}
      <div class="bvid-convert-item-copy" title="复制链接" @click="copyLink(CopyIdType.Aid)">
        <VIcon :size="16" :icon="aidCopied ? 'mdi-check' : 'mdi-link'" />
      </div>
    </div>
    <div v-if="bvid" class="bvid-convert-item">
      {{ bvid }}
      <div class="bvid-convert-item-copy" title="复制链接" @click="copyLink(CopyIdType.Bvid)">
        <VIcon :size="16" :icon="bvidCopied ? 'mdi-check' : 'mdi-link'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { videoChange } from '@/core/video'
import { getComponentSettings } from '@/core/settings'
import { select } from '@/core/spin-query'
import { matchUrlPattern } from '@/core/utils'
import { getFriendlyTitle } from '@/core/utils/title'
import { bangumiUrls } from '@/core/utils/urls'
import { VIcon } from '@/ui'
import { BvidConvertOptions } from '.'

const { options } = getComponentSettings<BvidConvertOptions>('bvidConvert')
enum CopyIdType {
  Aid = 'aid',
  Bvid = 'bvid',
}
const copyIds = [CopyIdType.Aid, CopyIdType.Bvid]
type LinkProvider = (context: { id: string; query: string }) => string
const linkProviders: LinkProvider[] = [
  // 参数类页面, 如 festival
  ({ id, query }) => {
    if (copyIds.some(copyId => query.includes(`${copyId}=`))) {
      return `https://www.bilibili.com/video/${id}/`
    }
    return null
  },
  // 番剧
  ({ id }) => {
    if (bangumiUrls.some(u => matchUrlPattern(u))) {
      return `https://www.bilibili.com/video/${id}/`
    }
    return null
  },
  // 普通视频
  ({ id, query }) => {
    const params = new URLSearchParams(query)
    const newQuery = new URLSearchParams()
    for (const key of ['p', 't']) {
      const value = params.get(key)
      if (value) {
        newQuery.set(key, value)
      }
    }
    return `https://www.bilibili.com/video/${id}/${
      newQuery.size > 0 ? `?${newQuery.toString()}` : ''
    }`
  },
]

const aid = ref('')
const aidCopied = ref(false)
const bvid = ref('')
const bvidCopied = ref(false)

onMounted(() => {
  videoChange(async () => {
    aid.value = `av${unsafeWindow.aid}`
    bvid.value = unsafeWindow.bvid
    const link = (await select('.av-link,.bv-link,.bvid-link')) as HTMLElement
    if (link) {
      bvid.value = link.innerHTML.trim()
    }
  })
})

const copyLink = async (data: CopyIdType) => {
  const copiedRef = data === 'aid' ? aidCopied : bvidCopied
  if (copiedRef.value) {
    return
  }
  const context = {
    query: location.search,
    url: location.origin + location.pathname,
    id: data === 'aid' ? aid.value : bvid.value,
  }
  const link = linkProviders.map(p => p(context)).filter(it => it !== null)[0]
  if (options.copyWithTitle) {
    await navigator.clipboard.writeText(`${getFriendlyTitle()} ${link}`)
  } else {
    await navigator.clipboard.writeText(link)
  }
  copiedRef.value = true
  setTimeout(() => (copiedRef.value = false), 1000)
}
</script>

<style lang="scss">
@import 'common';
.bvid-convert {
  order: -1;
  flex-direction: column;
  border-radius: 4px;
  padding: 6px 8px;
  user-select: text;
  box-sizing: border-box;
  box-shadow: 0 0 0 1px #8884;
  background-color: #fff;
  body.dark & {
    background-color: var(--be-color-card-bg, #333);
  }
  &-item {
    font-size: 14px;
    @include h-center(6px);
    &-copy {
      transition: transform 0.3s ease-out;
      cursor: pointer;
      &:active {
        transform: scale(0.9);
      }
    }
  }
}
</style>
