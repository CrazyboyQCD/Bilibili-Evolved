<template>
  <div
    class="video-default-location-extend-box"
    :class="{ 'video-default-location-extend-box-hidden': realHidden }"
  >
    <div class="video-default-location-extend-box-bar" @click="setRealHidden">
      <div class="video-default-location-extend-box-bar-text">位置测试</div>
      <div
        class="video-default-location-extend-box-bar-btn"
        :class="btnClass"
        @animationend="onBarBtnAnimationEnd"
      >
        <VIcon :icon="btnIcon" :size="15" />
      </div>
    </div>

    <div class="video-default-location-extend-box-content-wrap">
      <transition name="video-default-location-extend-box-content-transition">
        <div v-show="!realHidden" class="video-default-location-extend-box-content">
          <slot></slot>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { VIcon } from '@/ui'

const getIconName = (hidden: boolean): string =>
  hidden ? 'mdi-unfold-more-horizontal' : 'mdi-unfold-less-horizontal'

const btnAnimationClass = 'video-default-location-extend-box-bar-btn-animation'
const emit = defineEmits<{
  change: [value: boolean]
}>()

const hidden = defineModel<boolean>({
  default: true,
  set: v => {
    emit('change', v)
    return v
  },
})

const realHidden = ref(hidden.value)
const btnIcon = ref(getIconName(hidden.value))
const btnClass = ref({
  [btnAnimationClass]: false,
})

const setRealHidden = (value: boolean) => {
  if (value !== realHidden.value) {
    realHidden.value = !realHidden.value
    emit('change', realHidden.value)

    btnClass.value[btnAnimationClass] = false
    nextTick(() => {
      btnClass.value[btnAnimationClass] = true
      setTimeout(() => {
        btnIcon.value = getIconName(realHidden.value)
      }, 150)
    })
  }
}

watch(
  () => hidden.value,
  newValue => {
    setRealHidden(newValue)
  },
)

const onBarBtnAnimationEnd = () => {
  btnClass.value[btnAnimationClass] = false
}
</script>

<style lang="scss">
@import 'bar';

$border-color: #8884;
$border-radius: 4px;

.video-default-location-extend-box {
  border-radius: $border-radius;
  box-shadow: 0 0 0 1px $border-color;
}

.video-default-location-extend-box-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: $border-radius;
  box-shadow: 0 1px $border-color;
  cursor: pointer;
}

.video-default-location-extend-box-bar-text {
  @include title-container;
}

.video-default-location-extend-box-bar-btn {
  @include icon-container;
}

.video-default-location-extend-box-bar-btn-animation {
  animation: video-default-location-extend-box-bar-btn-animation-keyframes 0.3s;
}

@keyframes video-default-location-extend-box-bar-btn-animation-keyframes {
  50% {
    transform: rotateX(90deg);
  }
}

.video-default-location-extend-box-bar {
  transition: box-shadow 0.2s ease-out;
}

.video-default-location-extend-box-hidden {
  .video-default-location-extend-box-bar {
    box-shadow: 0 0 $border-color;
  }
}

.video-default-location-extend-box-content-wrap {
  overflow: hidden;
}

.video-default-location-extend-box-content-transition-enter-active,
.video-default-location-extend-box-content-transition-leave-active {
  transition: margin-top 0.2s ease-out;
}

.video-default-location-extend-box-content-transition-enter,
.video-default-location-extend-box-content-transition-leave-to {
  margin-top: -100%;
}

// .video-default-location-extend-box-content-transition-enter-to,
// .video-default-location-extend-box-content-transition-leave {
//   margin-top: 0;
// }
</style>
