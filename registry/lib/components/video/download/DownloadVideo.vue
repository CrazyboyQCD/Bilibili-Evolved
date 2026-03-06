<template>
  <VPopup v-model="open" fixed class="download-video-panel" :trigger-element="triggerElement">
    <div class="download-video-panel-header">
      <VIcon icon="mdi-download" />
      <div class="title">下载视频</div>
      <VButton type="transparent" title="关闭" @click="open = false">
        <VIcon icon="mdi-close" :size="20" />
      </VButton>
    </div>
    <div class="download-video-panel-content">
      <div v-if="selectedInput" class="download-video-config-item">
        <div class="download-video-config-title">输入源:</div>
        <VDropdown :value="selectedInput" :items="inputs" />
      </div>
      <div v-if="inputs.length === 0" class="download-video-config-item error">
        没有匹配的输入源, 请确保安装了适合此页面的插件.
      </div>
      <component
        :is="selectedInput.component"
        v-if="selectedInput && selectedInput.component"
        ref="inputOptions"
      />
      <div v-if="selectedApi" class="download-video-config-item">
        <div class="download-video-config-title">格式:</div>
        <VDropdown :value="selectedApi" :items="apis" />
      </div>
      <div
        v-if="selectedApi && selectedApi.description"
        class="download-video-config-description"
        v-html="selectedApi.description"
      ></div>
      <div v-if="selectedQuality" class="download-video-config-item">
        <div class="download-video-config-title">清晰度:</div>
        <VDropdown
          :value="selectedQuality"
          :items="filteredQualities"
          @change="saveSelectedQuality()"
        />
      </div>
      <template v-if="!testData.multiple && selectedQuality">
        <div v-if="testData.videoInfo" class="download-video-config-description">
          预计大小: {{ formatFileSize(testData.videoInfo.totalSize) }}
        </div>
        <div v-if="testData.videoInfo === null" class="download-video-config-description">
          正在计算大小
        </div>
      </template>
      <div class="download-video-config-item">
        <div class="download-video-config-title">下载地址偏好:</div>
        <VDropdown :value="preferredUrlType" :items="urlTypeOptions" />
      </div>
      <div class="download-video-config-description">
        当视频有多个源时, 配置优先使用的源, 各类视频源区别请参考
        <a
          href="https://github.com/the1812/Bilibili-Evolved/issues/3234#issuecomment-1504764774"
          target="_blank"
          >此处</a
        >
      </div>
      <component
        :is="a.component"
        v-for="a of assetsWithOptions"
        :key="a.name"
        ref="assetsOptions"
        :name="a.name"
      />
      <div v-if="selectedOutput" class="download-video-config-item">
        <div class="download-video-config-title">输出方式:</div>
        <VDropdown :value="selectedOutput" :items="outputs" />
      </div>
      <div
        v-if="selectedOutput && selectedOutput.description"
        class="download-video-config-description"
        v-html="selectedOutput.description"
      ></div>
      <component
        :is="selectedOutput.component"
        v-if="selectedOutput && selectedOutput.component"
        ref="outputOptions"
      />
    </div>
    <div class="download-video-panel-footer">
      <VButton
        class="run-download"
        type="primary"
        :disabled="!canStartDownload"
        @click="startDownload($refs.outputOptions, selectedOutput)"
      >
        开始
      </VButton>
    </div>
  </VPopup>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, useTemplateRef, reactive } from 'vue'
import { TestPattern, WithAttrs } from '@/core/common-types'
import { getComponentSettings } from '@/core/settings'
import { matchUrlPattern } from '@/core/utils'
import { logError } from '@/core/utils/log'
import { formatFileSize } from '@/core/utils/formatters'
import { VPopup, VButton, VDropdown, VIcon } from '@/ui'
import { registerAndGetData } from '@/plugins/data'
import { allQualities, VideoQuality } from '@/components/video/video-quality'
import { Toast } from '@/core/toast'
import { getFriendlyTitle } from '@/core/utils/title'
import { bangumiBatchInput } from './inputs/bangumi/batch'
import { videoBatchInput, videoSeasonBatchInput } from './inputs/video/batch'
import { videoSingleInput } from './inputs/video/input'
import { videoDashAvc, videoDashHevc, videoDashAv1, videoAudioDash } from './apis/dash'
import { videoFlv } from './apis/flv'
import { streamSaverOutput } from './outputs/stream-saver'
import {
  DownloadVideoAction,
  DownloadVideoApi,
  DownloadVideoAssets,
  DownloadVideoInput,
  DownloadVideoInputItem,
  DownloadVideoOutput,
} from './types'
import { DownloadVideoUrlType, parseVideoUrlType, sortVideoUrlByType } from './url-type'

