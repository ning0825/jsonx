<template>
  <GlassTheme
    :inputText="inputText"
    @handlePaste="handlePaste"
    @openConfig="openConfig"
    @toggleExpand="toggleExpand"
    @clearInput="clearInput"
    @update:inputText="updateInputText"
    @compressJson="compressJson"
    @copyToClipboard="copyToClipboard"
    @handleSort="handleSort"
  >
    <div class="my-editor">
      <JSONEditor
        v-show="!isCompressed"
        ref="jsonEditor"
        :content="content.json"
        :mode="'tree'"
        :readOnly="true"
        :baseImageUrl="baseImageUrl"
        :expanded="isExpanded"
        @resetSort="resetSort"
      />
      <div v-show="isCompressed" class="compressed-json">
        {{ compressedContent }}
      </div>
    </div>
  </GlassTheme>
  <!-- 添加设置面板 -->
  <div class="config-panel" :class="{ show: isConfigOpen }">
    <div class="config-content">
      <div class="config-item">
        <label class="config-label">图片 Base URL</label>
        <div class="input-with-button">
          <input
            type="text"
            class="config-input"
            v-model="baseImageUrl"
            placeholder="请输入图片 Base URL"
          />
          <button class="save-btn" @click="saveBaseUrl">保存</button>
        </div>
      </div>
      <div class="config-item">
        <label class="config-label"> 编辑器字体大小: {{ fontSize }}px </label>
        <div class="font-size-control">
          <input
            type="range"
            class="size-slider"
            v-model="fontSize"
            min="12"
            max="60"
            step="1"
          />
          <input
            type="number"
            class="size-input"
            v-model="fontSize"
            min="12"
            max="60"
          />
        </div>
      </div>
      <div class="config-item">
        <label class="config-label">代码主题</label>
        <button class="theme-toggle-btn" @click="toggleTheme">切换主题</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import GlassTheme from "@/components/themes/GlassTheme.vue";
import JSONEditor from "@/components/JSONEditor.vue";

var inputText = ref("");
var content = ref({
  json: {},
  text: undefined,
});
var isConfigOpen = ref(false);
var baseImageUrl = ref("");
var fontSize = ref(14);
var isExpanded = ref(false);
var isCompressed = ref(false);
var compressedContent = ref("");
var jsonEditor = ref(null);
var originalJson = ref(null);

onMounted(() => {
  // 添加点击事件监听
  document.addEventListener("click", handleOutsideClick);
});

watch(
  () => inputText.value,
  (newVal) => {
    try {
      if (!newVal) {
        content.value.json = {};
        originalJson.value = {}; // 重置原始数据
        isExpanded.value = false;
        return;
      }
      const jsonObj = JSON.parse(newVal);
      content.value.json = jsonObj;
      originalJson.value = JSON.parse(JSON.stringify(jsonObj)); // 保存原始数据
      isExpanded.value = false;
    } catch (e) {
      console.error("Invalid JSON:", e);
    }
  }
);

async function handlePaste() {
  try {
    const text = await navigator.clipboard.readText();
    inputText.value = text;
  } catch (err) {
    console.error("Failed to read clipboard:", err);
  }
}

function handleOutsideClick(event) {
  // 如果配置面板已打开，且点击的不是配置面板内部和配置按钮
  if (
    isConfigOpen.value &&
    !event.target.closest(".config-panel") &&
    !event.target.closest('.mr-2[title="Config"]')
  ) {
    isConfigOpen.value = false;
  }
}

function openConfig() {
  isConfigOpen.value = !isConfigOpen.value;
}

function toggleExpand() {
  isExpanded.value = !isExpanded.value;
}

function saveBaseUrl() {
  // 这里可以添加保存成功的提示
  const tooltip = document.createElement("div");
  tooltip.textContent = "保存成功";
  tooltip.className = "save-tooltip";

  const button = document.querySelector(".save-btn");
  const rect = button.getBoundingClientRect();
  tooltip.style.position = "fixed";
  tooltip.style.left = `${rect.left}px`;
  tooltip.style.top = `${rect.top - 30}px`;

  document.body.appendChild(tooltip);

  setTimeout(() => {
    document.body.removeChild(tooltip);
  }, 2000);
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
    compressedContent.value = JSON.stringify(content.value.json);
    isCompressed.value = true;
  }
}

