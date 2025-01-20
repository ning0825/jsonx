<template>
  <div class="json-editor" :class="{ 'jse-theme-dark': isDarkTheme }">
    <!-- <div class="toolbar">
            <div class="toolbar-left">
                <button class="toolbar-btn" @click="toggleExpand" :title="isExpanded ? '折叠' : '展开'">
                    <i :class="['icon', isExpanded ? 'icon-collapse' : 'icon-expand']"></i>
                </button>

                <button class="toolbar-btn" @click="copyToClipboard" title="复制">
                    <i class="icon icon-copy"></i>
                </button>

                <button class="toolbar-btn" @click="handleSort" title="排序">
                    <i class="icon icon-sort"></i>
                </button>

                <button class="toolbar-btn" @click="toggleFormat" title="压缩/美化">
                    <i class="icon icon-format"></i>
                </button>
            </div>

            <div class="toolbar-right">
                <button class="toolbar-btn" @click="toggleTheme" title="切换主题">
                    <i :class="['icon', isDarkTheme ? 'icon-light' : 'icon-dark']"></i>
                </button>
            </div>
        </div> -->

    <!-- JSON内容区域 -->
    <div class="editor-content" ref="editorContent">
      <!-- 树形视图 -->
      <div v-if="mode === 'tree'" class="tree-view">
        <!-- 添加根对象的开始括号 -->
        <div class="node-content root-bracket">
          <span class="bracket">{</span>
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
            @update:value="(newVal) => updateObjectProperty(key, newVal)"
            @showPreview="showImagePreview"
            @hidePreview="hideImagePreview"
          />
        </div>

        <!-- 添加根对象的结束括号 -->
        <div class="node-content root-bracket">
          <span class="bracket">}</span>
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
    </div>

    <!-- 弹窗预览 -->
    <div
      v-if="previewMode === 'popup'"
      v-show="showPreview"
      class="image-preview-popup"
      :style="previewStyle"
    >
      <img
        :src="previewImageUrl"
        :alt="previewImageUrl"
        @error="handleImageError"
        class="preview-image"
      />
    </div>

    <!-- 侧边栏预览 -->
    <div
      v-if="previewMode === 'sidebar'"
      class="image-preview-sidebar"
      :class="{ show: showPreview }"
    >
      <!-- 添加预览头部 -->
      <div class="preview-header">
        <span class="preview-title">图片预览</span>
        <div class="preview-actions">
          <button
            class="preview-btn"
            :class="{ active: previewSize === 'actual' }"
            @click="previewSize = 'actual'"
            title="实际大小"
          >
            1:1
          </button>
          <button
            class="preview-btn"
            :class="{ active: previewSize === 'fit' }"
            @click="previewSize = 'fit'"
            title="适应空间"
          >
            自适应
          </button>
          <button
            class="preview-btn"
            @click="toggleFullscreen"
            title="全屏预览"
          >
            <span class="fullscreen-icon">⛶</span>
          </button>
        </div>
      </div>

      <!-- 添加图片信息 -->
      <div class="preview-info" v-if="imageInfo">
        <div class="info-item">
          <span class="info-label">尺寸:</span>
          <span class="info-value"
            >{{ imageInfo.width }} × {{ imageInfo.height }}</span
          >
        </div>
        <div class="info-item">
          <span class="info-label">类型:</span>
          <span class="info-value">{{ imageInfo.type }}</span>
        </div>
      </div>

      <!-- 图片容器 -->
      <div class="preview-container" :class="previewSize">
        <img
          v-if="previewImageUrl"
          :src="previewImageUrl"
          :alt="previewImageUrl"
          @error="handleImageError"
          @load="handleImageLoad"
          class="preview-image"
          ref="previewImage"
        />
      </div>
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
  },

  emits: ["update:content", "error", "resetSort", "update:modelValue"],

  setup(props, { emit }) {
    // 正确注入 previewMode，并提供默认值
    const previewMode = inject("previewMode", ref("popup"));

    const isDarkTheme = ref(false);
    const isExpanded = ref(false);
    const error = ref(null);
    const textContent = ref("");
    const parsedContent = ref({});
    const showPreview = ref(false);
    const previewStyle = ref({ left: "0px", top: "0px" });
    const previewImageUrl = ref("");

    const previewSize = ref("fit");
    const imageInfo = ref(null);
    const previewImage = ref(null);

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
        console.log(err);
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

    onMounted(() => {
      initContent();
    });

    // 修改处理值的渲染
    const renderValue = (value) => {
      // 如果是字符串且可能是图片URL
      if (typeof value === "string" && isImageUrl(value)) {
        const fullUrl =
          value.startsWith("http") || value.startsWith("data:")
            ? value
            : (props.baseImageUrl || "") + value;
        return {
          type: "image",
          url: fullUrl,
          originalValue: value,
        };
      }
      return value;
    };

    // 修改判断是否是图片URL
    const isImageUrl = (str) => {
      if (typeof str !== "string") return false;
      return (
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(str) ||
        str.startsWith("data:image/") ||
        (props.baseImageUrl &&
          /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(props.baseImageUrl + str))
      );
    };

    // 渲染图片预览
    const renderImage = (url) => {
      const fullUrl =
        url.startsWith("http") || url.startsWith("data:")
          ? url
          : props.baseImageUrl + url;

      return {
        type: "image",
        url: fullUrl,
      };
    };

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

    const showImagePreview = (url, event) => {
      console.log("showImagePreview");
      console.log("event:", event);
      console.log("url:", url);
      const rect = event.target.getBoundingClientRect();
      previewStyle.value = {
        left: `${rect.right + 10}px`,
        top: `${rect.top - 10}px`,
      };
      previewImageUrl.value = url;
      showPreview.value = true;
    };

    const hideImagePreview = () => {
      if (previewMode.value === "popup") {
        showPreview.value = false;
      }
    };

    const hideSidePreview = () => {
      console.log("hideSidePreview");
      if (previewMode.value === "sidebar") {
        showPreview.value = false;
      }
    };

    const handleImageError = () => {
      console.error("Image load failed:", previewImageUrl.value);
      emit("update:modelValue", false);
    };

    const handleImageLoad = (event) => {
      const img = event.target;
      imageInfo.value = {
        width: img.naturalWidth,
        height: img.naturalHeight,
        type: getImageType(previewImageUrl.value),
      };
    };

    const getImageType = (url) => {
      if (url.startsWith("data:image/")) {
        return url.split(";")[0].split("/")[1].toUpperCase();
      }
      const ext = url.split(".").pop().toLowerCase();
      return ext.toUpperCase();
    };

    const toggleFullscreen = () => {
      const img = previewImage.value;
      if (!img) return;

      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        img.requestFullscreen();
      }
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
      renderValue,
      isImageUrl,
      renderImage,
      // expandAll,
      // collapseAll,
      updateObjectProperty,
      sortOrder,
      showPreview,
      previewStyle,
      previewImageUrl,
      showImagePreview,
      hideImagePreview,
      hideSidePreview,
      handleImageError,
      previewSize,
      imageInfo,
      previewImage,
      handleImageLoad,
      toggleFullscreen,
      previewMode,
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
:root {
  --jse-background-color: #ffffff;
  --jse-text-color: #1a1a1a;
  --jse-toolbar-background: #f5f5f5;
  --jse-statusbar-background: #f5f5f5;
  --jse-separator-color: #e0e0e0;
  --jse-hover-background-color: #e8e8e8;
  --jse-error-color: #ff4444;
}

.jse-theme-dark {
  --jse-background-color: #1e1e1e;
  --jse-text-color: #d4d4d4;
  --jse-toolbar-background: #2d2d2d;
  --jse-statusbar-background: #2d2d2d;
  --jse-separator-color: #404040;
  --jse-hover-background-color: #383838;
  --jse-error-color: #ff6b6b;
}

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

/* 添加图片预览样式 */
.image-preview {
  max-width: 100px;
  max-height: 100px;
  margin: 4px 0;
  border-radius: 4px;
  overflow: hidden;
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%),
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  background-color: #ffffff;
}