const [inputs] = registerAndGetData(
  'downloadVideo.inputs',
  reactive([
    videoSingleInput,
    videoBatchInput,
    videoSeasonBatchInput,
    bangumiBatchInput,
  ] as DownloadVideoInput[]),
)
const [apis] = registerAndGetData(
  'downloadVideo.apis',
  reactive([
    videoFlv,
    videoDashAvc,
    videoDashHevc,
    videoDashAv1,
    videoAudioDash,
  ] as DownloadVideoApi[]),
)
const [assets] = registerAndGetData('downloadVideo.assets', reactive([] as DownloadVideoAssets[]))
const [outputs] = registerAndGetData(
  'downloadVideo.outputs',
  reactive([streamSaverOutput] as DownloadVideoOutput[]),
)
const { basicConfig } = getComponentSettings('downloadVideo').options as {
  basicConfig: {
    api: string
    quality: number
    output: string
    preferredUrlType: DownloadVideoUrlType
  }
}

const { triggerElement } = defineProps<{
  triggerElement: HTMLElement
}>()
const filterData = <T extends { match?: TestPattern }>(items: T[]) => {
  const matchedItems = items.filter(it => it.match?.some(p => matchUrlPattern(p)) ?? true)
  return matchedItems
}
const urlTypeOptions: { displayName: string; name: DownloadVideoUrlType }[] = [
  { displayName: 'Mirror', name: DownloadVideoUrlType.Mirror },
  { displayName: 'UPOS', name: DownloadVideoUrlType.UPOS },
  { displayName: 'BCache', name: DownloadVideoUrlType.BCache },
  { displayName: 'MCDN / PCDN', name: DownloadVideoUrlType.MCDN },
]

const getFallbackTestVideoInfo = () =>
  ({
    aid: unsafeWindow.aid,
    cid: unsafeWindow.cid,
    title: getFriendlyTitle(true),
  } as DownloadVideoInputItem)

const inputOptions = useTemplateRef('inputOptions')
const assetsOptions = useTemplateRef('assetsOptions')

const open = ref(false)
const busy = ref(false)
const testData = ref({
  videoInfo: null,
  multiple: false,
})
const qualities = ref<VideoQuality[]>([])
const selectedQuality = ref<VideoQuality | undefined>(undefined)
const inputsRef = ref<DownloadVideoInput[]>([])
const selectedInput = ref<DownloadVideoInput | undefined>(undefined)
const apisRef = ref<DownloadVideoApi[]>([])
const selectedApi = ref<DownloadVideoApi | undefined>(undefined)
const selectedOutput = ref<DownloadVideoOutput>(
  outputs.find(it => it.name === basicConfig.output) || outputs[0],
)
const preferredUrlType = ref(
  basicConfig.preferredUrlType ??
    urlTypeOptions.find(it => it.name === DownloadVideoUrlType.Mirror),
)

const assetsWithOptions = computed(() => assets.filter(a => a.component))

const filteredQualities = computed(() => {
  if (qualities.value.length === 0) {
    return allQualities
  }
  return qualities.value
})

const canStartDownload = computed(() => {
  if (busy.value || !open.value) {
    return false
  }
  const selections = [selectedInput.value, selectedApi.value, selectedOutput.value]
  const isAnySelectionEmpty = selections.some(value => !value)
  if (isAnySelectionEmpty) {
    return false
  }
  return true
})

const updateTestVideoInfo = async () => {
  if (!selectedInput.value || !selectedApi.value) {
    return
  }
  testData.value.videoInfo = null
  const input = selectedInput.value as DownloadVideoInput
  const testItem = input.getTestInput?.() ?? getFallbackTestVideoInfo()
  console.log('[updateTestVideoInfo]', testItem)
  testData.value.multiple = input.batch
  const api = selectedApi.value as DownloadVideoApi
  try {
    const videoInfo = await api.downloadVideoInfo(testItem)
    qualities.value = videoInfo.qualities
    const isSelectedQualityOutdated =
      !selectedQuality.value ||
      !videoInfo.qualities.some(q => q.value === selectedQuality.value?.value)
    if (isSelectedQualityOutdated) {
      selectedQuality.value = videoInfo.qualities[0]
      if (basicConfig.quality) {
        const [matchedQuality] = videoInfo.qualities.filter(q => q.value <= basicConfig.quality)
        if (matchedQuality) {
          selectedQuality.value = matchedQuality
        }
      }
    }
    // 填充 quality 后要再请求一次得到对应 quality 的统计数据
    testItem.quality = selectedQuality.value
    const qualityVideoInfo = await api.downloadVideoInfo(testItem)
    testData.value.videoInfo = qualityVideoInfo
    console.log('[qualityVideoInfo]', qualityVideoInfo)
  } catch (error) {
    console.error('[updateTestVideoInfo] failed', error)
    testData.value.videoInfo = undefined
  }
}

const saveSelectedQuality = () => {
  const quality: VideoQuality = selectedQuality.value
  if (quality === undefined) {
    return
  }
  basicConfig.quality = quality.value
  updateTestVideoInfo()
}

