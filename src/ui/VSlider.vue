<template>
  <div
    ref="slider"
    class="be-slider"
    role="slider"
    :tabindex="focusable ? 0 : -1"
    @keydown.left.prevent.stop="offsetByStep(-1)"
    @keydown.right.prevent.stop="offsetByStep(1)"
  >
    <div ref="barContainer" class="bar-container" @click="setByCoord($event.offsetX)">
      <slot name="bar">
        <div class="default-bar" />
      </slot>
    </div>
    <MiniToast
      ref="thumbContainer"
      class="thumb-container"
      placement="top"
      :arrow="false"
      :style="{ left: thumbLeft }"
    >
      <slot name="thumb">
        <div class="default-thumb" />
      </slot>
      <template #toast>
        {{ displayFun(realValue) }}
      </template>
    </MiniToast>
  </div>
</template>

<script setup lang="ts">
/**
 * 提供一种数值输入方式
 *
 * 组件的值受 center 和 step 约束。如当 `center == 0.8`、`step == 1` 时，
 * 组件的可取值只能是 -0.2, 0.8, 1.8 等。即以 center 为起点，偏移整数倍个 step 的实数。
 *
 * 由于有上述约束，min, max 并不代表组件的最大与最小可取值，而是可取值的上下限（可等于）。
 *
 * # Props
 *
 * - focusable {boolean} {default: true} 是否可由 Tab 键获取到焦点
 * - min {number} {default: 0} 取值下限
 * - max {number} {default: 100} 取值上限
 * - value {number} {default: 0} 当前组件的值
 * - center {number} {default: 0} 取值对齐的中心与起点。
 *   当 center 被改变时，组件当前值也会被变更为对齐 center 的最接近的值。
 * - step {number} {default: 1} 相邻可取值的差
 * - display-fun {(v: number) => string} {default: v => String(v)}
 *   仅修改提示中显示内容的函数，不修改真实组件值。接受当前的组件值，返回用于显示的字符串
 *
 * # Emits
 *
 * - change 当值被改变时触发
 *
 *   params：
 *   - value {number} 改变时的值
 * - start 开始滑动时触发
 *
 *   params：
 *   - value {number} 触发时的值
 * - end 结束滑动时触发
 *
 *   params：
 *   - value {number} 触发时的值
 */

/*
 * 给定一个 value，其变为组件允许的值（即 realValue）需经历以下 2 步：
 * round -> limit
 * round: 将值限制到 step 和 center 共同决定的刻度上
 * limit: 将值限制到 realMin 和 realMax 的范围内
 *
 * 受限制的 value 用以下名称称呼：
 * rounded：以 center 为中心，偏移整数个 step 的 value 值。
 *   除 realMin 和 realMax 外，取整方式使用 Math.round
 * limited: 在 rounded 基础上被 realMin、realMax 约束的值
 *
 * 长度相关：
 * length：slider bar 上的一段长度，单位为像素
 * coord：slider bar 上某一点到左端点的像素距离
 */

import { ref, computed, watch, onMounted, useTemplateRef } from 'vue'
import MiniToast from '@/core/toast/MiniToast.vue'

// 将实数化为整数的函数，如 Math.round，Math.ceil
type IntoIntCallback = (value: number) => number
const emit = defineEmits<{
  change: [value: number]
  start: [value: number]
  end: [value: number]
}>()

const {
  focusable = true,
  min = 0,
  max = 100,
  value: _value = 0,
  center = 0,
  step = 1,
  displayFun = (v: number) => String(v),
} = defineProps<{
  focusable?: boolean
  min?: number
  max?: number
  value?: number
  center?: number
  step?: number
  displayFun?: (v: number) => string
}>()

// 用户输入值通过各种处理后得到的最终值，
// 用与显示给用户以及作为 change 事件的实际传入参数
const realValue = ref(0)

const slider = useTemplateRef('slider')
const barContainer = useTemplateRef('barContainer')
const thumbContainer = useTemplateRef('thumbContainer')

// 以 0 为中心，计算 value 对应的 step 数。intoIntCallback 用于化整。
const valueToStep = (value: number, intoIntCallback: IntoIntCallback = Math.round): number => {
  return intoIntCallback(value / step)
}

// 以 0 为中心，将 value 调整到 step 的整数倍上。intoIntCallback 用于化整。
const valueToStepped = (value: number, intoIntCallback: IntoIntCallback = Math.round): number => {
  return valueToStep(value, intoIntCallback) * step
}

// 将一个 value 按步骤转化为 rounded
const valueToRounded = (value: number, intoIntCallback: IntoIntCallback = Math.round): number => {
  return center + valueToStepped(value - center, intoIntCallback)
}

// 不大于 max 的对齐 step 与 center 的值
const realMax = computed(() => valueToRounded(max, Math.floor))

// 不小于 min 的对齐 step 与 center 的值
const realMin = computed(() => valueToRounded(min, Math.ceil))

// 最大与最小可取值的差。若没有可取值则输出错误日志并返回 0
const valueLength = computed(() => {
  const len = realMax.value - realMin.value
  if (len < 0) {
    console.error('[VSlider] No desirable value between min and max')
    return 0
  }
  return len
})

