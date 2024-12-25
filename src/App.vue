<template>
  <div class="app">
    <!-- 导航栏 -->
    <nav class="navbar">
      <div class="nav-left">
        <img src="./assets/logo.png" alt="Logo" class="logo">
        <div class="title-container">
          <div class="title">JsonX</div>
          <div class="subtitle">The only JSON formatter you need</div>
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
  },
  data() {
    return {
      searchText: '',
    }
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
    }
  }
}
</script>

<style scoped>
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
  position: relative;
  z-index: 10;
}

.toolbar-content {
  position: absolute;
  left: calc(50% + 20px);
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
  min-height: 100vh;
  font-family: sans-serif;
}
</style>
