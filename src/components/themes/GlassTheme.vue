<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-left">
        <img src="@/assets/logo.png" alt="Logo" class="logo" />
        <div class="title-container">
          <!-- <div class="title">JsonX</div> -->
          <svg
            width="128"
            height="24"
            viewBox="0 0 200 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.8881 23.1601C6.73077 23.1601 4.40544 22.6055 2.9121 21.4961C1.4401 20.3655 0.704102 18.6375 0.704102 16.3121C0.704102 15.7575 0.768102 15.1921 0.896102 14.6161H6.0161C5.97344 14.8935 5.94144 15.1601 5.9201 15.4161C5.89877 15.6721 5.8881 15.8855 5.8881 16.0561C5.8881 17.2295 6.32544 18.0188 7.2001 18.4241C8.07477 18.8081 9.25877 19.0001 10.7521 19.0001H12.7681C14.5814 19.0001 15.8614 18.7121 16.6081 18.1361C17.3761 17.5388 17.7601 16.4295 17.7601 14.8081V0.120117H22.8801V14.8081C22.8801 16.6855 22.5921 18.2428 22.0161 19.4801C21.4401 20.7175 20.4801 21.6455 19.1361 22.2641C17.7921 22.8615 15.9574 23.1601 13.6321 23.1601H9.8881Z"
              fill="black"
            />
            <path
              d="M26.3411 23.1601V19.4801H42.0211C42.9171 19.4801 43.3651 18.9788 43.3651 17.9761C43.3651 16.9948 42.9171 16.5041 42.0211 16.5041H31.8771C29.9784 16.5041 28.5384 16.0775 27.5571 15.2241C26.5758 14.3495 26.0851 13.1015 26.0851 11.4801C26.0851 9.83745 26.5758 8.57878 27.5571 7.70412C28.5598 6.80812 29.9998 6.36012 31.8771 6.36012H46.4691V10.0401H32.1011C31.1838 10.0401 30.7251 10.4881 30.7251 11.3841C30.7251 11.8321 30.8531 12.1841 31.1091 12.4401C31.3651 12.6961 31.6958 12.8241 32.1011 12.8241H42.8531C44.5171 12.8241 45.7864 13.2615 46.6611 14.1361C47.5571 14.9895 48.0051 16.2375 48.0051 17.8801C48.0051 19.5441 47.5571 20.8455 46.6611 21.7841C45.7651 22.7015 44.4958 23.1601 42.8531 23.1601H26.3411Z"
              fill="black"
            />
            <path
              d="M59.1769 23.1601C56.3182 23.1601 54.0889 22.4561 52.4889 21.0481C50.8889 19.6188 50.0889 17.5281 50.0889 14.7761C50.0889 12.0028 50.8889 9.91212 52.4889 8.50412C54.0889 7.07478 56.3182 6.36012 59.1769 6.36012H65.0969C67.9555 6.36012 70.1849 7.07478 71.7849 8.50412C73.3849 9.91212 74.1849 12.0028 74.1849 14.7761C74.1849 17.5281 73.3849 19.6188 71.7849 21.0481C70.1849 22.4561 67.9555 23.1601 65.0969 23.1601H59.1769ZM59.1769 19.4801H65.0969C66.4835 19.4801 67.5395 19.0961 68.2649 18.3281C69.0115 17.5601 69.3848 16.3761 69.3848 14.7761C69.3848 13.1548 69.0115 11.9601 68.2649 11.1921C67.5395 10.4241 66.4835 10.0401 65.0969 10.0401H59.1769C57.7902 10.0401 56.7235 10.4241 55.9769 11.1921C55.2515 11.9601 54.8889 13.1548 54.8889 14.7761C54.8889 16.3761 55.2515 17.5601 55.9769 18.3281C56.7235 19.0961 57.7902 19.4801 59.1769 19.4801Z"
              fill="black"
            />
            <path
              d="M77.0726 23.0001V6.52012H91.4406C93.3179 6.52012 94.6833 6.98945 95.5366 7.92812C96.4113 8.84545 96.8486 10.0615 96.8486 11.5761V23.0001H92.2086V12.1201C92.2086 10.8401 91.5686 10.2001 90.2886 10.2001H81.7126V23.0001H77.0726Z"
              fill="black"
            />
            <path
              d="M98.7576 23.0001L107.334 11.5761L98.7576 0.120117H104.998L111.878 9.49612H114.822L121.702 0.120117H127.942L119.366 11.5761L127.942 23.0001H121.67L114.822 13.6561H111.878L105.03 23.0001H98.7576Z"
              fill="black"
            />
          </svg>
        </div>
      </div>
    </nav>

    <div>
      <div class="toolbar-paste" style="position: absolute">
        <SimpleTooltip content="Replace current content with clipboard content">
          <PasteButton @click="$emit('handlePaste')" />
        </SimpleTooltip>
      </div>
      <div class="toolbar-content">
        <SimpleTooltip content="expand/collapse">
          <ExpandedIcon
            class="mr-2"
            :isExpanded="isExpanded"
            @click="onExpand"
          />
        </SimpleTooltip>
        <SimpleTooltip content="copy to clipboard">
          <CopyIcon class="mr-2" @click="$emit('copyToClipboard')" />
        </SimpleTooltip>
        <SimpleTooltip content="sort by first letter">
          <SortAscIcon
            ref="sortIcon"
            class="mr-2"
            @click="$emit('handleSort')"
          />
        </SimpleTooltip>
        <SimpleTooltip content="compress">
          <CompressIcon class="mr-2" @click="onCompress" />
        </SimpleTooltip>
        <SimpleTooltip content="open configration">
          <ConfigIcon
            class="mr-2"
            title="Config"
            @click="$emit('openConfig')"
          />
        </SimpleTooltip>
      </div>
    </div>

    <!-- 添加内容区域 -->
    <div class="content">
      <!-- 左侧输入框 -->
      <div class="input-container">
        <textarea
          class="input-area"
          placeholder="Click the button above ↗️ to paste content"
          v-model="iText"
          @input="onInput"
          @dblclick.prevent
          :style="{ color: errorMsg ? 'black' : '#999' }"
          aria-hidden="true"
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
import DeleteButton from "@/components/icons/DeleteButton.vue";
import { ref, onMounted, nextTick, watch, onUnmounted } from "vue";
import SimpleTooltip from "../SimpleTooltip.vue";

