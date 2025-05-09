<template>
  <div class="config-panel" :class="{ show: isConfigOpen }">
    <Transition name="slide-up">
      <div class="config-content">
        <h1 style="color: #fff; font-size: 16px; font-weight: 600;">Settings</h1>
        <div class="config-item">
          <label class="config-label">Image Base URL</label>
          <div class="input-with-button">
            <div class="input-wrapper">
              <input
                type="text"
                class="config-input"
                v-model="baseImageUrl"
                placeholder="https://..."
              />
              <button 
                v-if="baseImageUrl" 
                class="clear-btn" 
                @click.stop="baseImageUrl = ''" 
                title="清除"
              >
                ×
              </button>
            </div>
          </div>
          <div style="color: #eee; font-size: 12px; padding: 4px 8px">
            If the image field doesn't start with http/https, the URL
            will be prepended to preview the image.
          </div>
        </div>
        <div class="config-item">
          <label class="config-label">
            Font Size
          </label>
          <div class="font-size-control">
            <input
              type="range"
              class="size-slider"
              v-model="fontSize"
              min="12"
              max="60"
              step="1"
            />
            <div class="size-input-group">
              <input
                type="number"
                class="size-input"
                v-model="fontSize"
                min="12"
                max="50"
              />
              <button
                class="reset-btn"
                @click="fontSize = 16"
                title="重置为默认值"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="config-item">
          <label class="config-label">Image Preview Mode</label>
          <div class="preview-mode-control">
            <button
              class="mode-btn"
              :class="{ active: previewMode === 'popup' }"
              @click="previewMode = 'popup'"
            >
              Popup Preview
            </button>
            <button
              class="mode-btn"
              :class="{ active: previewMode === 'sidebar' }"
              @click="previewMode = 'sidebar'"
            >
              Sidebar Preview
            </button>
          </div>
        </div>
        <div class="config-item">
          <label class="config-label">Code Theme</label>
          <button class="theme-toggle-btn" @click="toggleTheme">
            Switch Theme
          </button>
        </div>
      </div>
    </Transition>
    <transition name="fade">
      <div class="how-to-close-prompt" v-if="shouldShowClosePrompt">
        Click outside to hide the panel.
        <button class="close-btn" @click="gotItClick">Got It</button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from 'vuex';

const store = useStore();

// 使用 Vuex 状态
const isConfigOpen = computed(() => store.state.isConfigOpen);
const baseImageUrl = computed({
  get: () => store.state.baseImageUrl,
  set: (value) => store.commit('setBaseImageUrl', value)
});
const fontSize = computed({
  get: () => store.state.fontSize,
  set: (value) => store.commit('setFontSize', value)
});
const previewMode = computed({
  get: () => store.state.previewMode,
  set: (value) => store.commit('setPreviewMode', value)
});
const shouldShowClosePrompt = computed(() => store.state.shouldShowClosePrompt);

const toggleTheme = () => {
  store.commit('toggleTheme');
};

const gotItClick = (e) => {
  store.commit('setClosePrompt', false);
  e.stopPropagation();
  e.preventDefault();
};
</script>

<style scoped>
.config-panel {
  position: fixed;
  right: 16px;
  top: 16px;
  bottom: 16px;
  height: auto;
  width: 400px;
  background: rgb(22 22 22 / 64%);
  overflow: hidden;
  z-index: 1000;
  transform: translateX(110%);
  transition: transform 0.3s ease;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 6px;
}

.config-panel.show {
  transform: translateX(0);
}

.config-content {
  padding: 20px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.9s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.config-item {
  padding: 20px 0;
}

.config-item + .config-item {
  border-top: 1px solid #ececec3b;
}

.config-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #ffffff;
  font-weight: 500;
  font-weight: bold;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1px solid #e0e0e0;
  background-color: white;
  border-radius: 4px;
  flex: 1;
}

.input-with-button {
  display: flex;
  gap: 8px;
  align-items: center;
}

.config-input {
  padding: 8px 12px;
  font-size: 14px;
  flex: 1;
  transition: border-color 0.2s;
}

.clear-btn {
  padding: 0 8px;
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

.size-input-group {
  display: flex;
  align-items: center;
  gap: 4px;
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

.reset-btn {
  padding: 4px;
  background: none;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  transition: all 0.2s;
}

.reset-btn:hover {
  background-color: #f5f5f5;
  color: #333;
  border-color: #ccc;
}

.reset-btn:active {
  background-color: #e0e0e0;
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

.how-to-close-prompt {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #2d2d2d;
  color: #f5f5f5;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}

.close-btn {
  background-color: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
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

  .reset-btn {
    border-color: #404040;
    color: #999;
  }

  .reset-btn:hover {
    background-color: #383838;
    color: #d4d4d4;
    border-color: #505050;
  }

  .reset-btn:active {
    background-color: #2d2d2d;
  }
}

/* 添加淡入淡出的过渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
