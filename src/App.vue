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
          <div v-if="showSearchResults" class="search-results">
            <div v-for="(result, index) in searchResults" :key="index" class="search-result-item"
              @click="scrollToLine(result.lineNumber)">
              <div class="result-content">{{ result.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content">
      <textarea class="input-area" v-model="inputJson" @input="formatJson" placeholder="在此输入 JSON"></textarea>
      <div class="resizer" @mousedown="startResize" @dblclick="resetSize"></div>
      <div class="output-container">
        <div class="line-numbers">
          <div v-for="n in lineCount" :key="n" class="line-number">{{ n }}</div>
        </div>
        <div class="output-area" @click="toggleCollapse" v-html="formattedJson"></div>
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
      inputJson: '',
      formattedJson: '',
      searchText: '',
      searchResults: [],
      showSearchResults: false,
      searchDebounceTimer: null,
      closeSearchHandler: null
    }
  },
  computed: {
    lineCount() {
      if (!this.formattedJson) return 0;

      // 计算 json-line 类的元素数量
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = this.formattedJson;
      const lineElements = tempDiv.getElementsByClassName('json-line');
      return lineElements.length;
    }
  },
  methods: {
    compressJson() {
      try {
        if (this.inputJson) {
          const obj = JSON.parse(this.inputJson);
          const compressed = JSON.stringify(obj);
          const textarea = document.querySelector('.input-area');
          textarea.focus();
          textarea.select();
          document.execCommand('insertText', false, compressed);
        }
      } catch (e) {
        // alert('无效的 JSON 格式');
      }
    },
    async copyToClipboard() {
      try {
        const obj = JSON.parse(this.inputJson);
        const formattedText = JSON.stringify(obj, null, 2);
        await navigator.clipboard.writeText(formattedText);
        alert('复制成功！');
      } catch (err) {
        alert('复制失败：无效的 JSON 格式');
      }
    },
    sortJson(order = 'asc') {
      try {
        if (!this.inputJson) return;

        const obj = JSON.parse(this.inputJson);
        const sortedObj = this.sortObject(obj, order);
        const formatted = JSON.stringify(sortedObj, null, 2);

        const textarea = document.querySelector('.input-area');
        textarea.focus();
        textarea.select();
        document.execCommand('insertText', false, formatted);
      } catch (e) {
        alert('排序失败：无效的 JSON 格式');
      }
    },
    sortObject(obj, order = 'asc') {
      if (obj === null || typeof obj !== 'object') {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(item => this.sortObject(item, order));
      }

      const sorted = {};
      const keys = Object.keys(obj).sort((a, b) => {
        if (order === 'asc') {
          return a.localeCompare(b);
        } else {
          return b.localeCompare(a);
        }
      });

      for (const key of keys) {
        sorted[key] = this.sortObject(obj[key], order);
      }

      return sorted;
    },
    onSearchFocus() {
      this.searchContent();
    },
    searchContent() {
      if (this.searchDebounceTimer) {
        clearTimeout(this.searchDebounceTimer);
      }

      this.searchDebounceTimer = setTimeout(() => {
        if (!this.searchText || !this.rawFormattedText) {
          this.showSearchResults = false;
          // 移除所有亮
          const outputArea = document.querySelector('.output-area');
          const lines = outputArea.querySelectorAll('.json-line');
          lines.forEach(line => line.classList.remove('search-highlight'));
          return;
        }

        const lines = this.rawFormattedText.split('\n');
        this.searchResults = lines
          .map((line, index) => {
            if (line.toLowerCase().includes(this.searchText.toLowerCase())) {
              // 添加高亮到对应的行
              const outputArea = document.querySelector('.output-area');
              const lineElements = outputArea.querySelectorAll('.json-line');
              const lineElement = Array.from(lineElements).find(el => {
                const lineNumber = el.querySelector('.line-number');
                return lineNumber && lineNumber.textContent === `${index + 1}`;
              });
              if (lineElement) {
                lineElement.classList.add('search-highlight');
              }
              return {
                lineNumber: index + 1,
                content: line.trim()
              };
            }
            return null;
          })
          .filter(result => result !== null);

        // 移除配行的高亮
        const outputArea = document.querySelector('.output-area');
        const allLines = outputArea.querySelectorAll('.json-line');
        allLines.forEach(line => {
          const lineNumber = line.querySelector('.line-number');
          if (lineNumber) {
            const num = parseInt(lineNumber.textContent);
            if (!this.searchResults.some(result => result.lineNumber === num)) {
              line.classList.remove('search-highlight');
            }
          }
        });

        this.showSearchResults = this.searchResults.length > 0;

        if (this.showSearchResults) {
          this.$nextTick(() => {
            if (this.closeSearchHandler) {
              document.removeEventListener('click', this.closeSearchHandler);
            }

            this.closeSearchHandler = (e) => {
              const searchWrapper = document.querySelector('.search-wrapper');
              if (searchWrapper && !searchWrapper.contains(e.target)) {
                this.showSearchResults = false;
                document.removeEventListener('click', this.closeSearchHandler);
                this.closeSearchHandler = null;
              }
            };

            setTimeout(() => {
              document.addEventListener('click', this.closeSearchHandler);
            }, 0);
          });
        }
      }, 200);
    },
    scrollToLine(lineNumber) {
      const textarea = document.querySelector('.output-area');
      if (!textarea) return;

      // 获取每行的实际高度和 textarea 的可视区域高度
      const lineHeight = 21;
      const visibleHeight = textarea.clientHeight;
      const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop);

      // 计算目标滚动位置（将标行中间）
      const targetPosition = (lineNumber - 1) * lineHeight;
      const scrollTop = targetPosition - (visibleHeight / 2) + lineHeight + paddingTop;

      // 滑滚动到目标位置
      textarea.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });

      // 移除所有已存在的临时高亮但保留搜索高亮
      const allLines = textarea.querySelectorAll('.json-line');
      allLines.forEach(line => {
        line.classList.remove('highlight-temp');
      });

      // 高亮当前行
      const targetLine = Array.from(allLines).find(line => {
        const lineNumberEl = line.querySelector('.line-number');
        return lineNumberEl && parseInt(lineNumberEl.textContent) === lineNumber;
      });

      if (targetLine) {
        targetLine.classList.add('highlight-temp');
        targetLine.offsetHeight;  // 强制重排
        targetLine.classList.add('highlight-show');

        setTimeout(() => {
          targetLine.classList.add('fade-out');
          setTimeout(() => {
            targetLine.classList.remove('highlight-temp', 'highlight-show', 'fade-out');
          }, 400);  // 与淡出过渡时间匹配
        }, 500);  // 显示时间略微延长
      }
    },
    toggleCollapse(event) {
      // 检查点击是否发生在 json-line 上
      const jsonLine = event.target.closest('.json-line');
      if (jsonLine) {
        const toggleIcon = jsonLine.querySelector('.toggle-icon');
        const content = jsonLine.children[2];
        const ellipsis = jsonLine.querySelector('.ellipsis');

        if (toggleIcon && content && content.classList.contains('json-content')) {
          content.classList.toggle('collapsed');
          toggleIcon.textContent = content.classList.contains('collapsed') ? '▶' : '▼';
          if (ellipsis) {
            ellipsis.style.display = content.classList.contains('collapsed') ? 'inline' : 'none';
          }
        }
      }
    },
    getLineNumber(element) {
      const textArea = document.querySelector('.output-area');
      const text = textArea.value.substring(0, element.selectionStart);
      return text.split('\n').length;
    },
    updateCollapsedView() {
      const lines = this.formattedJson.split('\n');
      let result = [];
      let skipUntilLevel = null;
      let currentLevel = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const level = line.search(/\S/) / 2;

        if (skipUntilLevel !== null) {
          if (level <= skipUntilLevel) {
            skipUntilLevel = null;
          } else {
            continue;
          }
        }

        if (this.collapsedLines.has(i + 1)) {
          skipUntilLevel = level;
        }

        result.push(line);
      }

      this.formattedJson = result.join('\n');
    },
    escapeHtml(unsafe) {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    },
    escapeJson() {
      try {
        if (!this.inputJson) return;

        // 先尝试解析 JSON 以验证格式
        JSON.parse(this.inputJson);

        const escaped = this.inputJson
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f')
          .replace(/\b/g, '\\b');

        const textarea = document.querySelector('.input-area');
        textarea.focus();
        textarea.select();
        document.execCommand('insertText', false, escaped);
      } catch (e) {
        console.error('转义失败:', e);
      }
    },
    unescapeJson() {
      try {
        if (!this.inputJson) return;

        let unescaped = this.inputJson.replace(/\\b/g, '');

        const unescapeMap = {
          '\\"': '"',
          '\\n': '\n',
          '\\r': '\r',
          '\\t': '\t',
          '\\f': '\f'
        };

        unescaped = unescaped.replace(/\\["nrtf]/g, match => unescapeMap[match]);
        unescaped = unescaped.replace(/\\\\/g, '\\');

        const textarea = document.querySelector('.input-area');
        textarea.focus();
        textarea.select();
        document.execCommand('insertText', false, unescaped);
      } catch (e) {
        console.error('去除转义失败:', e);
      }
    },
    formatJson() {
      try {
        if (!this.inputJson) {
          this.formattedJson = '';
          return;
        }
        const obj = JSON.parse(this.inputJson);
        const formatted = this.formatJsonWithCollapse(obj, 0, true, true);
        this.formattedJson = formatted;
      } catch (e) {
        this.formattedJson = `<div class="error-message">JSON 语法错误：${e.message}</div>`;
      }
    },
    formatJsonWithCollapse(obj, level = 0, isLast = true, isFirst = false) {
      level = level - 1;
      if (level < 0) {
        level = 0;
      }
      const indent = '&nbsp;&nbsp;&nbsp;'.repeat(level);
      let result = '';

      if (isFirst) {
        result += `<div class="json-line">{<span class="toggle-icon">▼</span><span class="ellipsis" style="display: none;">...</span></div>`;
      }

      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';

        // result += `<div class="json-line">`;
        // result += `[<span class="toggle-icon">▼</span><span class="ellipsis" style="display: none;">...</span>`;
        // result += `</div>`;

        result += `<div class="json-content">`;
        obj.forEach((item, index) => {
          const isLastItem = index === obj.length - 1;
          if (typeof item === 'object' && item !== null) {
            result += this.formatJsonWithCollapse(item, level + 1, isLastItem);
          } else {
            result += `<div class="json-line">${JSON.stringify(item)}${isLastItem ? '' : ','}</div>`;
          }
        });
        result += `<div>${indent}]${!isLast ? ',' : ''}</div>`;
        result += `</div>`;
      } else if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';


        result += `<div class="json-content">`;

        entries.forEach(([key, value], index) => {
          const isLastItem = index === entries.length - 1;
          result += `<div class="json-line">`;
          result += `"${key}": `;
          if (Array.isArray(value) && value.length > 0) {
            result += `<span class="toggle-icon">▼</span>`;
            result += '[';
          } else if (typeof value === 'object' && value !== null && Object.keys(value).length > 0) {
            result += `<span class="toggle-icon">▼</span>`;
            result += '{';
          }
          result += `<span class="ellipsis" style="display: none;">...</span>`;
          if (typeof value === 'object' && value !== null) {
            result += this.formatJsonWithCollapse(value, level + 1, isLastItem);
          } else {
            result += `${JSON.stringify(value)}${isLastItem ? '' : ','}`;
          }
          result += `</div>`;
        });
        result += `<div>${indent}}${!isLast ? ',' : ''}</div>`;
        result += `</div>`;
      } else {
        result = JSON.stringify(obj);
      }

      return result;
    }
  },
  beforeUnmount() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    if (this.closeSearchHandler) {
      document.removeEventListener('click', this.closeSearchHandler);
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 添加这些式确保应用占满整个视口 */
html,
body {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background-color: #fafafa;
}

.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  padding: 0;
  flex-direction: column;
  min-height: 100vh;
  background-color: #fafafa;
}

