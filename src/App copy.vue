<script>
import { Button } from '@/components/ui/button'
import CompressIcon from '@/components/icons/CompressIcon.vue'
import EscapeIcon from '@/components/icons/EscapeIcon.vue'
import UnescapeIcon from '@/components/icons/UnescapeIcon.vue'
import CopyIcon from '@/components/icons/CopyIcon.vue'
import SortAscIcon from '@/components/icons/SortAscIcon.vue'
import SortDescIcon from '@/components/icons/SortDescIcon.vue'
import JSONEditor from '@/components/JSONEditor.vue'
import { Textarea } from "@/components/ui/textarea"
import ExpandedIcon from '@/components/icons/ExpandedIcon.vue'
import PasteButton from '@/components/icons/PasteButton.vue'
import DeleteButton from '@/components/icons/DeleteButton.vue'
import ConfigIcon from '@/components/icons/ConfigIcon.vue'
import { renderValue } from 'vanilla-jsoneditor'

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
    JSONEditor,
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
      isDarkTheme: false,
      originalJson: null,
      fontSize: 14,
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
    compressJson() {
      if (this.isCompressed) {
        this.isCompressed = false
      } else {
        this.compressedContent = JSON.stringify(this.content.json)
        this.isCompressed = true
      }
    },
    escapeJson() {
      // 转义功能
    },
    unescapeJson() {
      // 去除转义功能
    },
    copyToClipboard() {
      const content = JSON.stringify(this.content.json, null, 2)
      navigator.clipboard.writeText(content).then(() => {
        const button = document.querySelector('.toolbar-content .mr-2:nth-child(2)')
        const tooltip = document.createElement('div')
        tooltip.textContent = 'copied!'
        tooltip.className = 'copy-tooltip'

        const rect = button.getBoundingClientRect()
        tooltip.style.position = 'fixed'
        tooltip.style.left = `${rect.left}px`
        tooltip.style.top = `${rect.top - 25}px`

        document.body.appendChild(tooltip)

        setTimeout(() => {
          document.body.removeChild(tooltip)
        }, 200)
      })
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
      const editor = this.$refs.jsonEditor
      if (editor) {
        editor.handleSort()
        // 更新排序图标
        const order = editor.sortOrder
        const icon = this.$refs.sortIcon
        if (icon) {
          icon.updateIcon(order)
        }
      }
    },
    handleResetSort() {
      // 恢复到原始顺序
      if (this.originalJson) {
        this.content.json = JSON.parse(JSON.stringify(this.originalJson))
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
    handleExpand(expanded) {
      this.isExpanded = expanded
    }
  },
  watch: {
    inputText: {
      handler(newValue) {
        try {
          if (!newValue) {
            this.content.json = {}
            this.originalJson = {} // 重置原始数据
            this.isExpanded = false
            return
          }
          const jsonObj = JSON.parse(newValue)
          this.content.json = jsonObj
          this.originalJson = JSON.parse(JSON.stringify(jsonObj)) // 保存原始数据
          this.isExpanded = false
        } catch (e) {
          console.error('Invalid JSON:', e)
        }
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

/* 导入暗色主题样式 */
@import 'vanilla-jsoneditor/themes/jse-theme-dark.css';

/* 将滚动条样式移到这个未加 scoped 的 style 块中 */
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
  background-color: rgba(250, 250, 250, 0.8);
  padding: 20px 0px 20px 20px;
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
  background: #4CAF50;
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
  border-color: #4CAF50;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .size-slider {
    background: #404040;
  }

  .size-input {
    background: #2d2d2d;
    border-color: #404040;
    color: #d4d4d4;
  }

  .size-input:focus {
    border-color: #4CAF50;
  }
}
</style>
