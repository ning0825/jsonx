<template>
  <div class="tree-node" :style="{ marginLeft: level * 8 + 'px' }">
    <div class="node-content">
      <!-- 展开/折叠按钮 -->
      <span v-if="isExpandable" class="expand-button" @click="toggleExpand">
        {{ isNodeExpanded ? "▼" : "▶" }}
      </span>
      <span v-else class="expand-placeholder"></span>

      <!-- 键名 -->
      <span class="key" v-if="name !== undefined">{{ name }}:</span>

      <!-- 值的显示 -->
      <template v-if="!isExpandable || !isNodeExpanded">
        <template v-if="!isImageValue">
          <span :class="['value', valueType]" :title="getFullValue()">
            {{ getDisplayValue() }}
          </span>
        </template>
        <div v-else class="image-preview-wrapper">
          <span
            class="value string image-link"
            @mouseenter="$emit('showPreview', value, $event)"
            @mouseleave="$emit('hidePreview')"
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
      <div class="node-content" :style="{ marginLeft: -8 + 'px' }">
        <span class="bracket">{{ Array.isArray(value) ? "]" : "}" }}</span>
      </div>
    </div>
  </div>
</template>

<script>
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
        console.log(newVal);
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
      if (typeof this.value === "string") return `"${this.value}"`;
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
  },
};
</script>

<style scoped>
.tree-node {
  font-family: monospace;
  line-height: 1.5;
}

.node-content {
  display: flex;
  align-items: center;
  padding: 2px 0;
}

.expand-button {
  width: 20px;
  cursor: pointer;
  user-select: none;
  color: #666;
}

.expand-placeholder {
  width: 20px;
}

.key {
  color: #881391;
  margin-right: 4px;
}

.value {
  color: #1a1a1a;
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