.image-preview img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 图片预览相关样式 */
.image-preview-popup {
  position: fixed;
  z-index: 1000;
  background: white;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  pointer-events: none;
  transition: opacity 0.2s;
}

.preview-image {
  max-width: 300px;
  max-height: 200px;
  display: block;
  border-radius: 2px;
  background: #f5f5f5;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .image-preview-popup {
    background: #2d2d2d;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  }

  .preview-image {
    background: #1e1e1e;
  }
}

/* 修改侧边栏预览样式，与 VueJSONEditor 保持一致 */
.image-preview-sidebar {
  position: fixed;
  right: -320px;
  top: 0;
  height: 100vh;
  width: 320px;
  background: white;
  padding: 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.image-preview-sidebar.show {
  right: 0;
}

.image-preview-sidebar .preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  margin: auto;
  display: block;
  background: transparent;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .image-preview-sidebar {
    background: #1e1e1e;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.3);
  }
}

/* 修改和添加侧边栏预览相关样式 */
.image-preview-sidebar {
  display: flex;
  flex-direction: column;
}

.preview-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
}

.preview-actions {
  display: flex;
  gap: 8px;
}

.preview-btn {
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: #f5f5f5;
}

.preview-btn.active {
  background: #4caf50;
  color: white;
  border-color: #4caf50;
}

.fullscreen-icon {
  font-size: 14px;
}

.preview-info {
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 12px;
}

.info-item {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-label {
  color: #666;
}

.preview-container {
  flex: 1;
  overflow: auto;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-container.fit .preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-container.actual .preview-image {
  max-width: none;
  max-height: none;
  object-fit: none;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .preview-header,
  .preview-info {
    border-color: #404040;
  }

  .preview-btn {
    background: #2d2d2d;
    border-color: #404040;
    color: #d4d4d4;
  }

  .preview-btn:hover {
    background: #383838;
  }

  .preview-btn.active {
    background: #4caf50;
    color: white;
    border-color: #4caf50;
  }

  .info-label {
    color: #999;
  }
}
</style>
