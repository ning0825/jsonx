<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-left">
        <img src="./assets/logo.png" alt="Logo" class="logo">
        <div class="title-container">
          <div class="title">JsonX</div>
        </div>
      </div>
    </nav>

    <div>
      <div class="toolbar-paste" style="position: absolute;">
        <PasteButton @click="handlePaste" />
      </div>
      <div class="toolbar-content">
        <ExpandedIcon class="mr-2" :isExpanded="isExpanded" @click="toggleExpand" />
        <CopyIcon class="mr-2" @click="copyToClipboard" />
        <SortAscIcon ref="sortIcon" class="mr-2" @click="handleSort" />
        <CompressIcon class="mr-2" @click="compressJson" />
        <ConfigIcon class="mr-2" title="Config" @click="openConfig" />
        <!-- <EscapeIcon class="mr-2" />
      <UnescapeIcon class="mr-2" />
      <SortDescIcon class="mr-2" /> -->
        <!-- <div class="search-wrapper">
          <div class="search-container">
            <input type="text" class="search-input" v-model="searchText" placeholder="Search..." @input="searchContent"
              @focus="onSearchFocus">
          </div>
        </div> -->
      </div>
    </div>

    <!-- 添加内容区域 -->
    <div class="content">
      <!-- 左侧输入框 -->
      <div class="input-container">
        <Textarea class="input-area" placeholder="在此输入 JSON" v-model="inputText" />
        <DeleteButton class="delete-button" @click="clearInput" />
      </div>
      <div style="width: 20px;"></div>
      <!-- 编辑器 -->
      <div class="my-editor">
        <VueJSONEditor v-show="!isCompressed" ref="jsonEditor" :content="content" :readOnly="readOnly"
          :mainMenuBar="false" :navigationBar="false" :baseImageUrl="baseImageUrl" @openConfig="openConfig" />
        <div v-show="isCompressed" class="compressed-json">
          {{ compressedContent }}
        </div>
      </div>
    </div>
  </div>

  <!-- 添加设置面板 -->
  <div class="config-panel" :class="{ show: isConfigOpen }">
    <div class="config-content">
      <div class="config-item">
        <label class="config-label">图片 Base URL</label>
        <div class="input-with-button">
          <input type="text" class="config-input" v-model="baseImageUrl" placeholder="请输入图片 Base URL">
          <button class="save-btn" @click="saveBaseUrl">
            保存
          </button>
        </div>
      </div>
      <div class="config-item">
        <label class="config-label">代码主题</label>
        <button class="theme-toggle-btn" @click="toggleTheme">
          切换主题
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from '@/components/ui/button'
import CompressIcon from '@/components/icons/CompressIcon.vue'
import EscapeIcon from '@/components/icons/EscapeIcon.vue'
import UnescapeIcon from '@/components/icons/UnescapeIcon.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import SortAscIcon from '@/components/icons/SortAscIcon.vue'
import SortDescIcon from '@/components/icons/SortDescIcon.vue'
import VueJSONEditor from '@/components/VueJSONEditor.vue';
import { Textarea } from "@/components/ui/textarea"
import ExpandedIcon from '@/components/icons/ExpandedIcon.vue'
import PasteButton from '@/components/icons/PasteButton.vue'
import DeleteButton from '@/components/icons/DeleteButton.vue'
import ConfigIcon from '@/components/icons/ConfigIcon.vue'