.navbar {
  width: 100%;
  padding: 20px 20px 0px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.menu-btn {
  background: none;
  border: none;
  color: #333333;
  font-size: 24px;
  cursor: pointer;
}

.content {
  flex: 1;
  display: flex;
  width: 100%;
  height: calc(100vh - 60px - 56px);
  overflow: hidden;
  padding: 10px 20px;
  position: relative;
}

.input-area {
  flex: 1;
  height: 100%;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  line-height: 21px;
  background-color: #ffffff;
  white-space: pre-wrap;
  overflow-y: auto;
  overflow-x: hidden;
}

.input-area:focus {
  outline: none;
}

.toolbar {
  width: 100%;
  padding: 10px 20px 0 20px;
  display: flex;
  justify-content: flex-end;
}

.toolbar-content {
  padding: 0 0 0 10px;
  margin-left: auto;
  display: flex;
  align-items: flex-start;
}

.search-wrapper {
  position: relative;
  margin-left: auto;
  /* 将个搜索区域推到最右边 */
  width: 200px;
  /* 固定搜索区域宽度 */
}

.search-container {
  display: inline-flex;
  align-items: center;
  width: 200px;
  /* 固定搜索框宽度 */
  margin-left: auto;
  /* 将搜索框推到最右边 */
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;
  /* 让输入框占满容器宽度 */
  outline: none;
  height: 32px;
}

.search-input:focus {
  border-color: #2c3e50;
}

.search-btn {
  display: none;
}

.search-icon {
  font-size: 14px;
}

.search-results {
  position: absolute;
  top: 100%;
  right: 0;
  /* 改为右齐 */
  width: 25vw;
  /* 保持宽度为屏幕宽度四分之一 */
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
  max-height: 144px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-result-item {
  padding: 4px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  height: 32px;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background-color: #f5f5f5;
}

.result-line {
  color: #666;
  margin-right: 12px;
  min-width: 60px;
}

.result-content {
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 自定义搜索结果的滚动条样式 */
.search-results::-webkit-scrollbar {
  width: 6px;
}

.search-results::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 3px;
}

.search-results::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

.highlight-temp::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 152, 0, 0.3);
  opacity: 0;
  transition: opacity 0.15s ease-in;
  /* 缩短淡入时间，使 ease-in */
  pointer-events: none;
  z-index: 1;
}