// 计算 slider bar 上 value 偏移所对应的 length 像素。（可计算负偏移）
const valueToLength = (value: number): number => {
  const bar = barContainer.value as HTMLElement
  const totalLength = bar.getBoundingClientRect().width
  if (valueLength.value === 0) {
    return 0
  }
  return totalLength * (value / valueLength.value)
}

// 计算 slider bar 上 length 像素所对应的 value 偏移。（可计算负偏移）
const lengthToValue = (length: number): number => {
  const bar = barContainer.value as HTMLElement
  const totalLength = bar.getBoundingClientRect().width
  return valueLength.value * (length / totalLength)
}

// 计算 slider bar 上 length 像素所对应的 step 偏移。（可计算负偏移）
const lengthToStep = (length: number): number => {
  return valueToStep(lengthToValue(length))
}

// 计算 slider bar 上 length 像素所对应的对齐 step 的 value 偏移。（可计算负偏移）
const lengthToStepped = (length: number): number => {
  return lengthToStep(length) * step
}

const thumbLeft = computed(() => {
  if (valueLength.value === 0) {
    return 0
  }
  const percent = 100 * ((realValue.value - realMin.value) / valueLength.value)
  return `${percent}%`
})

// center 处的 coord
const centerCoord = computed(() => {
  return valueToLength(center - realMin.value)
})

// 执行 limit 步骤的函数，不含其他步骤的处理
const limitValue = (value: number): number => {
  if (valueLength.value === 0) {
    return realMin.value
  }
  if (value < realMin.value) {
    value = realMin.value
  } else if (value > realMax.value) {
    value = realMax.value
  }
  return value
}

// 用 limited 设置组件的值，设置前完成剩余步骤
const setByLimited = (limited: number) => {
  if (limited !== realValue.value) {
    realValue.value = limited
    emit('change', limited)
  }
}

// 用 rounded 设置组件的值，设置前完成剩余步骤
const setByRounded = (rounded: number) => {
  setByLimited(limitValue(rounded))
}

// 用任意 value 设置组件的值，设置前完成所有步骤
const setByValue = (value: number) => {
  setByRounded(valueToRounded(value))
}

// 用 coord 设置组件的值，自动完成所有步骤
const setByCoord = (coord: number) => {
  setByRounded(center + lengthToStepped(coord - centerCoord.value))
}

// 改变组件的值，将其偏移 offset 个 step
const offsetByStep = (offset: number) => {
  setByRounded(realValue.value + offset * step)
}

// addEventListener 的简单包装。统一鼠标和触摸事件的注册。
// 已经屏蔽事件默认行为。触摸事件仅在单个触摸点时触发。
// 返回值是一个函数，用于停止被注册的事件
const startListen = (
  target: EventTarget,
  type: string,
  listener: (pageX: number) => void,
  once = false,
): (() => void) => {
  const listener0 = (e: MouseEvent | TouchEvent) => {
    e.preventDefault()
    if (e instanceof MouseEvent || e instanceof unsafeWindow.MouseEvent) {
      listener(e.pageX)
    } else if (e.touches.length === 1) {
      listener(e.touches[0].pageX)
    }
  }
  target.addEventListener(type, listener0, { once, passive: false })
  return () => target.removeEventListener(type, listener0)
}

// 设置拖拽相关的事件
const setupDrag = () => {
  // 注册拖拽相关事件
  const thumb = thumbContainer.value.root
  const types = [
    { start: 'mousedown', move: 'mousemove', end: 'mouseup' },
    { start: 'touchstart', move: 'touchmove', end: 'touchend' },
  ]
  for (const type of types) {
    let startPageX = 0
    let startRealValue = 0
    startListen(thumb, type.start, pageX => {
      emit('start', realValue.value)
      slider.value.focus()
      startPageX = pageX
      startRealValue = realValue.value
      const stopListenMove = startListen(window, type.move, pageX0 => {
        setByValue(startRealValue + lengthToValue(pageX0 - startPageX))
      })
      startListen(
        window,
        type.end,
        () => {
          emit('end', realValue.value)
          stopListenMove()
        },
        true,
      )
    })
  }
}

watch(
  () => _value,
  value => {
    if (value !== realValue.value) {
      setByValue(value)
    }
  },
)

watch(
  () => center,
  () => {
    setByValue(realValue.value)
  },
)

watch(
  () => min,
  () => {
    setByRounded(realValue.value)
  },
)

watch(
  () => max,
  () => {
    setByRounded(realValue.value)
  },
)

setByValue(_value)

onMounted(() => {
  setupDrag()
})
</script>

<style lang="scss" scoped>
@import './common';
.be-slider {
  min-width: 50px;
  position: relative;
  outline: none !important;
  .bar-container {
    padding: 6px 0;
  }
  .default-bar {
    height: 4px;
    cursor: pointer;
    @include round-corner(2px);
    background-color: #8882;
  }
  .thumb-container {
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateX(-50%) translateY(-50%);
    transition: none;
  }
  .default-thumb {
    width: 16px;
    height: 16px;
    @include round-corner(50%);
    background-color: var(--theme-color);
    box-shadow: 0 0 0 2px var(--theme-color-20);
    transition: box-shadow 0.2s ease-out;
  }
}
</style>