export default {
  name: 'App',
  components: {
    Button,
    CompressIcon,
    EscapeIcon,
    UnescapeIcon,
    CopyIcon,
    SortAscIcon,
    SortDescIcon,
    VueJSONEditor,
    Textarea,
    ExpandedIcon,
    PasteButton,
    DeleteButton,
    ConfigIcon,
  },
  data() {
    return {
      searchText: '',
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
    }
  },
  mounted() {
    // 等待 DOM 更新完成
    this.$nextTick(() => {
      // 获取 my-editor 的位置
      const editor = document.querySelector('.my-editor');
      const content = document.querySelector('.content');
      if (editor && content) {
        const editorLeft = editor.getBoundingClientRect().left;
        const toolbarContent = document.querySelector('.toolbar-content');
        if (toolbarContent) {
          // 设置 toolbar-content 的左边距
          toolbarContent.style.marginLeft = `${editorLeft}px`;
          toolbarContent.style.marginRight = '0';
        }
      }
    });

    // 添加 toolbar-paste 位置更新
    this.$nextTick(() => {
      this.updatePasteButtonPosition();
      window.addEventListener('resize', this.updatePasteButtonPosition);
    });

    // 添加点击事件监听
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('resize', this.updatePasteButtonPosition);
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    toggleExpand() {
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        if (this.isExpanded) {
          editor.collapse([], false);
        } else {
          editor.expand([], () => true);
        }
        this.isExpanded = !this.isExpanded;
      }
    },
    compressJson() {
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        const content = editor.get();
        if (content.json) {
          if (this.isCompressed) {
            // 如果当前是压缩状态，切换回正常显示
            this.isCompressed = false;
          } else {
            // 压缩 JSON
            this.compressedContent = JSON.stringify(content.json);
            this.isCompressed = true;
          }
        }
      }
    },
    escapeJson() {
      // 转义功能
    },
    unescapeJson() {
      // 去除转义功能
    },
    copyToClipboard() {
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        const content = JSON.stringify(this.content.json, null, 2);
        navigator.clipboard.writeText(content).then(() => {
          // 创建提示元素
          const button = document.querySelector('.toolbar-content .mr-2:nth-child(2)'); // CopyIcon 按钮
          const tooltip = document.createElement('div');
          tooltip.textContent = 'copied!';
          tooltip.className = 'copy-tooltip';

          // 设置提示元素的位置
          const rect = button.getBoundingClientRect();
          tooltip.style.position = 'fixed';
          tooltip.style.left = `${rect.left}px`;
          tooltip.style.top = `${rect.top - 25}px`; // 在按钮上方显示

          // 添加到文档中
          document.body.appendChild(tooltip);

          // 200ms 后移除提示
          setTimeout(() => {
            document.body.removeChild(tooltip);
          }, 200);
        });
      }
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
    clearInput() {
      this.inputText = '';
    },
    handleSort() {
      const sortType = this.$refs.sortIcon.currentSortType
      switch (sortType) {
        case 'asc':
          // 执行升序排序
          this.sortJson('asc')
          break
        case 'desc':
          // 执行降序排序
          this.sortJson('desc')
          break
        default:
          // 恢复默认顺序
          this.sortJson('default')
          break
      }
    },
    openConfig(event) {
      // 移除事件参数的检查，因为可能从不同地方调用
      this.isConfigOpen = true;
    },
    toggleTheme() {
      // 暂时不实现切换主题的逻辑
      console.log('Toggle theme clicked');
    },
    handleOutsideClick(event) {
      // 如果配置面板已打开，且点击的不是配置面板内部和配置按钮
      if (this.isConfigOpen &&
        !event.target.closest('.config-panel') &&
        !event.target.closest('.mr-2[title="Config"]')) {
        this.isConfigOpen = false;
      }
    },
    saveBaseUrl() {
      // 这里可以添加保存成功的提示
      const tooltip = document.createElement('div');
      tooltip.textContent = '保存成功';
      tooltip.className = 'save-tooltip';

      const button = document.querySelector('.save-btn');
      const rect = button.getBoundingClientRect();
      tooltip.style.position = 'fixed';
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.top - 30}px`;

      document.body.appendChild(tooltip);

      setTimeout(() => {
        document.body.removeChild(tooltip);
      }, 2000);
    }
  },
  watch: {
    inputText: {
      handler(newValue) {
        try {
          if (!newValue) {
            this.content = { json: {} };
            this.isExpanded = false;
            return;
          }
          const jsonObj = JSON.parse(newValue);
          this.content = {
            json: jsonObj,
            text: undefined
          };
          this.isExpanded = false;
        } catch (e) {
          // JSON 解析错误时不更新 content
          console.error('Invalid JSON:', e);
        }
      },
      immediate: true
    },
  }
}
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
</style>

<style scoped>
/* https://github.com/josdejong/svelte-jsoneditor/blob/main/src/lib/themes/defaults.scss */
.my-editor {
  max-width: 100%;
  width: 100%;
  flex: 1;
  height: 100%;
  overflow: hidden;
  --jse-value-color-number: #f75e53;
}

>>>.jse-tree-mode.no-main-menu.svelte-vrx1dr {
  border: none;
  padding: 20px;
}

>>>.jse-tree-mode.svelte-vrx1dr {
  background-color: #00000000;
}

>>>.jse-tree-mode.svelte-vrx1dr .jse-contents:where(.svelte-vrx1dr) {
  background-color: #00000000;
  border: none;
}

>>>.jse-tree-mode.svelte-vrx1dr .jse-contents:where(.svelte-vrx1dr):last-child {
  border-bottom: none;
}

>>>textarea:focus {
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

/* 其他样式 */
.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100vh;
  font-family: sans-serif;
  overflow: hidden;
  background-image: url('@/assets/bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
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
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: rgba(250, 250, 250, 0.8);
}

/* 自定义滚动条样式 */
.input-area::-webkit-scrollbar,
.my-editor::-webkit-scrollbar {
  width: 6px;
}

.input-area::-webkit-scrollbar-track,
.my-editor::-webkit-scrollbar-track {
  background: #f5f5f5;
  /* 浅灰色轨道 */
}

.input-area::-webkit-scrollbar-thumb,
.my-edito::-webkit-scrollbar-thumb {
  background: #e0e0e0;
  /* 浅灰色滑块 */
  border-radius: 3px;
}

.input-area::-webkit-scrollbar-thumb:hover,
.my-editor::-webkit-scrollbar-thumb:hover {
  background: #d0d0d0;
  /* 悬停时稍微深一点 */
}

.input-area::-webkit-scrollbar-corner,
.my-editor::-webkit-scrollbar-corner {
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

.compressed-json {
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: rgba(250, 250, 250, 0.8);
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
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
  background-color: #4CAF50;
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
</style>
