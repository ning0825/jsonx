<template>
  <div class="json-editor" :class="{ 'jse-theme-dark': isDarkTheme }">
    <!-- 工具栏 -->
    <!-- <div class="toolbar">
      <div class="search-container">
        <input
          type="text"
          class="search-input"
          v-model="searchText"
          placeholder="搜索..."
          @input="handleSearch"
          @keydown.enter="jumpToNextMatch"
          ref="searchInput"
        />
        <div class="search-options">
          <label>
            <input type="checkbox" v-model="caseSensitive" @change="handleSearch" />
            区分大小写
          </label>
        </div>
      </div>
    </div> -->

    <!-- JSON内容区域 -->
    <div class="editor-content" ref="editorContent">
      <!-- 树形视图 -->
      <div v-if="mode === 'tree'" class="tree-view">
        <!-- 添加根对象的开始括号 -->
        <div class="node-content root-bracket">
          <span class="bracket"> {{ Array.isArray(parsedContent) ? '[' : '{' }} </span>
        </div>

        <!-- 遍历根对象的属性 -->
        <div class="root-content">
          <TreeNode
            v-for="(val, key) in parsedContent"
            :key="key"
            :name="key"
            :value="val"
            :level="1"
            :expanded="expanded"
            :search-text="searchText"
            :case-sensitive="caseSensitive"
            @update:value="(newVal) => updateObjectProperty(key, newVal)"
          />
        </div>

        <!-- 添加根对象的结束括号 -->
        <div class="node-content root-bracket">
          <span class="bracket">{{ Array.isArray(parsedContent) ? ']' : '}' }}</span>
        </div>
      </div>

      <!-- 文本视图 -->
      <!-- <div v-else-if="mode === 'text'" class="text-view">
                <textarea ref="textEditor" v-model="textContent" @input="handleTextChange"
                    :class="{ 'dark': isDarkTheme }"></textarea>
            </div> -->
    </div>

    <!-- 状态栏 -->
    <div class="statusbar">
      <span>{{ getStatusMessage() }}</span>
      <span v-if="error" class="error">{{ error }}</span>
      <span v-if="searchText" class="search-status">
        找到 {{ matchCount }} 个匹配项
      </span>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, inject } from "vue";
import TreeNode from "./TreeNode.vue";

