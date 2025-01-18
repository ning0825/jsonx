<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-left">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="title-container">
          <div class="title">JsonX</div>
        </div>
      </div>
    </nav>

    <div>
      <div class="toolbar-paste" style="position: absolute">
        <PasteButton @click="$emit('handlePaste')" />
      </div>
      <div class="toolbar-content">
        <ExpandedIcon class="mr-2" :isExpanded="isExpanded" @click="onExpand" />
        <CopyIcon class="mr-2" @click="$emit('copyToClipboard')" />
        <SortAscIcon ref="sortIcon" class="mr-2" @click="$emit('handleSort')" />
        <CompressIcon class="mr-2" @click="onCompress" />
        <ConfigIcon class="mr-2" title="Config" @click="$emit('openConfig')" />
      </div>
    </div>

    <!-- 添加内容区域 -->
    <div class="content">
      <!-- 左侧输入框 -->
      <div class="input-container">
        <Textarea
          class="input-area"
          placeholder="在此输入 JSON"
          v-model="iText"
          @input="onInput"
        />
        <DeleteButton class="delete-button" @click="$emit('clearInput')" />
      </div>

      <div style="width: 20px"></div>

      <slot />
    </div>
  </div>
</template>
<!-- ,isExpanded, 
 copyToClipboard, openConfig, inputText, clearInput,
 isCompressed, content.json, readOnly, baseImageUrl, 
 handleEditorUpdate, handleEditorError, handleExpand, handleResetSort
 compressedContent -->
<script setup>
import PasteButton from "@/components/icons/PasteButton.vue";
import ExpandedIcon from "@/components/icons/ExpandedIcon.vue";
import CopyIcon from "@/components/icons/CopyIcon.vue";
import SortAscIcon from "@/components/icons/SortAscIcon.vue";
import CompressIcon from "@/components/icons/CompressIcon.vue";
import ConfigIcon from "@/components/icons/ConfigIcon.vue";
import { Textarea } from "@/components/ui/textarea";
import DeleteButton from "@/components/icons/DeleteButton.vue";
import { ref, onMounted, nextTick, watch } from "vue";

var isExpanded = ref(false);
var isCompressed = ref(false);
var iText = ref("");

const props = defineProps({
  inputText: {
    type: String,
    default: "",
  },
});
const emit = defineEmits([
  "update:inputText",
  "compressJson",
  "toggleExpand",
  "clearInput",
  "handleSort",
  "openConfig",
]);

watch(
  () => props.inputText,
  (newVal) => {
    iText.value = newVal;
  }
);

onMounted(() => {
  nextTick(() => {
    // 获取 my-editor 的位置
    const editor = document.querySelector(".my-editor");
    const content = document.querySelector(".content");
    if (editor && content) {
      const editorLeft = editor.getBoundingClientRect().left;
      const toolbarContent = document.querySelector(".toolbar-content");
      if (toolbarContent) {
        // 设置 toolbar-content 的左边距
        toolbarContent.style.marginLeft = `${editorLeft}px`;
        toolbarContent.style.marginRight = "0";
      }
    }
    updatePasteButtonPosition();
  });
});

function onInput(event) {
  emit("update:inputText", event.target.value);
}

function onCompress() {
  isCompressed.value = !isCompressed.value;
  emit("compressJson");
}

function updatePasteButtonPosition() {
  const inputArea = document.querySelector(".input-area");
  if (inputArea) {
    const inputRight = inputArea.getBoundingClientRect().right;
    const toolbarPaste = document.querySelector(".toolbar-paste");
    if (toolbarPaste) {
      const pasteWidth = toolbarPaste.offsetWidth;
      toolbarPaste.style.left = `${inputRight - pasteWidth - 20}px`;
    }
  }
}

function onExpand() {
  isExpanded.value = !isExpanded.value;
  emit("toggleExpand");
}

// export default {
//     name: 'GlassTheme',
//     data() {
//         return {
//             // 基础数据
//             inputText: '',
//             isExpanded: false,
//             isCompressed: false,
//             isConfigOpen: false,
//             baseImageUrl: '',
//             fontSize: 14,
//             content: {
//                 json: null
//             },
//             readOnly: false,
//             compressedContent: ''
//         }
//     },
//     props: {
//         inputText: {
//             type: String,
//             default: ''
//         }
//     },
//     emits: ['update:inputText'],
//     methods: {
//         // 处理粘贴事件
//         handlePaste() {
//             // 触发粘贴事件的具体实现
//             this.$emit('paste')
//         },

//         // 展开/折叠切换
//         toggleExpand() {
//             this.isExpanded = !this.isExpanded
//         },

