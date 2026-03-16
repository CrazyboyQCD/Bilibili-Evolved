<template>
  <VButton round class="manual-like" @click="like">
    <div id="text" :class="{ like: isLike }">正在点赞: {{ curLikeCnt }} / {{ totalLikeCnt }}</div>
    <VIcon v-show="!isLike" colored icon="like" :size="20" />
  </VButton>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const list = ref<string[] | null>(null)
const isClick = ref(false)
const isLike = ref(false)
const totalLikeCnt = ref(0)
const curLikeCnt = ref(0)
const feedsLikeQueue = ref<HTMLElement[]>([])

const like = () => {
  if (isClick.value) {
    return
  }
  isClick.value = true
  const likeButtons: HTMLElement[] = []
  for (const e of Array.from(
    document.getElementsByClassName('bili-dyn-title__text'),
  ) as HTMLElement[]) {
    if (list.value?.includes(e.textContent.trim())) {
      continue
    }
    const likeButton = e.closest('.bili-dyn-item__main').querySelector('.bili-dyn-action.like')
    if (likeButton && !likeButton.classList.contains('active')) {
      likeButtons.push(likeButton as HTMLElement)
    }
  }
  feedsLikeQueue.value.push(...likeButtons)
  totalLikeCnt.value = feedsLikeQueue.value.length
  curLikeCnt.value = 0
  isLike.value = true
  const t = window.setInterval(() => {
    if (feedsLikeQueue.value.length === 0) {
      isLike.value = false
      isClick.value = false
      clearInterval(t)
      return
    }
    const button = feedsLikeQueue.value.shift()
    button?.click()
    curLikeCnt.value++
  }, 1200)
}

defineExpose({
  list,
})
</script>

<style lang="scss">
.manual-like {
  left: 5px;
  z-index: 1001;
  height: 30px;
  position: fixed;

  * {
    color: rgb(251, 114, 153);
  }

  #text {
    overflow: hidden;
    white-space: nowrap;
    max-width: 0px;
    transition: max-width 0.4s linear !important;

    &.like {
      max-width: 150px;
    }
  }
}
</style>
