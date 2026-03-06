<template>
  <div class="rpc-config download-video-config-section">
    <div class="online-assets-download">
      <div class="download-video-config-item">
        <div class="download-video-config-title">使用 aria2 下载附属资源:</div>
        <SwitchBox v-model="isPluginDownloadAssets" @change="saveAssetsSettings" />
      </div>
      <div class="download-video-config-description">
        存在于服务器的附属资源 (例如封面) 可以一并发送到 aria2 下载.
      </div>
    </div>
    <div v-if="isRenaming" class="profile-select">
      <div class="profile-item-name">重命名 RPC 预设:</div>
      <TextBox ref="renameInput" v-model="profileRename" />
      <VButton key="check" type="transparent" title="完成" @click="endRename()">
        <VIcon icon="mdi-check" :size="16" />
      </VButton>
    </div>
    <div v-else class="profile-select">
      <div class="profile-item-name">RPC 预设:</div>
      <VDropdown
        v-model="selectedRpcProfile"
        :items="rpcProfiles"
        :key-mapper="(item: Aria2RpcProfile) => item.name"
      >
        <template #item="{ item }">
          {{ item.name }}
        </template>
      </VDropdown>
      <VButton key="edit" type="transparent" title="重命名" @click="startRename()">
        <VIcon icon="mdi-pencil-outline" :size="16" />
      </VButton>
      <VButton key="new" type="transparent" title="新建预设" @click="newProfile()">
        <VIcon icon="mdi-plus" :size="16" />
      </VButton>
      <VButton
        key="delete"
        :disabled="rpcProfiles.length < 2"
        type="transparent"
        title="删除当前预设"
        @click="deleteProfile()"
      >
        <VIcon icon="mdi-trash-can-outline" :size="16" />
      </VButton>
    </div>
    <template v-if="selectedRpcProfile">
      <div class="profile-secret-key">
        <div class="profile-item-name">密钥:</div>
        <TextBox v-model="selectedRpcProfile.secretKey" change-on-blur />
      </div>
      <div class="profile-dir">
        <div class="profile-item-name">路径:</div>
        <TextBox v-model="selectedRpcProfile.dir" change-on-blur />
      </div>
      <div class="profile-host">
        <div class="profile-item-name">主机:</div>
        <TextBox v-model="selectedRpcProfile.host" change-on-blur />
      </div>
      <div class="profile-port">
        <div class="profile-item-name">端口:</div>
        <TextBox v-model="selectedRpcProfile.port" change-on-blur />
      </div>
      <div class="profile-method">
        <div class="profile-item-name">方法:</div>
        <VDropdown
          v-model="selectedRpcProfile.method"
          :items="['get', 'post']"
          :key-mapper="item => item"
        >
          <template #item="{ item }">
            {{ item }}
          </template>
        </VDropdown>
      </div>
      <div class="profile-other">
        <div class="profile-item-name">其他配置:</div>
        <TextArea v-model="selectedRpcProfile.other" placeholder="some-key=value" change-on-blur />
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, useTemplateRef } from 'vue'
import { getComponentSettings } from '@/core/settings'
import { Toast } from '@/core/toast'
import { TextBox, VButton, VIcon, VDropdown, TextArea, SwitchBox } from '@/ui'
import { Aria2RpcProfile, defaultProfile } from './rpc-profiles'
import { DownloadVideoOptions } from '../../../../components/video/download'

interface Options {
  rpcProfiles: Aria2RpcProfile[]
  selectedRpcProfileName: string
  isPluginDownloadAssets: boolean
}

const { options: storedOptions } = getComponentSettings<DownloadVideoOptions>('downloadVideo')
const defaultOptions: Options = {
  rpcProfiles: [defaultProfile],
  selectedRpcProfileName: defaultProfile.name,
  isPluginDownloadAssets: false,
}
const options = { ...defaultOptions, ...storedOptions }

const handleMissingProfile = () => {
  if (options.rpcProfiles.length < 1) {
    options.rpcProfiles.push(defaultProfile)
    return defaultProfile
  }
  return options.rpcProfiles[0]
}

const lastSelectedProfile =
  options.rpcProfiles.find(p => p.name === options.selectedRpcProfileName) ?? handleMissingProfile()

console.log(options, lastSelectedProfile)

const renameInput = useTemplateRef('renameInput')

const isRenaming = ref(false)
const profileRename = ref('')
const rpcProfiles = ref(options.rpcProfiles)
const selectedRpcProfile = ref(lastSelectedProfile)
const isPluginDownloadAssets = ref(options.isPluginDownloadAssets)

const saveProfileSettings = () => {
  options.selectedRpcProfileName = selectedRpcProfile.value.name
  options.rpcProfiles = rpcProfiles.value
  storedOptions.selectedRpcProfileName = options.selectedRpcProfileName
  storedOptions.rpcProfiles = options.rpcProfiles
}

const saveAssetsSettings = () => {
  options.isPluginDownloadAssets = isPluginDownloadAssets.value
  storedOptions.isPluginDownloadAssets = options.isPluginDownloadAssets
}

const startRename = async () => {
  profileRename.value = selectedRpcProfile.value.name
  isRenaming.value = true
  await nextTick()
  renameInput.value.focus()
}

const endRename = () => {
  const newName: string = profileRename.value
  if (!newName) {
    Toast.error('名称不得为空', '重命名 RPC 预设', 2000)
    return
  }
  if (
    options.rpcProfiles.some(p => p.name !== selectedRpcProfile.value.name && p.name === newName)
  ) {
    Toast.error('名称不得与其他预设重复', '重命名 RPC 预设', 2000)
    return
  }
  selectedRpcProfile.value.name = profileRename.value
  isRenaming.value = false
  saveProfileSettings()
}

const newProfile = () => {
  const newProfileObj: Aria2RpcProfile = { ...selectedRpcProfile.value }
  const newName = {
    num: 1,
    toString() {
      return `未命名${this.num}`
    },
  }
  while (options.rpcProfiles.some(p => p.name === newName.toString())) {
    newName.num++
  }
  newProfileObj.name = newName.toString()
  options.rpcProfiles.push(newProfileObj)
  selectedRpcProfile.value = newProfileObj
}

const deleteProfile = () => {
  if (options.rpcProfiles.length < 2) {
    return
  }
  const index = options.rpcProfiles.findIndex(p => p.name === selectedRpcProfile.value.name)
  if (index === -1) {
    return
  }
  if (!confirm(`确认删除 RPC 预设 "${selectedRpcProfile.value.name}" 吗?`)) {
    return
  }
  options.rpcProfiles.splice(index, 1)
  selectedRpcProfile.value = options.rpcProfiles[0]
}
</script>
<style lang="scss">
@import 'common';

.rpc-config.download-video-config-section {
  @include v-center();
  align-items: stretch;

  > * {
    @include h-center();

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  .profile-item-name {
    margin-right: 8px;
  }

  .profile-other .profile-item-name {
    align-self: flex-start;
  }

  .profile-select {
    .be-textbox,
    .be-dropdown {
      margin-right: 8px;
    }

    .be-button {
      padding: 4px;
    }
  }

  .profile-method {
    align-self: flex-start;
  }

  .online-assets-download {
    flex-direction: column;
    align-items: start;
  }
}
</style>
