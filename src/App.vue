<template>
  <GlassTheme
    :inputText="inputText"
    @handlePaste="handlePaste"
    @openConfig="openConfig"
    @toggleExpand="toggleExpand"
    @clearInput="clearInput"
    @update:inputText="updateInputText"
    @compressJson="compressJson"
    @copyToClipboard="copyJson"
    @handleSort="handleSort"
    :errorMsg="errorMsg"
  >
    <div class="my-editor" :style="{
      'font-size': fontSize + 'px',
    }">
      <div v-show="errorMsg" class="error-msg">
        {{ errorMsg }}
        <div>
          <Button
            style="display: block; margin-top: 12px; color: black"
            variant="outline"
            @click="fixIt"
          >
            Fix it
          </Button>
        </div>
      </div>
      <div v-show="isCompressed" class="compressed-json">
        {{ compressedContent }}
      </div>
      <JSONEditor
        v-show="!errorMsg"
        ref="jsonEditor"
        :content="content"
        :mode="'tree'"
        :readOnly="true"
        :expanded="isExpanded"
        @resetSort="resetSort"
      />
    </div>
  </GlassTheme>
  
  <!-- 配置面板 -->
  <ConfigPanel/>

  <!-- 侧边栏图片预览 -->
  <sidebar-image-preview></sidebar-image-preview>

  <div class="copy-success-tip">
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8 0C6.41775 0 4.87103 0.469192 3.55544 1.34824C2.23985 2.22729 1.21447 3.47672 0.608967 4.93853C0.00346625 6.40034 -0.15496 8.00887 0.153721 9.56072C0.462403 11.1126 1.22433 12.538 2.34315 13.6569C3.46197 14.7757 4.88743 15.5376 6.43928 15.8463C7.99113 16.155 9.59966 15.9965 11.0615 15.391C12.5233 14.7855 13.7727 13.7602 14.6518 12.4446C15.5308 11.129 16 9.58225 16 8C16 5.87827 15.1571 3.84344 13.6569 2.34315C12.1566 0.842855 10.1217 0 8 0ZM13.225 5.315L6.655 11.88L2.775 8C2.6424 7.86739 2.5679 7.68754 2.5679 7.5C2.5679 7.31246 2.6424 7.13261 2.775 7C2.90761 6.86739 3.08747 6.79289 3.275 6.79289C3.46254 6.79289 3.6424 6.86739 3.775 7L6.665 9.89L12.235 4.325C12.3007 4.25934 12.3786 4.20725 12.4644 4.17172C12.5502 4.13618 12.6421 4.11789 12.735 4.11789C12.8279 4.11789 12.9198 4.13618 13.0056 4.17172C13.0914 4.20725 13.1693 4.25934 13.235 4.325C13.3007 4.39066 13.3528 4.46861 13.3883 4.5544C13.4238 4.64019 13.4421 4.73214 13.4421 4.825C13.4421 4.91786 13.4238 5.00981 13.3883 5.0956C13.3528 5.18139 13.3007 5.25934 13.235 5.325L13.225 5.315Z"
        fill="#7FE1BA"
      />
    </svg>
    <div style="width: 8px"></div>
    <div>{{ toastMsg }}</div>
  </div>
</template>

<script setup>
import {
  ref,
  watch,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  computed
} from "vue";
import { useStore } from 'vuex';
import GlassTheme from "@/components/themes/GlassTheme.vue";
import JSONEditor from "@/components/JSONEditor.vue";
import ConfigPanel from "@/components/config/ConfigPanel.vue";
import jsonFormat from "@/util/format";
import { Button } from "@/components/ui/button";
import SidebarImagePreview from "@/components/ui/SidebarImagePreview.vue";

const store = useStore();
const { proxy } = getCurrentInstance();

var inputText = ref("");
var content = ref({});
var isExpanded = ref(true);
var isCompressed = ref(false);
var compressedContent = ref("");
var jsonEditor = ref(null);
var originalJson = ref(null);
var errorMsg = ref("");
var toastMsg = ref("");

// 使用 Vuex 状态
const isConfigOpen = computed(() => store.state.isConfigOpen);
const fontSize = computed(() => store.state.fontSize);
const previewMode = computed(() => store.state.previewMode);

onMounted(() => {
  // 初始化配置
  store.dispatch('initConfig');
  
  // 添加点击事件监听
  document.addEventListener('click', handleOutsideClick);

  proxy.emitter.on("copy", (text) => {
    copyToClipboard(text);
  });

  proxy.emitter.on("showToast", (text) => {
    showToast(text);
  });
});

onBeforeUnmount(() => {
  // 移除事件监听
  document.removeEventListener('click', handleOutsideClick);
});

function handleOutsideClick(event) {
  // 如果配置面板已打开，且点击的不是配置面板内部和配置按钮
  if (
    isConfigOpen.value &&
    !event.target.closest(".config-panel") &&
    !event.target.closest('.mr-2[title="Config"]')
  ) {
    store.commit('setConfigOpen', false);
  }

  // 如果侧边预览已打开，且点击的不是预览面板内部和图片链接
  if (
    previewMode.value === "sidebar" &&
    !event.target.closest(".image-preview-sidebar") &&
    !event.target.closest(".image-link")
  ) {
    proxy.emitter.emit('hidePreview')
  }
}