export default {
  name: "JSONEditor",

  components: {
    TreeNode,
  },

  props: {
    // 初始内容
    content: {
      type: [Object, String],
      required: true,
    },

    // 编辑器模式: 'tree' 或 'text'
    mode: {
      type: String,
      default: "tree",
      validator: (value) => ["tree", "text"].includes(value),
    },

    // 是否只读
    readOnly: {
      type: Boolean,
      default: false,
    },

    baseImageUrl: {
      type: String,
      default: "",
    },

    expanded: {
      type: Boolean,
      default: false,
    },

    modelValue: {
      type: Boolean,
      default: false,
    },

    // 外部搜索文本
    externalSearchText: {
      type: String,
      default: "",
    },
  },

  emits: ["update:content", "error", "resetSort", "update:modelValue", "showImagePreview", "hideImagePreview"],

  setup(props, { emit }) {
    // // 正确注入 previewMode，并提供默认值
    // const previewMode = inject("previewMode", ref("popup"));

    const isDarkTheme = ref(false);
    const isExpanded = ref(false);
    const error = ref(null);
    const textContent = ref("");
    const parsedContent = ref({});

    const previewSize = ref("fit");

    const previewImage = ref(null);

    const searchText = ref("");
    const caseSensitive = ref(false);
    const matchCount = ref(0);
    const currentMatchIndex = ref(-1);
    const searchInput = ref(null);

    // // 使用计算属性来同步内部和外部的 showPreview 状态
    // const localShowPreview = computed({
    //   get: () => props.modelValue,
    //   set: (value) => emit("update:modelValue", value),
    // });

    // // 计算属性:格式化的JSON字符串
    // const formattedJson = computed(() => {
    //     try {
    //         return JSON.stringify(parsedContent.value, null, 2)
    //     } catch (err) {
    //         return ''
    //     }
    // })

    // // 初始化内容
    const initContent = () => {
      try {
        if (typeof props.content === "string") {
          parsedContent.value = JSON.parse(props.content);
          textContent.value = props.content;
        } else {
          parsedContent.value = props.content;
          textContent.value = JSON.stringify(props.content, null, 2);
        }
        error.value = null;
      } catch (err) {
        error.value = `JSON解析错误: ${err.message}`;
        emit("error", err);
      }
    };

    // // 复制到剪贴板
    // const copyToClipboard = async () => {
    //     try {
    //         await navigator.clipboard.writeText(formattedJson.value)
    //         // 显示复制成功提示
    //     } catch (err) {
    //         error.value = '复制失败'
    //     }
    // }

    // 修改排序处理函数
    const handleSort = () => {
      try {
        // 切换排序顺序
        if (sortOrder.value === "default") {
          sortOrder.value = "asc";
        } else if (sortOrder.value === "asc") {
          sortOrder.value = "desc";
        } else {
          sortOrder.value = "default";
        }

        let sorted;
        if (sortOrder.value === "default") {
          // 恢复默认顺序，发出事件让父组件处理
          emit("resetSort");
          return;
        } else {
          // 执行排序
          sorted = sortObject(parsedContent.value, sortOrder.value);
        }

        parsedContent.value = sorted;
        textContent.value = JSON.stringify(sorted, null, 2);
        emit("update:content", sorted);
      } catch (err) {
        error.value = "排序失败";
      }
    };

    // 改进递归排序对象函数
    const sortObject = (obj, order = "asc") => {
      // 如果是数组，对每个元素递归排序
      if (Array.isArray(obj)) {
        return obj.map((item) => sortObject(item, order));
      }

      // 如果是对象，对键进行排序
      if (obj && typeof obj === "object" && obj !== null) {
        const sortedKeys = Object.keys(obj).sort((a, b) => {
          if (order === "asc") {
            return a.localeCompare(b, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          } else {
            return b.localeCompare(a, undefined, {
              numeric: true,
              sensitivity: "base",
            });
          }
        });

        const sortedObj = {};
        sortedKeys.forEach((key) => {
          sortedObj[key] = sortObject(obj[key], order);
        });
        return sortedObj;
      }

      // 其他类型直接返回
      return obj;
    };

    // 添加切换排序顺序函数
    // const toggleSortOrder = () => {
    //     const currentOrder = sortOrder.value
    //     sortOrder.value = currentOrder === 'asc' ? 'desc' : 'asc'
    //     handleSort()
    // }

    // 添加排序顺序状态
    const sortOrder = ref("default");

    // // 切换格式化
    // const toggleFormat = () => {
    //     try {
    //         if (props.mode === 'text') {
    //             const parsed = JSON.parse(textContent.value)
    //             textContent.value = JSON.stringify(parsed, null, 2)
    //         }
    //     } catch (err) {
    //         error.value = '格式化失败'
    //     }
    // }

    // // 切换主题
    // const toggleTheme = () => {
    //     isDarkTheme.value = !isDarkTheme.value
    // }

    // 处理文本变化
    // const handleTextChange = () => {
    //     try {
    //         const parsed = JSON.parse(textContent.value)
    //         parsedContent.value = parsed
    //         error.value = null
    //         emit('update:content', parsed)
    //     } catch (err) {
    //         error.value = `JSON解析错误: ${err.message}`
    //     }
    // }

    // // 处理节点更新
    // const handleNodeUpdate = (path, value) => {
    //     if (props.readOnly) return

    //     try {
    //         let temp = parsedContent.value
    //         const pathArray = path.split('.')
    //         const lastKey = pathArray.pop()

    //         pathArray.forEach(key => {
    //             temp = temp[key]
    //         })

    //         temp[lastKey] = value
    //         textContent.value = JSON.stringify(parsedContent.value, null, 2)
    //         emit('update:content', parsedContent.value)
    //     } catch (err) {
    //         error.value = '更新失败'
    //     }
    // }

    // 获取状态栏信息
    const getStatusMessage = () => {
      return "";
      try {
        const size = new Blob([textContent.value]).size;
        return `大小: ${formatSize(size)}`;
      } catch {
        return "";
      }
    };

    // 格式化文件大小
    const formatSize = (bytes) => {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    };

    // 监听content变化
    watch(() => props.content, initContent, { immediate: true });

    // 监听外部搜索文本变化
    watch(() => props.externalSearchText, (newSearchText) => {
      searchText.value = newSearchText;
      handleSearch();
    });

    onMounted(() => {
      initContent();
    });

    // // 修改处理值的渲染
    // const renderValue = (value) => {
    //   // 如果是字符串且可能是图片URL
    //   if (typeof value === "string" && isImageUrl(value)) {
    //     const fullUrl =
    //       value.startsWith("http") || value.startsWith("data:")
    //         ? value
    //         : (props.baseImageUrl || "") + value;
    //     return {
    //       type: "image",
    //       url: fullUrl,
    //       originalValue: value,
    //     };
    //   }
    //   return value;
    // };

    // // 修改判断是否是图片URL
    // const isImageUrl = (str) => {
    //   if (typeof str !== "string") return false;
    //   return (
    //     /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(str) ||
    //     str.startsWith("data:image/") ||
    //     (props.baseImageUrl &&
    //       /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.baseImageUrl + str))
    //   );
    // };

    // // 渲染图片预览
    // const renderImage = (url) => {
    //   const fullUrl =
    //     url.startsWith("http") || url.startsWith("data:")
    //       ? url
    //       : props.baseImageUrl + url;

    //   return {
    //     type: "image",
    //     url: fullUrl,
    //   };
    // };

    // // 展开所有节点
    // const expandAll = () => {
    //     isExpanded.value = true
    // }

    // // 折叠所有节点
    // const collapseAll = () => {
    //     isExpanded.value = false
    // }

    // // 重命名为 toggleExpandAll
    // const toggleExpandAll = () => {
    //     isExpanded.value = !isExpanded.value
    //     // 触发事件通知父组件
    //     emit('expand', isExpanded.value)
    // }

    // 更新对象属性
    const updateObjectProperty = (key, newVal) => {
      if (props.readOnly) return;
      const newContent = { ...parsedContent.value };
      newContent[key] = newVal;
      emit("update:content", newContent);
    };

    // 处理搜索
    const handleSearch = () => {
      // 重置匹配计数和当前匹配索引
      matchCount.value = 0;
      currentMatchIndex.value = -1;
      
      // 首先清除所有之前的高亮
      document.querySelectorAll('.search-match, .search-match-active').forEach(node => {
        node.classList.remove('search-match', 'search-match-active');
      });
      
      // 如果有搜索文本，则进行搜索
      if (searchText.value && searchText.value.trim()) {
        // 延迟执行搜索，避免频繁更新
        setTimeout(() => {
          const nodes = document.querySelectorAll('.tree-node');
          nodes.forEach(node => {
            const key = node.querySelector('.key');
            const value = node.querySelector('.value');
            
            if (key || value) {
              const keyText = key ? key.textContent : '';
              const valueText = value ? value.textContent : '';
              const searchLower = caseSensitive.value ? searchText.value : searchText.value.toLowerCase();
              const textLower = caseSensitive.value ? (keyText + valueText) : (keyText + valueText).toLowerCase();
              
              if (textLower.includes(searchLower)) {
                node.classList.add('search-match');
                matchCount.value++;
              }
            }
          });
        }, 100);
      }
    };

    // 跳转到下一个匹配项
    const jumpToNextMatch = () => {
      const matches = document.querySelectorAll('.search-match');
      if (matches.length === 0) return;

      // 移除之前的高亮
      matches.forEach(match => match.classList.remove('search-match-active'));

      // 更新当前匹配索引
      currentMatchIndex.value = (currentMatchIndex.value + 1) % matches.length;

      // 高亮当前匹配项
      const currentMatch = matches[currentMatchIndex.value];
      currentMatch.classList.add('search-match-active');

      // 滚动到当前匹配项
      currentMatch.scrollIntoView({
        behavior: 'instant',
        block: 'center'
      });

      // 保持搜索框焦点
      searchInput.value?.focus();
    };

        return {
      isDarkTheme,
      isExpanded,
      error,
      textContent,
      parsedContent,
      // formattedJson,
      // toggleExpand: toggleExpandAll,
      // copyToClipboard,
      handleSort,
      // toggleFormat,
      // toggleTheme,
      // handleTextChange,
      // handleNodeUpdate,
      getStatusMessage,
      // renderValue,
      // isImageUrl,
      // renderImage,
      // expandAll,
      // collapseAll,
      updateObjectProperty,
      sortOrder,
      // showPreview,
      // previewStyle,
      // previewImageUrl,
      // showImagePreview,
      // hideImagePreview,
      // hideSidePreview,
      // handleImageError,
      // previewSize,
      // imageInfo,
      // previewImage,
      // handleImageLoad,
      // toggleFullscreen,
      // previewMode,
      searchText,
      caseSensitive,
      matchCount,
      handleSearch,
      jumpToNextMatch,
      searchInput,
    };
  },
};
</script>

<style scoped>
.json-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro",
    monospace;
  background: var(--jse-background-color);
  color: var(--jse-text-color);
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  background: var(--jse-toolbar-background);
  border-bottom: 1px solid var(--jse-separator-color);
}

