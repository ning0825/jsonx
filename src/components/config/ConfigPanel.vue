<template>
  <div class="config-panel" :class="{ show: isConfigOpen }">
    <div class="config-content">
      <div class="config-item">
        <label class="config-label">图片 Base URL</label>
        <div class="input-with-button">
          <input
            type="text"
            class="config-input"
            :value="baseImageUrl"
            @input="$emit('update:baseImageUrl', $event.target.value)"
            placeholder="请输入图片 Base URL"
          />
          <button class="save-btn" @click="saveBaseUrl">保存</button>
        </div>
      </div>
      <div class="config-item">
        <label class="config-label"> 编辑器字体大小: {{ fontSize }}px </label>
        <div class="font-size-control">
          <input
            type="range"
            class="size-slider"
            :value="fontSize"
            @input="$emit('update:fontSize', parseInt($event.target.value))"
            min="12"
            max="60"
            step="1"
          />
          <input
            type="number"
            class="size-input"
            :value="fontSize"
            @input="$emit('update:fontSize', parseInt($event.target.value))"
            min="12"
            max="60"
          />
        </div>
      </div>
      <div class="config-item">
        <label class="config-label">代码主题</label>
        <button class="theme-toggle-btn" @click="toggleTheme">切换主题</button>
      </div>
      <div class="config-item">
        <label class="config-label">图片预览模式</label>
        <div class="preview-mode-control">
          <button
            class="mode-btn"
            :class="{ active: previewMode === 'popup' }"
            @click="$emit('update:previewMode', 'popup')"
          >
            弹窗预览
          </button>
          <button
            class="mode-btn"
            :class="{ active: previewMode === 'sidebar' }"
            @click="$emit('update:previewMode', 'sidebar')"
          >
            侧边栏预览
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ConfigPanel",
  props: {
    isConfigOpen: Boolean,
    baseImageUrl: String,
    fontSize: Number,
    previewMode: {
      type: String,
      default: "popup",
      validator: (value) => ["popup", "sidebar"].includes(value),
    },
  },
  emits: [
    "update:baseImageUrl",
    "update:fontSize",
    "update:previewMode",
    "saveBaseUrl",
    "toggleTheme",
  ],
  methods: {
    saveBaseUrl() {
      this.$emit("saveBaseUrl");
    },
    toggleTheme() {
      this.$emit("toggleTheme");
    },
  },
};
</script>

<style scoped>
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

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.config-input {
  flex: 1;
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

.save-btn {
  padding: 8px 16px;
  background-color: #4caf50;
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
  background: #4caf50;
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
  border-color: #4caf50;
}

.preview-mode-control {
  display: flex;
  gap: 8px;
}

.mode-btn {
  flex: 1;
  padding: 8px 16px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  background-color: #e0e0e0;
}

.mode-btn.active {
  background-color: #4caf50;
  color: white;
}

.mode-btn.active:hover {
  background-color: #45a049;
}

/* 暗色主题支持 */
:deep(.jse-theme-dark) {
  .mode-btn {
    background-color: #2d2d2d;
    color: #d4d4d4;
  }

  .mode-btn:hover {
    background-color: #383838;
  }

  .mode-btn.active {
    background-color: #4caf50;
    color: white;
  }

  .mode-btn.active:hover {
    background-color: #45a049;
  }
}
</style>