function copyToClipboard() {
  const result = JSON.stringify(content.value.json, null, 2);
  navigator.clipboard.writeText(result).then(() => {
    const button = document.querySelector(
      ".toolbar-content .mr-2:nth-child(2)"
    );
    const tooltip = document.createElement("div");
    tooltip.textContent = "copied!";
    tooltip.className = "copy-tooltip";

    const rect = button.getBoundingClientRect();
    tooltip.style.position = "fixed";
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.top - 25}px`;

    document.body.appendChild(tooltip);

    setTimeout(() => {
      document.body.removeChild(tooltip);
    }, 200);
  });
}

function handleSort() {
  const editor = jsonEditor.value;
  if (editor) {
    editor.handleSort();
    // 更新排序图标
    // const order = editor.sortOrder;
    // const icon = this.$refs.sortIcon;
    // if (icon) {
    //   icon.updateIcon(order);
    // }
  }
}

function resetSort() {
  if (originalJson.value) {
    content.value.json = JSON.parse(JSON.stringify(originalJson.value));
  }
}
</script>

<!-- <script>
import GlassTheme from '@/components/themes/GlassTheme.vue'
import JSONEditor from '@/components/JSONEditor.vue'

export default {
  name: 'App',
  components: {
    GlassTheme,
    JSONEditor,
  },
  data() {
    return {
      readOnly: true,
      content: {
        json: {
          greeting: 'Hello World',
          color: '#ff3e00', name: 'adfadf',
          ok: true,
          values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
        text: undefined,
      },
      inputText: '',
      isExpanded: false,
      isCompressed: false,
      compressedContent: '',
      isConfigOpen: false,
      baseImageUrl: '',
      isDarkTheme: false,
      originalJson: null,
      fontSize: 14,
    }
  },
  mounted() {

    // 从本地存储加载字体大小
    const savedFontSize = localStorage.getItem('editor-font-size')
    if (savedFontSize) {
      this.fontSize = parseInt(savedFontSize)
    }
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('resize', this.updatePasteButtonPosition);
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    toggleExpand() {
      const editor = this.$refs.jsonEditor
      if (editor) {
        editor.toggleExpand()
      }
    },

    escapeJson() {
      // 转义功能
    },
    unescapeJson() {
      // 去除转义功能
    },

    sortJson(order) {
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        // 获取当前内容
        const content = editor.get();
        if (content.json) {
          if (order === 'default') {
            // 恢复默认排序
            editor.set({
              json: this.inputText ? JSON.parse(this.inputText) : {}
            });
          } else {
            // 对内容进行排序
            const sortedContent = {
              json: this.sortObject(content.json, order)
            };
            // 设置排序后的内容
            editor.set(sortedContent);
          }
        }
      }
    },
    sortObject(obj, order) {
      // 如果是数组，对每个元素递归排序
      if (Array.isArray(obj)) {
        return [...obj].map(item => this.sortObject(item, order));
      }
      // 如果是对象，对键进行排序
      else if (obj && typeof obj === 'object') {
        const sorted = {};
        Object.keys(obj)
          .sort((a, b) => order === 'asc' ? a.localeCompare(b) : b.localeCompare(a))
          .forEach(key => {
            sorted[key] = this.sortObject(obj[key], order);
          });
        return sorted;
      }
      // 其他类型直接返回
      return obj;
    },
    jsToJson() {
      // JS对象转JSON功能
    },
    searchContent() {
      // 搜索功能
    },
    onSearchFocus() {
      // 搜索框获得焦点时的处理
    },
    updateToolbarPosition() {
      const editor = document.querySelector('.my-editor');
      const content = document.querySelector('.content');
      if (editor && content) {
        const editorLeft = editor.getBoundingClientRect().left;
        const toolbarContent = document.querySelector('.toolbar-content');
        if (toolbarContent) {
          toolbarContent.style.marginLeft = `${editorLeft}px`;
          toolbarContent.style.marginRight = '0';
        }
      }
    },
    async handlePaste() {
      try {
        const text = await navigator.clipboard.readText();
        this.inputText = text;
      } catch (err) {
        console.error('Failed to read clipboard:', err);
      }
    },
    updatePasteButtonPosition() {
      const inputArea = document.querySelector('.input-area');
      if (inputArea) {
        const inputRight = inputArea.getBoundingClientRect().right;
        const toolbarPaste = document.querySelector('.toolbar-paste');
        if (toolbarPaste) {
          const pasteWidth = toolbarPaste.offsetWidth;
          toolbarPaste.style.left = `${inputRight - pasteWidth - 20}px`;
        }
      }
    },

    openConfig(event) {
      // 移除事件参数的检查，因为可能从不同地方调用
      this.isConfigOpen = true;
    },
    toggleTheme() {
      this.isDarkTheme = !this.isDarkTheme;

      // 获取编辑器容器
      const editorContainer = document.querySelector('.my-editor');

      if (this.isDarkTheme) {
        editorContainer.classList.add('jse-theme-dark');
        // 添加暗色主题的变量
        document.documentElement.style.setProperty('--jse-theme-color', '#383e42');
        document.documentElement.style.setProperty('--jse-theme-color-highlight', '#687177');
      } else {
        editorContainer.classList.remove('jse-theme-dark');
        // 恢复默认主题的变量
        document.documentElement.style.removeProperty('--jse-theme-color');
        document.documentElement.style.removeProperty('--jse-theme-color-highlight');
      }

      // 刷新编辑器以应用新主题
      this.$refs.jsonEditor?.editor?.refresh();
    },


    onRenderValue(props) {
      // 使用默认的渲染器，但应用当前主题的样式
      return renderValue(props)
    },
    handleEditorUpdate(newContent) {
      this.content.json = newContent
      // 保存未排序的原始数据
      if (!this.originalJson) {
        this.originalJson = JSON.parse(JSON.stringify(newContent))
      }
    },
    handleEditorError(err) {
      console.error('JSON编辑器错误:', err)
    },
  },
  watch: {
    inputText: {
      handler(newValue) {
        try {

      },
      immediate: true
    },
    fontSize(newSize) {
      // 更新编辑器字体大小
      const editor = document.querySelector('.my-editor')
      if (editor) {
        editor.style.fontSize = `${newSize}px`
      }
      // 保存到本地存储
      localStorage.setItem('editor-font-size', newSize)
    }
  }
}
</script> -->

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
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #ffffff;
}

.config-panel {
  position: fixed;
  right: 0;
  top: 0;
  height: 100vh;
  width: 400px;
  background: rgba(250, 250, 250, 0.8);
  overflow: hidden;
  z-index: 1000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
}

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
</style>
