<template>
  <div class="be-tab-control">
    <div class="default-header">
      <slot name="tabs">
        <div class="default-tabs">
          <div
            v-for="t of tabs"
            :key="t.name"
            class="default-tab"
            :data-count="t.count > 0 ? t.count : null"
            :class="{ selected: t === selectedTab }"
            @click="selectTab(t)"
          >
            <div class="default-tab-name">
              {{ t.displayName }}
            </div>
          </div>
        </div>
      </slot>
      <div class="header-item">
        <slot name="header-item" />
      </div>
      <a
        v-if="moreLink !== null && moreLink !== undefined"
        :href="typeof moreLink === 'function' ? moreLink(selectedTab) : moreLink"
        class="be-more-link"
        target="_blank"
      >
        <VButton :disabled="!moreLink" round>
          <slot name="more-link">
            查看更多
            <VIcon icon="mdi-dots-horizontal" :size="18" />
          </slot>
        </VButton>
      </a>
    </div>
    <slot name="content">
      <div class="default-content">
        <transition name="content-transition">
          <component :is="selectedTab.component" v-bind="selectedTab.propsData" />
        </transition>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent } from 'vue'
import { TabMappings, TabMapping } from './tab-mapping'

const VButton = defineAsyncComponent(() => import('./VButton.vue'))
const VIcon = defineAsyncComponent(() => import('./icon/VIcon.vue'))

const {
  tabs,
  defaultTab = '',
  // link = null,
  moreLink = null,
} = defineProps<{
  tabs: TabMappings
  defaultTab?: string
  link?: string
  moreLink?: string | ((tab: TabMapping) => string)
}>()

const emit = defineEmits<{
  change: [value: string]
}>()

const selectedTabName = ref(
  tabs.find((t: TabMapping) => t.name === defaultTab)?.name ?? tabs[0].name,
)

const selectedTab = computed(() => {
  return tabs.find((t: TabMapping) => t.name === selectedTabName.value)
})

const selectTab = (tab: TabMapping) => {
  if (selectedTabName.value !== tab.name) {
    selectedTabName.value = tab.name
    tab.count = 0
    emit('change', selectedTab.value?.activeLink ?? '')
  } else if (tab.activeLink) {
    window.open(tab.activeLink, '_blank')
  }
}

onMounted(() => {
  emit('change', selectedTab.value?.activeLink ?? '')
})
</script>

<style lang="scss">
@import './common';
@import './tabs';

.be-tab-control {
  display: flex;
  flex-direction: column;
  .default {
    &-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 8px 8px 0;
      @include tabs-style();
      .header-item {
        flex: 1;
        margin: 0 8px;
        &:empty {
          display: none;
        }
      }
      .be-more-link {
        .be-button {
          padding: 4px 6px 4px 10px;
          .be-icon {
            margin-left: 4px;
          }
        }
      }
    }
    &-content {
      display: flex;
      flex: 1;
      justify-content: center;
      padding: 6px 0;
      position: relative;
      max-height: 100%;
      @include no-scrollbar();
      .content-transition {
        &-enter,
        &-leave-to {
          opacity: 0;
          transform: translateY(-12px);
        }
        &-leave-active {
          position: absolute;
        }
        &-enter-active,
        &-leave-active {
          transition: 0.2s ease-out;
        }
      }
    }
  }
}
</style>
