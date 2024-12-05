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
        <Button class="mr-2" variant="outline" size="icon" title="格式化" @click="formatJson">
          <FormatIcon />
        </Button>
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
        <div style="flex: 1;"></div>
        <div class="search-wrapper">
          <div class="search-container">
            <input 
              type="text" 
              class="search-input" 
              v-model="searchText"
              placeholder="Search..."
              @input="searchContent"
              @focus="onSearchFocus"
            >
          </div>
          <div v-if="showSearchResults" class="search-results">
            <div v-for="(result, index) in searchResults" 
                 :key="index" 
                 class="search-result-item"
                 @click="scrollToLine(result.lineNumber)">
              <div class="result-line"> {{result.lineNumber}}</div>
              <div class="result-content">{{result.content}}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="content">
      <textarea 
        class="input-area"
        v-model="inputJson"
        @input="formatJson"
        placeholder="在此输入 JSON"
      ></textarea>
      <div class="resizer" 
        @mousedown="startResize"
        @dblclick="resetSize"
      ></div>
      <div 
        class="output-area"
        @click="toggleCollapse"
        v-html="formattedJson"
      ></div>
    </div>
  </div>
</template>

<script>  
import { Button } from '@/components/ui/button'
import FormatIcon from '@/components/icons/FormatIcon.vue'
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
    FormatIcon,
    CompressIcon,
    EscapeIcon,
    UnescapeIcon,
    CopyIcon,
    SortAscIcon,
    SortDescIcon
  },
  data() {
    return {
      inputJson: '',
      formattedJson: '',
      searchText: '',
      searchResults: [],
      showSearchResults: false,
      searchDebounceTimer: null,
      collapsedLines: new Set(),
      isResizing: false,
      initialX: 0,
      initialLeftWidth: 0,
      rawFormattedText: '',
      closeSearchHandler: null
    }
  },
  methods: {
    formatJson() {
      try {
        if (this.inputJson) {
          const obj = JSON.parse(this.inputJson);
          const formatted = this.formatJsonWithCollapse(obj);
          this.formattedJson = formatted.html;
          this.rawFormattedText = this.formatJsonRaw(obj);
        } else {
          this.formattedJson = '';
          this.rawFormattedText = '';
        }
      } catch (e) {
        // 解析错信息
        const errorMessage = e.message;
        const position = e.message.match(/position (\d+)/);
        let errorPosition = position ? parseInt(position[1]) : null;
        
        // 生成错误提示
        let result = '';
        if (errorPosition !== null) {
          // 找到错误所在的行和列
          const lines = this.inputJson.split('\n');
          let currentPos = 0;
          let errorLine = 0;
          let errorColumn = 0;

          for (let i = 0; i < lines.length; i++) {
            if (currentPos + lines[i].length >= errorPosition) {
              errorLine = i;
              errorColumn = errorPosition - currentPos;
              break;
            }
            currentPos += lines[i].length + 1; // +1 for newline
          }

          // 构建错误提示
          result = `<div class="error-message">JSON 语法错误：${errorMessage}</div>`;
          lines.forEach((line, index) => {
            if (index === errorLine) {
              result += `<div class="error-line">`;
              result += `<span class="line-content">${this.escapeHtml(line)}</span>`;
              result += `<div class="error-indicator" style="margin-left: ${errorColumn}ch;"></div>`;
              result += `</div>`;
            } else {
              result += `<div class="line-content">${this.escapeHtml(line)}</div>`;
            }
          });
        } else {
          result = `<div class="error-message">JSON 语法错误：${errorMessage}</div>`;
        }
        
        this.formattedJson = result;
      }
    },
    formatJsonWithCollapse(obj, level = 0, isLast = true, lineNumber = 1) {
      const indent = '  '.repeat(level);
      let result = '';
      let currentLine = lineNumber;

      if (Array.isArray(obj)) {
        if (obj.length === 0) return { html: '[]', nextLine: currentLine + 1 };
        
        result += `<div class="json-line collapsible" data-collapsible="true">`;
        result += `<span class="line-number">${currentLine}</span>`;
        result += `<span class="line-icon">▼</span>`;
        result += `<span class="indent">${indent}</span>[<span class="ellipsis">...</span></div>`;
        currentLine++;
        
        result += `<div class="collapsible-content">`;
        obj.forEach((item, index) => {
          const linePrefix = `${indent}  `;
          const isLastItem = index === obj.length - 1;
          
          if (typeof item === 'object' && item !== null) {
            const formatted = this.formatJsonWithCollapse(item, level + 1, isLastItem, currentLine);
            result += formatted.html;
            currentLine = formatted.nextLine;
          } else {
            result += `<div class="json-line">`;
            result += `<span class="line-number">${currentLine}</span>`;
            result += `<span class="indent">${linePrefix}</span>${JSON.stringify(item)}${isLastItem ? '' : ','}</div>`;
            currentLine++;
          }
        });
        result += `<div class="json-line">`;
        result += `<span class="line-number">${currentLine}</span>`;
        result += `<span class="indent">${indent}</span>]${isLast ? '' : ','}</div>`;
        currentLine++;
        result += `</div>`;
      } else if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj);
        if (entries.length === 0) return { html: '{}', nextLine: currentLine + 1 };
        
        result += `<div class="json-line collapsible" data-collapsible="true">`;
        result += `<span class="line-number">${currentLine}</span>`;
        result += `<span class="line-icon">▼</span>`;
        result += `<span class="indent">${indent}</span>{<span class="ellipsis">...</span></div>`;
        currentLine++;
        
        result += `<div class="collapsible-content">`;
        entries.forEach(([key, value], index) => {
          const linePrefix = `${indent}  `;
          const isLastItem = index === entries.length - 1;
          
          if (typeof value === 'object' && value !== null) {
            result += `<div class="json-line">`;
            result += `<span class="line-number">${currentLine}</span>`;
            result += `<span class="indent">${linePrefix}</span>"${key}": `;
            currentLine++;
            
            const formatted = this.formatJsonWithCollapse(value, level + 1, isLastItem, currentLine);
            result += formatted.html;
            currentLine = formatted.nextLine;
            
            if (!isLastItem) result += ',';
            result += '</div>';
          } else {
            result += `<div class="json-line">`;
            result += `<span class="line-number">${currentLine}</span>`;
            result += `<span class="indent">${linePrefix}</span>"${key}": ${JSON.stringify(value)}${isLastItem ? '' : ','}</div>`;
            currentLine++;
          }
        });
        result += `<div class="json-line">`;
        result += `<span class="line-number">${currentLine}</span>`;
        result += `<span class="indent">${indent}</span>}${isLast ? '' : ','}</div>`;
        currentLine++;
        result += `</div>`;
      } else {
        result += JSON.stringify(obj);
      }

      return { html: result, nextLine: currentLine };
    },
    compressJson() {
      try {
        if (this.inputJson) {
          const obj = JSON.parse(this.inputJson);
          this.formattedJson = JSON.stringify(obj);
        }
      } catch (e) {
        this.formattedJson = '无效的 JSON 格式';
      }
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
      
      // 计算目标滚动位置（将标行放在中间）
      const targetPosition = (lineNumber - 1) * lineHeight;
      const scrollTop = targetPosition - (visibleHeight / 2) + lineHeight + paddingTop;

      // 滑滚动到目标位置
      textarea.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });

      // 移除所有已存在的临时高亮，但保留搜索高亮
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
      const collapsibleLine = event.target.closest('.collapsible');
      if (collapsibleLine && collapsibleLine.dataset.collapsible === 'true') {
        const icon = collapsibleLine.querySelector('.line-icon');
        const ellipsis = collapsibleLine.querySelector('.ellipsis');
        const isCollapsed = icon.textContent === '▼';
        
        icon.textContent = isCollapsed ? '▶' : '▼';
        ellipsis.style.display = isCollapsed ? 'inline' : 'none';
        
        const contentContainer = collapsibleLine.nextElementSibling;
        if (contentContainer && contentContainer.classList.contains('collapsible-content')) {
          contentContainer.style.display = isCollapsed ? 'none' : 'block';
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
        
        // 对输入内容进行转义
        const escaped = this.inputJson
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')
          .replace(/\t/g, '\\t')
          .replace(/\f/g, '\\f')
          .replace(/\b/g, '\\b');
        
        // 使用 execCommand 来支持撤销/重做
        const textarea = document.querySelector('.input-area');
        textarea.focus();
        textarea.select();
        document.execCommand('insertText', false, escaped);
        
        this.formatJson();
      } catch (e) {
        this.formattedJson = '无效的 JSON 格式';
      }
    },
    unescapeJson() {
      try {
        if (!this.inputJson) return;
        
        // 处理 \b 转义字符
        let unescaped = this.inputJson.replace(/\\b/g, '');
        
        // 处理其他转义字符
        const unescapeMap = {
          '\\"': '"',
          '\\n': '\n',
          '\\r': '\r',
          '\\t': '\t',
          '\\f': '\f'
        };
        
        // 使用正则表达式替换转义字符
        unescaped = unescaped.replace(/\\["nrtf]/g, match => unescapeMap[match]);
        
        // 最后处理双重转义的情况
        unescaped = unescaped.replace(/\\\\/g, '\\');
        
        // 使用 execCommand 来支持撤销/重做
        const textarea = document.querySelector('.input-area');
        textarea.focus();
        textarea.select();
        document.execCommand('insertText', false, unescaped);
        
        this.formatJson();
      } catch (e) {
        console.error('去除转义失败:', e);
      }
    },
    startResize(e) {
      this.isResizing = true;
      this.initialX = e.clientX;
      this.initialLeftWidth = document.querySelector('.input-area').offsetWidth;
      
      document.addEventListener('mousemove', this.resize);
      document.addEventListener('mouseup', this.stopResize);
      
      document.body.classList.add('resizing');
    },

    resize(e) {
      if (!this.isResizing) return;

      const content = document.querySelector('.content');
      const contentRect = content.getBoundingClientRect();
      const contentWidth = contentRect.width - 40;  // 减去内边距
      const minWidth = contentWidth * 0.2;
      const maxWidth = contentWidth * 0.8;
      
      let newLeftWidth = this.initialLeftWidth + (e.clientX - this.initialX);
      newLeftWidth = Math.max(minWidth, Math.min(maxWidth, newLeftWidth));
      
      const leftArea = document.querySelector('.input-area');
      const rightArea = document.querySelector('.output-area');
      const toolbarContent = document.querySelector('.toolbar-content');
      
      // 设置两个区域的度
      leftArea.style.flex = `0 1 ${newLeftWidth}px`;
      rightArea.style.flex = `0 1 ${contentWidth - newLeftWidth}px`;

      // 更新工具栏宽度，保持与 output-area 对齐
      toolbarContent.style.width = `${contentWidth - newLeftWidth}px`;
    },

    stopResize() {
      this.isResizing = false;
      document.removeEventListener('mousemove', this.resize);
      document.removeEventListener('mouseup', this.stopResize);
      document.body.classList.remove('resizing');
    },

    formatJsonRaw(obj, level = 0) {
      const indent = '  '.repeat(level);
      let result = '';

      if (Array.isArray(obj)) {
        if (obj.length === 0) return '[]';
        result += '[\n';
        obj.forEach((item, index) => {
          if (typeof item === 'object' && item !== null) {
            result += this.formatJsonRaw(item, level + 1);
          } else {
            result += `${indent}  ${JSON.stringify(item)}${index < obj.length - 1 ? ',' : ''}\n`;
          }
        });
        result += `${indent}]\n`;
      } else if (typeof obj === 'object' && obj !== null) {
        const entries = Object.entries(obj);
        if (entries.length === 0) return '{}';
        result += '{\n';
        entries.forEach(([key, value], index) => {
          if (typeof value === 'object' && value !== null) {
            result += `${indent}  "${key}": `;
            result += this.formatJsonRaw(value, level + 1);
            if (index < entries.length - 1) result += ',';
            result += '\n';
          } else {
            result += `${indent}  "${key}": ${JSON.stringify(value)}${index < entries.length - 1 ? ',' : ''}\n`;
          }
        });
        result += `${indent}}\n`;
      } else {
        result += JSON.stringify(obj) + '\n';
      }

      return result;
    },
    onSearchFocus() {
      // 触发搜索内容显示
      this.searchContent();
    },
    async copyToClipboard() {
      try {
        // 尝试解析并格式化 JSON
        const obj = JSON.parse(this.inputJson);
        const formattedText = JSON.stringify(obj, null, 2);
        await navigator.clipboard.writeText(formattedText);
        // 可以添加一个提示，告诉用户复制功
        alert('复制成功！');
      } catch (err) {
        // 如果解析失败或复制失败
        alert('复制失败：无效的 JSON 格式');
      }
    },
    sortJson(order = 'asc') {
      try {
        if (!this.inputJson) return;
        
        const obj = JSON.parse(this.inputJson);
        const sortedObj = this.sortObject(obj, order);
        
        // 只更新显示区域
        const formatted = this.formatJsonWithCollapse(sortedObj);
        this.formattedJson = formatted.html;
        this.rawFormattedText = this.formatJsonRaw(sortedObj);
        
      } catch (e) {
        alert('排序失败无效的 JSON 格式');
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
    resetSize() {
      const content = document.querySelector('.content');
      const contentRect = content.getBoundingClientRect();
      const contentWidth = contentRect.width - 40;  // 减去内边距
      
      const leftArea = document.querySelector('.input-area');
      const rightArea = document.querySelector('.output-area');
      const toolbarContent = document.querySelector('.toolbar-content');
      
      // 重置为 50-50 的布局
      const halfWidth = contentWidth / 2;
      leftArea.style.flex = `0 1 ${halfWidth}px`;
      rightArea.style.flex = `0 1 ${halfWidth}px`;
      
      // 更新工具栏宽度
      toolbarContent.style.width = `${halfWidth}px`;
    }
  },
  beforeUnmount() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    document.removeEventListener('mousemove', this.resize);
    document.removeEventListener('mouseup', this.stopResize);
    if (this.closeSearchHandler) {
      document.removeEventListener('click', this.closeSearchHandler);
    }
  },
  mounted() {
    // 初始化时设置 toolbar-content 的宽
    this.$nextTick(() => {
      const content = document.querySelector('.content');
      const contentRect = content.getBoundingClientRect();
      const contentWidth = contentRect.width - 50;  // 减去内边距
      const leftArea = document.querySelector('.input-area');
      const toolbarContent = document.querySelector('.toolbar-content');
      
      // 设置工具栏宽度，与 output-area 齐
      toolbarContent.style.width = `${contentWidth - leftArea.offsetWidth}px`;
    });
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
html, body {
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

.input-area,
.output-area {
  height: 100%;
  min-width: 0;
  flex: 0 1 50%;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  font-size: 14px;
  resize: none;
  border: none;
  overflow-y: auto;
  overflow-x: hidden;  /* 防止水平滚动 */
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 10px;
  line-height: 21px;
  scroll-behavior: smooth;
  --scroll-duration: 100ms;
}

.input-area {
  margin-right: 10px;
  cursor: text;
  white-space: pre-wrap;  /* 允许文本换行 */
}

.output-area {
  margin-left: 10px;
  cursor: default;
  white-space: pre-wrap;  /* 允许文本换 */
  word-break: break-word;  /* 允许在单内换行 */
}

.input-area:focus,
.output-area:focus {
  outline: none;
}

/* 自定义滚动条样式 */
.input-area::-webkit-scrollbar,
.output-area::-webkit-scrollbar {
  width: 6px;  /* 滚动条宽度变细 */
}

.input-area::-webkit-scrollbar-track,
.output-area::-webkit-scrollbar-track {
  background: #f1f1f1;  /* 滚动条轨道颜色 */
  border-radius: 3px;
}

.input-area::-webkit-scrollbar-thumb,
.output-area::-webkit-scrollbar-thumb {
  background: #ddd;  /* 滚动条颜色变浅 */
  border-radius: 3px;
}

.input-area::-webkit-scrollbar-thumb:hover,
.output-area::-webkit-scrollbar-thumb:hover {
  background: #ccc;  /* 悬停时的颜色 */
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
  margin-left: auto;  /* 将个搜索区域推到最右边 */
  width: 200px;  /* 固定搜索区域宽度 */
}

.search-container {
  display: inline-flex;
  align-items: center;
  width: 200px;  /* 固定搜索框宽度 */
  margin-left: auto;  /* 将搜索框推到最右边 */
}

.search-input {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  width: 100%;  /* 让输入框占满容器宽度 */
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
  right: 0;  /* 改为右对齐 */
  width: 25vw;  /* 保持宽度为屏幕宽度的四分之一 */
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-top: 8px;
  max-height: 144px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  transition: opacity 0.15s ease-in;  /* 缩短淡入时间，使用 ease-in */
  pointer-events: none;
  z-index: 1;
}

.highlight-temp.highlight-show::after {
  opacity: 1;
}

.highlight-temp.fade-out::after {
  opacity: 0;
  transition: opacity 0.4s ease-out;  /* 延长淡出时间，使用 ease-out */
}

.search-highlight {
  background-color: rgba(255, 255, 0, 0.2);  /* 黄高亮 */
}

/* 当同时存在两种亮时的样式 */
.json-line.highlight-temp.search-highlight {
  background: linear-gradient(
    rgba(255, 152, 0, 0.3),
    rgba(255, 152, 0, 0.3)
  ), rgba(255, 255, 0, 0.2) !important;
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
  white-space: pre-wrap;
  min-height: 21px;
  line-height: 21px;
  position: relative;
  padding-left: 45px;  /* 增加左边距，为行号留出空间 */
  user-select: none;
  width: 100%;
  overflow-wrap: break-word;
}

.json-line * {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  word-break: break-all;
}

.indent {
  display: inline-block;
  white-space: pre;
}

.collapsible-content {
  display: block;
  width: 100%;
}

.line-icon {
  position: absolute;
  left: 30px;  /* 调整箭头位置，位于行号之后 */
  top: 0;
  width: 15px;  /* 减小箭头宽度 */
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 10px;
  user-select: none;
}

.json-line.collapsible:hover .line-icon {
  color: #666;
}

.ellipsis {
  display: none;
  color: #999;
  margin-left: 2px;
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

.line-number {
  position: absolute;
  left: 0;
  width: 30px;  /* 调整宽度以适应多位数 */
  color: #bbb;
  font-size: 12px;
  text-align: right;
  padding-right: 8px;
  user-select: none;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
  line-height: 1;  /* 设置行高为 1，使其等于字体大小 */
  display: block;  /* 确保元素表现一致 */
  padding: 0;      /* 移除内边距 */
  margin: 0;       /* 移除外边距 */
}

.subtitle {
  color: #666;
  font-size: 14px;
  font-weight: 400;
  margin-top: 2px;
  line-height: 1;  /* 同样设置行高为 1 */
  display: block;
  padding: 0;
  margin-bottom: 0;
}

.title-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 12px;
  gap: 2px;        /* 使用 gap 替代 margin-top 来控制间距 */
}

</style>
