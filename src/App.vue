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
        <PasteButton class="mr-2 mr-2-end" @click="handlePaste" />
      </div>
      <div class="toolbar-content">
        <ExpandedIcon class="mr-2" :isExpanded="isExpanded" @click="toggleExpand" />
        <CopyIcon class="mr-2 mr-2-end" @click="copyToClipboard" />
        <!-- <CompressIcon class="mr-2" @click="compressJson" />
      <EscapeIcon class="mr-2" />
      <UnescapeIcon class="mr-2" />
      <SortAscIcon class="mr-2" />
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
      <Textarea class="input-area" placeholder="在此输入 JSON" v-model="inputText" />
      <!-- 编辑器 -->
      <div class="my-editor">
        <VueJSONEditor ref="jsonEditor" :content="content" :readOnly="readOnly" :mainMenuBar="false"
          :navigationBar="false" />
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
  },
  beforeUnmount() {
    // 移除事件监听
    window.removeEventListener('resize', this.updatePasteButtonPosition);
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded;
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        if (this.isExpanded) {
          editor.collapse([], false);
        } else {
          editor.expand([], () => true);
        }
      }
    },
    compressJson() {
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
      // 排序功能
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
  padding: 20px 40px;
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
  padding: 18px 24px 18px 22px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 100px;
  white-space: nowrap;
  width: fit-content;
  margin: 10px 20px;
}

.toolbar-paste {
  padding: 18px;
  background-color: rgba(230, 250, 46, 0.8);
  border-radius: 100px;
  margin: 10px 20px;
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
  margin-right: 22px;
}

.mr-2-end {
  margin-right: 0px;
}

/* 修改 toolbar-content 中的图标样式 */
.mr-2 {
  cursor: pointer;
  border-radius: 8px;
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
  gap: 20px;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.input-area {
  width: 400px;
  resize: none;
  height: 100%;
  padding: 20px;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  background-color: rgba(250, 250, 250, 0.9);
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

/* 修改图标颜色 */
svg {
  color: #303030;
  transition: color 0.2s ease;
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
