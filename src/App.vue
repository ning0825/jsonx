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
      <div class="toolbar-content">
        <ExpandedIcon class="mr-2" @click="expandJson" />
        <CompressIcon class="mr-2" @click="compressJson" />
        <EscapeIcon class="mr-2" />
        <UnescapeIcon class="mr-2" />
        <CopyIcon class="mr-2" />
        <SortAscIcon class="mr-2" />
        <SortDescIcon class="mr-2" />
        <!-- <div class="search-wrapper">
          <div class="search-container">
            <input type="text" class="search-input" v-model="searchText" placeholder="Search..." @input="searchContent"
              @focus="onSearchFocus">
          </div>
        </div> -->
      </div>
    </nav>

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
    }
  },
  mounted() {
    // 监听编辑器内容区域的双击事件
    // const editorContent = document.querySelector('.my-editor');
    // if (editorContent) {
    //   editorContent.addEventListener('dblclick', this.handleDoubleClick);
    // }
  },
  beforeUnmount() {
    // 移除事件监听
    // const editorContent = document.querySelector('.my-editor');
    // if (editorContent) {
    //   editorContent.removeEventListener('dblclick', this.handleDoubleClick);
    // }
  },
  methods: {
    expandJson() {
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        editor.expand([], () => true); // 展开所有节点
      }
    },
    compressJson() {
      const editor = this.$refs.jsonEditor.editor;
      if (editor) {
        editor.expand([], () => false); // 折叠所有节点
      }
    },
    escapeJson() {
      // 转义功能
    },
    unescapeJson() {
      // 去除转义功能
    },
    copyToClipboard() {
      // 复制功能
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
  },
  watch: {
    inputText: {
      handler(newValue) {
        try {
          if (!newValue) {
            this.content = { json: {} };
            return;
          }
          const jsonObj = JSON.parse(newValue);
          this.content = {
            json: jsonObj,
            text: undefined
          };
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
  justify-content: center;
  align-items: center;
  padding: 20px 20px;
  position: relative;
}

.nav-left {
  display: flex;
  align-items: center;
  z-index: 1;
  position: absolute;
  top: 0;
  left: 0;
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
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 100px;
  white-space: nowrap;
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
  margin-right: 12px;
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
  padding: 0px 20px 20px 20px;
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

/* 修改 toolbar-content 中的图标样式 */
.toolbar-content .mr-2 {
  cursor: pointer;
  padding: 2px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.toolbar-content .mr-2:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}

.toolbar-content .mr-2:active {
  background-color: rgba(0, 0, 0, 0.1);
  transform: translateY(0px);
}

/* 修改图标颜色 */
.toolbar-content svg {
  color: #303030;
  transition: color 0.2s ease;
}

.toolbar-content .mr-2:hover svg {
  color: #0a0a0a;
}
</style>
