<template>
  <div class="tree-node" :style="{ marginLeft: level * 8 + 'px' }">
    <div class="node-content">
      <!-- 展开/折叠按钮 -->
      <div @click="toggleExpand" style="cursor: pointer; display: flex;">
        <span v-if="isExpandable" class="expand-button" :style="{ rotate: isNodeExpanded ? '90deg' : '0deg' }">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.75 13.125C8.625 13.125 8.375 13.125 8.25 13C8 12.75 8 12.375 8.25 12.125L10.375 10L8.25 8C8 7.75 8 7.375 8.25 7.125C8.5 6.875 8.875 6.875 9.125 7.125L11.625 9.625C11.875 9.875 11.875 10.25 11.625 10.5L9.125 13C9.125 13.125 8.875 13.125 8.75 13.125Z" fill="#272636"/>
          </svg>
        </span>
        <span v-else class="expand-placeholder"></span>

        <!-- 键名 -->
        <span class="key" v-if="name !== undefined" @click="copy(name)">{{ name }}:</span>
      </div>

      <!-- 值的显示 -->
      <template v-if="!isExpandable || !isNodeExpanded">
        <template v-if="!isImageValue">
          <span :class="['value', valueType]" :title="getFullValue()" :style="{ cursor: isExpandable ? 'pointer' : 'pointer' }"
          @click="isExpandable ? toggleExpand() : copy(getDisplayValue())">
            {{ getDisplayValue() }}
          </span>
        </template>
        <div v-else class="image-preview-wrapper">
          <span
            class="value string image-link"
            @mouseenter="handleMouseEnter($event)"
            @mouseleave="handleMouseLeave"
          >
            "{{ value }}"
          </span>
        </div>
      </template>
      <template v-else>
        <!-- 添加对象/数组的开始括号 -->
        <span class="bracket">{{ Array.isArray(value) ? "[" : "{" }}</span>
      </template>
    </div>

    <!-- 子节点 -->
    <div v-if="isExpandable && isNodeExpanded" class="children">
      <template v-if="Array.isArray(value)">
        <TreeNode
          v-for="(item, index) in value"
          :key="index"
          :name="index"
          :value="item"
          :level="level + 1"
          :expanded="expanded"
          @update:value="updateArrayItem(index, $event)"
        />
      </template>
      <template v-else>
        <TreeNode
          v-for="(val, key) in value"
          :key="key"
          :name="key"
          :value="val"
          :level="level + 1"
          :expanded="expanded"
          @update:value="updateObjectProperty(key, $event)"
        />
      </template>
      <!-- 添加对象/数组的结束括号 -->
      <div class="node-content" :style="{ marginLeft: 16 + 'px' }">
        <span class="bracket">{{ Array.isArray(value) ? "]" : "}" }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { copyToClipboard } from "@/lib/utils";

export default {
  name: "TreeNode",

  props: {
    name: {
      type: [String, Number],
      required: false,
    },
    value: {
      type: [Object, Array, String, Number, Boolean, null],
      required: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    expanded: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      isNodeExpanded: this.expanded,
      previewTimer: null,
      isHovering: false,
    };
  },

  computed: {
    isExpandable() {
      return this.value !== null && typeof this.value === "object";
    },

    valueType() {
      if (this.value === null) return "null";
      if (Array.isArray(this.value)) return "array";
      return typeof this.value;
    },

    isImageValue() {
      if (typeof this.value !== "string") return false;
      return (
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(this.value) ||
        this.value.startsWith("data:image/")
      );
    },
  },

  watch: {
    expanded: {
      handler(newVal) {
        this.isNodeExpanded = newVal;
      },
      immediate: true,
    },
  },

  methods: {
    toggleExpand() {
      this.isNodeExpanded = !this.isNodeExpanded;
    },

    getDisplayValue() {
      if (this.value === null) return "null";
      if (this.value === undefined) return "undefined";
      if (typeof this.value === "string") return `${this.value}`;
      if (Array.isArray(this.value)) return `Array(${this.value.length})`;
      if (typeof this.value === "object") return "{...}";
      return String(this.value);
    },

    getFullValue() {
      try {
        return JSON.stringify(this.value);
      } catch {
        return String(this.value);
      }
    },

    updateArrayItem(index, newValue) {
      const newArray = [...this.value];
      newArray[index] = newValue;
      this.$emit("update:value", newArray);
    },

    updateObjectProperty(key, newValue) {
      const newObject = { ...this.value };
      newObject[key] = newValue;
      this.$emit("update:value", newObject);
    },

    handleMouseEnter(event) {
      // 清除之前的定时器（如果存在）
      if (this.previewTimer) {
        clearTimeout(this.previewTimer);
      }
      
      // 标记鼠标在元素上
      this.isHovering = true;
      
      // 使用定时器，鼠标悬停300毫秒后才显示预览
      this.previewTimer = setTimeout(() => {
        // 只有当鼠标仍在元素上时才触发预览
        if (this.isHovering) {
          this.emitter.emit("showPreview", this.value, event);
        }
      }, 300);
    },

    handleMouseLeave() {
      // 标记鼠标已离开
      this.isHovering = false;
      
      // 清除定时器
      if (this.previewTimer) {
        clearTimeout(this.previewTimer);
        this.previewTimer = null;
      }
      
      // 触发隐藏预览事件
      // this.emitter.emit('hidePreview');
    },

    copy(text) {
      this.emitter.emit("copy", text);
    }
  },

  emits: ["update:value", "showPreview", "hidePreview"],
};
</script>

<style scoped>
.tree-node {
  font-family: monospace;
  line-height: 1.5;
}

.node-content {
  display: flex;
  align-items: start;
  padding: 2px 0;
}

.expand-button {
  width: 20px;
  cursor: pointer;
  user-select: none;
  color: #666;
  transition: 0.2s ease-in-out;
}

.expand-placeholder {
  width: 20px;
}

.key {
  color: #881391;
  margin-right: 4px;
  cursor: pointer;
}

.value {
  color: #1a1a1a;
  cursor: pointer;
}

.value:hover, .key:hover {
  background: #dfdfdf;
  border-radius: 4px;
}

.value.string {
  color: #22863a;
}

.value.number {
  color: #005cc5;
}

.value.boolean {
  color: #e36209;
}

.value.null {
  color: #666;
}

.value.object {
  color: #8f8f8f !important;
}

.children {
  margin-left: 4px;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .key {
    color: #c792ea;
  }

  .value {
    color: #d4d4d4;
  }

  .value.string {
    color: #89ca78;
  }

  .value.number {
    color: #2bbac5;
  }

  .value.boolean {
    color: #ef9366;
  }

  .value.null {
    color: #999;
  }

  .expand-button {
    color: #999;
  }
}

/* 添加括号的样式 */
.bracket {
  color: #666;
  font-weight: normal;
}

.image-preview-wrapper {
  position: relative;
  display: inline-block;
}

.image-link {
  cursor: pointer;
  text-decoration: underline;
  color: #22863a;
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 0.2s;
}

.image-link:hover {
  color: #1a672b;
  background-color: rgba(34, 134, 58, 0.1);
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .image-link {
    color: #89ca78;
  }

  .image-link:hover {
    color: #a0d892;
    background-color: rgba(137, 202, 120, 0.1);
  }
}
</style>