.highlight-temp.highlight-show::after {
  opacity: 1;
}

.highlight-temp.fade-out::after {
  opacity: 0;
  transition: opacity 0.4s ease-out;
  /* 延淡出时间，用 ease-out */
}

.search-highlight {
  background-color: rgba(255, 255, 0, 0.2);
  /* 黄高亮 */
}

/* 当同时存在两种亮时的样式 */
.json-line.highlight-temp.search-highlight {
  background: linear-gradient(rgba(255, 152, 0, 0.3),
      rgba(255, 152, 0, 0.3)), rgba(255, 255, 0, 0.2) !important;
}

/* 移不再需要的式 */
.highlight-overlay,
.highlighted-line {
  display: none;
}

@media (prefers-reduced-motion: no-preference) {
  .output-area {
    scroll-behavior: smooth;
    transition: scroll-behavior var(--scroll-duration) ease;
  }
}

.json-line {
  position: relative;
  min-height: 21px;
  line-height: 21px;
  white-space: pre;
  padding-left: 20px;
  cursor: pointer;
}

.json-line:hover {
  background-color: #f5f5f5;
}

.toggle-icon {
  position: absolute;
  left: 4px;
  width: 12px;
  height: 12px;
  color: #666;
  font-size: 10px;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.ellipsis {
  color: #999;
  margin-left: 4px;
  user-select: none;
  display: none;
  /* 初始状态隐藏省略号 */
}

.error-message {
  color: #d32f2f;
  padding: 8px;
  margin-bottom: 8px;
  background-color: #ffebee;
  border-radius: 4px;
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  max-width: 100%;
  overflow-wrap: break-word;
}

.error-line {
  position: relative;
  background-color: #ffebee;
  padding: 2px 4px;
  margin: 2px 0;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
  max-width: 100%;
  overflow-wrap: break-word;
}

.error-indicator {
  position: absolute;
  bottom: 0;
  width: 2px;
  height: 2px;
  background-color: #d32f2f;
  border-radius: 50%;
}

.line-content {
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  max-width: 100%;
  overflow-wrap: break-word;
}

.resizer {
  width: 4px;
  background-color: transparent;
  cursor: col-resize;
  margin: 0 -2px;
  z-index: 100;
  flex: 0 0 4px;
}

/* 拖动时禁用文本选择 */
body.resizing {
  user-select: none;
  cursor: col-resize;
  /* & .resizer {
    background-color: #e0e0e0;
  } */
}

.json-line.collapsible {
  cursor: pointer;
}

.json-line.collapsible:hover {
  background-color: #f5f5f5;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  line-height: 1;
  /* 设置行高为 1，使其等于字体大小 */
  display: block;
  /* 确保元素表现一致 */
  padding: 0;
  /* 移除内边距 */
  margin: 0;
  /* 移除外边距 */
}

.subtitle {
  color: #666;
  font-size: 14px;
  font-weight: 400;
  margin-top: 2px;
  line-height: 1;
  /* 同样设置行高为 1 */
  display: block;
  padding: 0;
  margin-bottom: 0;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
  gap: 2px;
  /* 使用 gap 代 margin-top 来控制间距 */
}

.output-container {
  flex: 1;
  display: flex;
  margin-left: 10px;
  position: relative;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.line-numbers {
  width: 40px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  padding: 10px 0;
  position: sticky;
  left: 0;
  z-index: 2;
  user-select: none;
}

.line-number {
  height: 21px;
  line-height: 21px;
  text-align: right;
  padding-right: 8px;
  color: #999;
  font-size: 12px;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
}

.output-area {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  overflow-x: auto;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 21px;
  white-space: pre;
}

.json-line {
  white-space: pre-wrap;
  min-height: 21px;
  line-height: 21px;
  position: relative;
  /* padding-left: 20px; */
  width: 100%;
  overflow-wrap: break-word;
}

.line-icon {
  position: absolute;
  left: 30px;
  top: 0;
  width: 15px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 10px;
  user-select: none;
}

.indent {
  white-space: pre;
}

.resizer {
  width: 4px;
  background-color: transparent;
  cursor: col-resize;
  margin: 0 -2px;
  z-index: 100;
  flex: 0 0 4px;
}

/* 确保行号和内容对齐 */
.output-area>div:first-child {
  margin-top: 0;
}

.output-area>div:last-child {
  margin-bottom: 0;
}

.output-container {
  flex: 1;
  display: flex;
  margin-left: 10px;
  position: relative;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.line-numbers {
  width: 40px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  padding: 10px 0;
  position: sticky;
  left: 0;
  z-index: 2;
  user-select: none;
}

.json-line {
  position: relative;
  min-height: 21px;
  line-height: 21px;
  white-space: pre;
  padding-left: 20px;
}

.toggle-icon {
  position: absolute;
  left: 4px;
  width: 12px;
  height: 12px;
  cursor: pointer;
  color: #666;
  font-size: 10px;
  user-select: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.json-content {
  margin-left: 12px;
  transition: height 0.2s ease;
}

.json-content.collapsed {
  display: none;
}

/* 添加悬停效果 */
.json-line:hover>.toggle-icon {
  color: #333;
}
</style>
