<template>
  <div class="be-loading">
    <slot>
      <template v-if="typeof config.content === 'string' && config.content.length > 0">
        {{ config.content }}
      </template>
      <component :is="config.content" v-if="typeof config.content !== 'string'" />
    </slot>
  </div>
</template>
<script setup lang="ts">
import { loadingContent as config } from './v-loading'
</script>
<style lang="scss">
@import 'common';
.be-loading {
  flex-grow: 1;
  @include h-center();
  justify-content: center;
}
</style>
