<template>
  <i ref="root" class="be-icon" :class="classes" :style="{ '--size': size + 'px' }" v-bind="attrs">
    <slot />
    <div v-if="icon in customIcons" class="custom-icon" v-html="customIcons[icon]" />
  </i>
</template>

<script setup lang="ts">
import { computed, useAttrs, useTemplateRef } from 'vue'
import { customIcons } from '.'

const attrs = useAttrs()

const {
  icon = '',
  size = 24,
  colored = false,
} = defineProps<{ icon?: string; size?: number; colored?: boolean }>()

const classes = computed(() => {
  const base = []
  if (colored) {
    base.push('colored')
  }
  if (icon === '' || icon in customIcons) {
    return base
  }
  if (icon.startsWith('mdi-')) {
    return [...base, 'mdi', icon]
  }
  return [...base, `be-iconfont-${icon}`]
})
const root = useTemplateRef('root')
defineExpose({
  root,
})
</script>

<style lang="scss">
/** 由于允许自定义SVG插入, 样式不能是scoped的, 否则匹配不上 */
@font-face {
  font-family: 'be-iconfont-bilifont';
  src: url('//s1.hdslb.com/bfs/seed/jinkela/header-v2/asserts/iconfont.ttf') format('truetype');
}
@font-face {
  font-family: 'be-iconfont-vanfont';
  src: url('//s1.hdslb.com/bfs/static/jinkela/video/asserts/iconfont.6401a86.ttf')
    format('truetype');
}
@import './bilifont';
@import './vanfont';
.be-icon {
  color: inherit;
  fill: inherit;
  stroke: inherit;
  font-size: var(--size);
  font-style: normal;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  @include bilifont();
  @include vanfont();
  &:not(.colored) svg,
  &:not(.colored) svg path {
    fill: inherit;
    stroke: inherit;
    stroke-width: 0;
  }
  .custom-icon {
    display: flex;
    > svg {
      width: var(--size);
      height: var(--size);
    }
  }
}
</style>