.toolbar-btn {
  padding: 4px 8px;
  margin: 0 2px;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--jse-text-color);
}

.toolbar-btn:hover {
  background: var(--jse-hover-background-color);
}

.editor-content {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.text-view textarea {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  resize: none;
}

.statusbar {
  padding: 4px 8px;
  background: var(--jse-statusbar-background);
  border-top: 1px solid var(--jse-separator-color);
  font-size: 12px;
}

.error {
  color: var(--jse-error-color);
  margin-left: 8px;
}

/* 暗色主题 */
/* :root {
  --jse-background-color: #ffffff;
  --jse-text-color: #1a1a1a;
  --jse-toolbar-background: #f5f5f5;
  --jse-statusbar-background: #f5f5f5;
  --jse-separator-color: #e0e0e0;
  --jse-hover-background-color: #e8e8e8;
  --jse-error-color: #ff4444;
} */

/* .jse-theme-dark {
  --jse-background-color: #1e1e1e;
  --jse-text-color: #d4d4d4;
  --jse-toolbar-background: #2d2d2d;
  --jse-statusbar-background: #2d2d2d;
  --jse-separator-color: #404040;
  --jse-hover-background-color: #383838;
  --jse-error-color: #ff6b6b;
} */

.root-bracket {
  padding: 2px 0;
}

.root-content {
  margin-left: 8px;
}

.bracket {
  color: #666;
  font-weight: normal;
}

.search-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  padding: 6px 12px;
  border: 1px solid var(--jse-separator-color);
  border-radius: 4px;
  font-size: 14px;
  width: 200px;
  background: var(--jse-background-color);
  color: var(--jse-text-color);
}

.search-input:focus {
  outline: none;
  border-color: var(--jse-hover-background-color);
}

.search-options {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--jse-text-color);
  font-size: 12px;
}

.search-options label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}

.search-status {
  margin-left: 12px;
  color: var(--jse-text-color);
  font-size: 12px;
}

:deep(.search-match) {
  background-color: rgba(255, 255, 0, 0.2);
}

:deep(.search-match-active) {
  background-color: rgba(255, 165, 0, 0.3) !important;
  outline: 2px solid #ffa500;
}

:deep(.jse-theme-dark .search-match) {
  background-color: rgba(255, 255, 0, 0.1);
}

:deep(.jse-theme-dark .search-match-active) {
  background-color: rgba(255, 165, 0, 0.2) !important;
  outline: 2px solid #ffa500;
}
</style>