const startDownload = async (instance: any, output: DownloadVideoOutput) => {
  try {
    busy.value = true
    const input = selectedInput.value as DownloadVideoInput
    const api = selectedApi.value as DownloadVideoApi
    const videoInputs = await input.getInputs(inputOptions.value)
    if (videoInputs.length === 0) {
      Toast.info('未接收到视频, 如果输入源支持批量, 请至少选择一个视频.', '下载视频', 3000)
      return
    }
    videoInputs.forEach(item => {
      item.quality = selectedQuality.value
    })
    const videoInfos = await Promise.all(videoInputs.map(i => api.downloadVideoInfo(i)))
    if (videoInfos.length === 0 || lodash.sumBy(videoInfos, it => it.fragments.length) === 0) {
      Toast.info('未接收到可下载数据, 请检查输入源和格式是否适用于当前视频.', '下载视频', 3000)
      return
    }
    videoInfos.forEach(videoInfo => {
      videoInfo.fragments.forEach(fragment => {
        if (preferredUrlType.value !== undefined) {
          const preferredUrl = fragment.allUrls.find(
            url => parseVideoUrlType(url) === preferredUrlType.value,
          )
          if (preferredUrl !== undefined) {
            fragment.url = preferredUrl
          } else {
            fragment.url = sortVideoUrlByType(fragment.allUrls)[0]
          }
        }
      })
    })
    const action = new DownloadVideoAction(videoInfos)
    assets.forEach(a => {
      const assetsType = a?.getUrls ? action.extraOnlineAssets : action.extraAssets
      assetsType.push({
        asset: a,
        instance: assetsOptions.value?.find(
          (c: InstanceType<WithAttrs<{ name: string }>>) => c.attrs.name === a.name,
        ),
      })
    })
    await output.runAction(action, instance)
    await action.downloadExtraAssets()
  } catch (error) {
    logError(error)
  } finally {
    busy.value = false
  }
}

watch(selectedInput, (input: DownloadVideoInput) => {
  if (input === undefined) {
    return
  }
  updateTestVideoInfo()
})

watch(selectedApi, (api: DownloadVideoApi) => {
  if (api === undefined) {
    return
  }
  updateTestVideoInfo()
  basicConfig.api = api.name
})

watch(selectedOutput, (output: DownloadVideoOutput) => {
  if (output === undefined) {
    return
  }
  basicConfig.output = output.name
})

watch(preferredUrlType, (urlType: DownloadVideoUrlType) => {
  if (urlType === undefined) {
    return
  }
  basicConfig.preferredUrlType = urlType
})

onMounted(() => {
  coreApis.observer.videoChange(() => {
    selectedInput.value = undefined
    selectedApi.value = undefined

    const matchedInputs = filterData(inputs)
    inputsRef.value = matchedInputs
    selectedInput.value = matchedInputs[0]
    const matchedApis = filterData(apis)
    apisRef.value = matchedApis
    const lastApi = matchedApis.find(api => api.name === basicConfig.api)
    if (lastApi) {
      selectedApi.value = lastApi
    } else {
      selectedApi.value = matchedApis[0]
    }
  })
})

defineExpose({
  open,
})
</script>
<style lang="scss">
@import 'common';

.download-video-panel {
  @include popup();
  font-size: 12px;
  padding: 6px;
  top: 100px;
  left: 50%;
  transform: translateX(-50%) scale(0.95);
  transition: 0.2s ease-out;
  z-index: 1000;
  width: 320px;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;

  &.open {
    transform: translateX(-50%);
  }
  .be-textbox,
  .be-textarea {
    flex-grow: 1;
  }
  &-header {
    @include h-center();
    border-bottom: 1px solid #8882;
    padding: 6px 0;
    margin: 0 6px;

    .title {
      font-size: 16px;
      @include semi-bold();
      flex-grow: 1;
      margin: 0 8px;
    }
    .be-button {
      padding: 4px;
    }
  }
  &-content {
    @include no-scrollbar();
    @include v-stretch();
    flex: 1 0 0;
    padding: 12px 6px;
    align-items: flex-start;
    > :not(:first-child) {
      margin-top: 12px;
    }
  }
  .download-video-config-item {
    @include h-center();
    .download-video-config-title {
      margin-right: 8px;
    }
    &.error {
      color: #e57373;
    }
  }
  .download-video-config-section {
    align-self: stretch;
  }
  .download-video-config-description {
    color: #888d;
    margin-top: 4px;
    a {
      color: var(--theme-color-70);
    }
  }
  &-footer {
    @include h-center();
    border-top: 1px solid #8882;
    padding: 6px 0;
    margin: 0 6px;
    justify-content: center;
  }
  .run-download {
    font-size: 13px;
    padding: 6px 12px;
  }
}
</style>