//         // 复制到剪贴板
//         copyToClipboard() {
//             // 复制内容的具体实现
//             this.$emit('copy')
//         },

//         // 处理排序
//         handleSort() {
//             // 排序逻辑实现
//             this.$emit('sort')
//         },

//         // JSON压缩
//         compressJson() {
//             this.isCompressed = !this.isCompressed
//             this.$emit('compress')
//             // 压缩逻辑实现
//         },

//         // 打开配置面板
//         openConfig() {
//             this.isConfigOpen = !this.isConfigOpen
//         },

//         // 清空输入
//         clearInput() {
//             this.inputText = ''
//             this.$emit('clear')
//         },

//         // 编辑器更新处理
//         handleEditorUpdate(newContent) {
//             this.content.json = newContent
//             this.$emit('update:content', newContent)
//         },

//         // 编辑器错误处理
//         handleEditorError(error) {
//             this.$emit('error', error)
//         },

//         // 处理展开事件
//         handleExpand(expanded) {
//             this.isExpanded = expanded
//             this.$emit('expand', expanded)
//         },

//         // 重置排序
//         handleResetSort() {
//             this.$emit('resetSort')
//         },

//         // 保存基础URL
//         saveBaseUrl() {
//             this.$emit('saveBaseUrl')
//         },

//         // 切换主题
//         toggleTheme() {
//             this.$emit('toggleTheme')
//         }
//     }
// }
</script>
<style>
/* 将这些样式放在一个不带 scoped 的 style 标签中 */
.toolbar-content svg,
.toolbar-paste svg,
.input-container svg {
  color: #303030;
  transition: color 0.2s ease;
  padding: 10px;
}
</style>

<style scoped>
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  font-family: sans-serif;
  overflow: hidden;
  background-image: url("@/assets/bg.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

>>> textarea:focus {
  /* --tw-ring-color: #00000000; */
  /* outline: none; */
  /* box-shadow: 0 0 0 2px var(--tw-ring-color); */
  border: 1px solid rgba(0, 0, 0, 0.418);
}

/* 导航栏样式 */
.navbar {
  display: flex;
  align-items: center;
  padding: 20px 40px 0px 40px;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
  z-index: 1;
}

.logo {
  height: 30px;
  margin-right: 10px;
}

.title-container {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 1.2em;
  font-weight: bold;
  margin: 0;
}

.subtitle {
  font-size: 0.9em;
  margin: 0;
  color: #666;
}

.toolbar-content {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px 8px 12px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 100px;
  white-space: nowrap;
  width: fit-content;
  margin: 10px 20px;
}

.toolbar-paste {
  padding: 8px;
  background-color: rgba(230, 250, 46, 0.8);
  border-radius: 100px;
  margin: 10px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-paste:hover {
  background-color: #000000a4;
}

.toolbar-paste:active {
  background-color: #000;
}

.toolbar-paste:hover svg {
  fill: rgb(255, 255, 255);
}

/* 搜索框样式 */
.search-wrapper {
  position: relative;
}

.search-container {
  display: flex;
  align-items: center;
}

.search-input {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  font-size: 14px;
  width: 200px;
}

.search-input:focus {
  outline: none;
  border-color: #666;
}

/* 按钮样式 */
.mr-2 {
  margin-right: 8px;
}

.mr-2-end {
  margin-right: 0px;
}

/* 修改 toolbar-content 中的图标样式 */
.mr-2 {
  cursor: pointer;
  border-radius: 100px;
  transition: all 0.2s ease;
}

.mr-2:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.mr-2:active {
  background-color: rgba(0, 0, 0, 0.1);
  transform: translateY(0px);
}

.mr-2:hover svg {
  color: #0a0a0a;
}

.content {
  display: flex;
  flex: 1;
  padding: 0px 40px 40px 40px;
  /* gap: 20px; */
  height: calc(100vh - 60px);
  overflow: hidden;
}

.input-container {
  position: relative;
  width: 400px;
  flex-shrink: 0;
}

.delete-button {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  color: #666;
  fill: #666666bd;
}

.delete-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #333;
}

.delete-button:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.input-area {
  width: 400px;
  resize: none;
  height: 100%;
  padding: 20px;
  font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: rgba(250, 250, 250, 0.8);
}

/* input-area 的滚动条样式可以保留在这里 */
.input-area::-webkit-scrollbar {
  width: 6px;
}

.input-area::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.input-area::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.input-area::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}

.input-area::-webkit-scrollbar-corner {
  background: #f5f5f5;
}

.copy-tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  transform: translateX(-50%);
  /* 水平居中 */
}
</style>