function openConfig() {
  store.commit('toggleConfig');
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function clearInput() {
  inputText.value = "";
}

function updateInputText(newVal) {
  inputText.value = newVal;
}

function compressJson() {
  if (isCompressed.value) {
    isCompressed.value = false;
  } else {
    compressedContent.value = JSON.stringify(content.value);
    isCompressed.value = true;
  }
}

function copyJson() {
  var result = "";
  if (isCompressed.value) {
    result = compressedContent.value;
  } else {
    result = JSON.stringify(content.value, null, 2);
  }
  copyToClipboard(result);
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copied!");
  });
}

function showToast(text) {
  toastMsg.value = text;
  let tooltip = document.querySelector(".copy-success-tip");

  // 添加动画效果 - 第一步：显示
  setTimeout(() => {
    tooltip.style.opacity = "1";
  }, 10);

  // 第二步：从上到下移动
  setTimeout(() => {
    tooltip.style.top = "20px"; // 最终位置
  }, 50);

  // 添加消失动画
  setTimeout(() => {
    tooltip.style.top = "-50px";
    // 移动回顶部
    setTimeout(() => {
      tooltip.style.opacity = "0";
    }, 100);
  }, 1200);
}

function fixIt() {
  try {
    const fixed = jsonFormat(inputText.value);
    inputText.value = fixed;
    errorMsg.value = "";
  } catch (err) {
    console.error("Failed to fix JSON:", err);
  }
}

watch(inputText, (newVal) => {
  try {
    content.value = JSON.parse(newVal);
    errorMsg.value = "";
  } catch (err) {
    errorMsg.value = err.message;
  }
});

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
  } catch (err) {
    console.error("Failed to read clipboard:", err);
  }
}

function handleSort() {
  const editor = jsonEditor.value;
  if (editor) {
    editor.handleSort();
  }
}

function resetSort() {
  if (originalJson.value) {
    content.value = JSON.parse(JSON.stringify(originalJson.value));
  }
}

function toggleTheme() {
  // 实现主题切换逻辑
}

</script>

<style scoped>
.my-editor ::-webkit-scrollbar {
  width: 6px;
}

.my-editor ::-webkit-scrollbar-track {
  background: #f5f5f5;
  /* 浅灰色轨道 */
}

.my-editor ::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  /* 浅灰色滑块 */
  border-radius: 3px;
}

.my-editor ::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
  /* 悬停时稍微深一点 */
}

.my-editor ::-webkit-scrollbar-corner {
  background: #f5f5f5;
}

.my-editor {
  max-width: 100%;
  width: 100%;
  flex: 1;
  height: 100%;
  overflow: hidden;
  --jse-value-color-number: #f75e53;
  background-color: rgba(250, 250, 250, 0.8);
  padding: 20px 0px 20px 20px;
  position: relative;
}

.error-msg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
  font-size: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
  color: #ffdfdf;
  background-color: rgba(255, 9, 9, 0.685);
}

.compressed-json {
  width: 100%;
  height: 100%;
  padding: 20px;
  font-family: "JetBrains Mono", Consolas, "Courier New", monospace;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
}

/* 确保压缩内容的滚动条样式与编辑器一致 */
.compressed-json::-webkit-scrollbar {
  width: 6px;
}

.compressed-json::-webkit-scrollbar-track {
  background: #f5f5f5;
}

.compressed-json::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  border-radius: 3px;
}

.compressed-json::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
}

.compressed-json::-webkit-scrollbar-corner {
  background: #f5f5f5;
}

/* 添加透明图片的棋盘格背景 */
.image-preview img {
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  background-color: #ffffff;
}

/* .config-panel {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 400px;
  background: rgba(250, 250, 250, 0.8);
  overflow: hidden;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.4s cubic-bezier(0.48, 0.3, 0.05, 1);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
} */

.config-panel.show {
  transform: translateX(0);
}

.config-content {
  padding: 20px;
}

.config-item {
  margin-bottom: 20px;
}

.config-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.config-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.config-input:focus {
  outline: none;
  border-color: #666;
}

.theme-toggle-btn {
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.theme-toggle-btn:hover {
  background-color: #e0e0e0;
}

.theme-toggle-btn:active {
  background-color: #d0d0d0;
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.config-input {
  flex: 1;
  /* 让输入框占据剩余空间 */
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.save-btn {
  padding: 8px 16px;
  background-color: #4caf50;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.save-btn:hover {
  background-color: #45a049;
}

.save-btn:active {
  background-color: #3d8b40;
}

.save-tooltip {
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 添加字体大小控制样式 */
.font-size-control {
  display: flex;
  align-items: center;
  gap: 12px;
}

.size-slider {
  flex: 1;
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  -webkit-appearance: none;
  appearance: none;
  outline: none;
}

.size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #4caf50;
  border-radius: 50%;
  cursor: pointer;
  transition: background-color 0.2s;
}

.size-slider::-webkit-slider-thumb:hover {
  background: #45a049;
}

.size-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}

.size-input:focus {
  outline: none;
  border-color: #4caf50;
}

/* 添加图片预览样式 */
.image-preview {
  max-width: 100px;
  max-height: 100px;
  margin: 4px 0;
  border-radius: 4px;
  overflow: hidden;
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
  background-color: #ffffff;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  display: block;
}



.preview-image {
  max-width: 300px;
  max-height: 200px;
  display: block;
  border-radius: 2px;
  background: #f5f5f5;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .image-preview-popup {
    background: #2d2d2d;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .preview-image {
    background: #1e1e1e;
  }
}

.copy-success-tip {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #1d1c32;
  color: #fff;
  padding: 12px 18px;
  border-radius: 8px;
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  top: -100px;
  transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0;
}

.tip-show {
  top: 10px;
}

.tip-hide {
  top: -100px;
}
</style>