var isExpanded = ref(false);
var isCompressed = ref(false);
var iText = ref("");

const props = defineProps({
  inputText: {
    type: String,
    default: "",
  },
  errorMsg: {
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

    // 添加全局双击事件监听，防止双击选中输入框文本
    document.addEventListener("dblclick", handleGlobalDblClick);
  });
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  document.removeEventListener("dblclick", handleGlobalDblClick);
});

// 处理全局双击事件
function handleGlobalDblClick(event) {
  // 如果双击发生在输入框外部
  if (!event.target.closest(".input-area")) {
    // 阻止默认选中行为
    event.preventDefault();

    // 清除任何可能的选中
    // window.getSelection().removeAllRanges();
  }
}

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

:deep(textarea:focus) {
  /* --tw-ring-color: #00000000; */
  /* outline: none; */
  /* box-shadow: 0 0 0 2px var(--tw-ring-color); */
  /* border: 1px solid rgba(0, 0, 0, 0.418); */
  color: black !important;
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
  width: 52px;
  height: 52px;
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
  /* transform: translateY(-1px); */
}

.mr-2:active {
  background-color: rgba(0, 0, 0, 0.1);
  /* transform: translateY(0px); */
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
  /* 防止双击选中文本 */
  user-select: none;
}

/* 在输入状态下恢复文本选择功能 */
.input-area:focus {
  user-select: text;
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

textarea:focus-visible {
  outline: none;
}
</style>
