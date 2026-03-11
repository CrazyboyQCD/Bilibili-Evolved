import { computed, defineComponent, h, ref, Ref } from 'vue'
import EpisodesPicker from './EpisodesPicker.vue'
import { EpisodeItem } from './episode-item-types'

export const createEpisodesPicker = (
  fetchEpisodeItems: (maxCheckedItems: number) => Promise<EpisodeItem[]>,
) =>
  defineComponent({
    setup: (_, { expose }) => {
      const picker = ref(null) as Ref<InstanceType<typeof EpisodesPicker> | null>
      expose({ checkedInputItems: computed(() => picker.value.checkedInputItems) })
      return () => h(EpisodesPicker, { api: fetchEpisodeItems, ref: picker })
    },
  })
