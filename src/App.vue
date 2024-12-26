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

    <!-- 工具栏 -->
    <div class="toolbar">
      <div class="toolbar-content">
        <Button class="mr-2" variant="outline" size="icon" title="压缩" @click="compressJson">
          <CompressIcon />
        </Button>
        <Button class="mr-2" variant="outline" size="icon" title="转义" @click="escapeJson">
          <EscapeIcon />
        </Button>
        <Button class="mr-2" variant="outline" size="icon" title="去除转义" @click="unescapeJson">
          <UnescapeIcon />
        </Button>
        <Button class="mr-2" variant="outline" size="icon" title="复制" @click="copyToClipboard">
          <CopyIcon />
        </Button>
        <Button class="mr-2" variant="outline" size="icon" title="升序" @click="sortJson('asc')">
          <SortAscIcon />
        </Button>
        <Button class="mr-2" variant="outline" size="icon" title="降序" @click="sortJson('desc')">
          <SortDescIcon />
        </Button>
        <Button class="mr-2" variant="outline" size="icon" title="JS对象转JSON" @click="jsToJson">
          <SortDescIcon />
        </Button>
        <div style="flex: 1;"></div>
        <div class="search-wrapper">
          <div class="search-container">
            <input type="text" class="search-input" v-model="searchText" placeholder="Search..." @input="searchContent"
              @focus="onSearchFocus">
          </div>
        </div>
      </div>
    </div>

    <!-- 添加内容区域 -->
    <div class="content">
      <!-- 左侧输入框 -->
      <Textarea class="input-area" placeholder="在此输入 JSON" v-model="inputText" />
      <!-- 编辑器 -->
      <div class="my-editor">
        <VueJSONEditor :content="content" :readOnly="readOnly" :mainMenuBar="false" :navigationBar="false" />
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
    compressJson() {
      // 压缩功能
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
  border-radius: 10px;
  --jse-value-color-number: #db53f7;
}

/* 导航栏样式 */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #e0e0e0;
}

.nav-left {
  display: flex;
  align-items: center;
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

/* 工具栏样式 */
.toolbar {
  width: 100%;
  padding: 10px 20px 0 20px;
  display: flex;
}

.toolbar-content {
  display: flex;
  align-items: flex-start;
  padding: 0;
  z-index: 10;
  background-color: #fafafa;
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
  border-radius: 4px;
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

/* 其他样式 */
.app {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: sans-serif;
}

.content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
  height: calc(100vh - 60px - 56px);
  /* 减去导航栏和工具栏的高度 */
  overflow: hidden;
}

.input-area {
  width: 400px;
  flex-shrink: 0;
  resize: none;
  height: 100%;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  padding: 10px;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.my-editor {
  flex: 1;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
</style>
