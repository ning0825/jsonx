<template>
  <!-- 弹窗预览 -->
  <div
    v-if="previewMode === 'popup'"
    v-show="isShowPreview"
    class="image-preview-popup"
    :style="previewStyle"
  >
    <template v-if="!loadError">
      <img
      :src="previewImageUrl"
      :alt="previewImageUrl"
      @error="handleImageError"
      class="preview-image"
      />
      <div v-if="imageInfo" class="info-size" style="text-align: end;">
        {{ imageInfo.width }}×{{ imageInfo.height }}
      </div>
    </template>
    <div v-else style="display: flex; flex-direction: column; align-items: center; padding: 20px;">
      <div>
        <BreakImageIcon />
      </div>
      <div style="height: 20px;"></div>
      <div style="color: #333;">
        Image load failed, set <bold>Image Base URL</bold> in config panel and try again.
      </div>
    </div>
  </div>
  <!-- 侧边栏预览 -->
  <div
    class="image-preview-sidebar"
    :class="{
      show: (previewMode == 'sidebar' && isShowPreview) || isFullscreen,
      fullscreen: isFullscreen,
    }"
  >
    <!-- 图片容器 -->
    <div
      class="preview-container"
      :class="previewSize"
      @wheel.prevent="handleWheel"
    > 
      <div v-if="loadError" style="display: flex; flex-direction: column; align-items: center; padding: 20px;">
        <div>
          <BreakImageIcon />
        </div>
        <div style="height: 20px;"></div>
        <div style="color: #333;">
          Image load failed, set <bold>Image Base URL</bold> in config panel and try again.
        </div>
      </div>
      <div
        v-if="!loadError"
        class="image-wrapper"
        :style="{
          transform: isFullscreen
            ? `translate(${translateX}px, ${translateY}px)`
            : 'translate(0, 0)',
          cursor: isFullscreen ? (isDragging ? 'grabbing' : 'grab') : 'default',
        }"
        @dblclick="resetTransform"
      >
        <img
          v-if="previewImageUrl"
          :src="previewImageUrl"
          :alt="previewImageUrl"
          @error="handleImageError"
          @load="handleImageLoad"
          class="preview-image"
          ref="previewImage"
          @mousedown.prevent="startDrag"
          :style="{
            transform: `scale(${scale})`,
          }"
        />
      </div>
    </div>
    <!-- 添加预览头部 -->
    <div class="preview-header" :class="{
      'fullscreen-header': isFullscreen,
    }" v-if="!loadError">
      <!-- 添加图片信息 -->
      <div class="preview-info" v-if="imageInfo">
        <span class="info-size"
          >{{ imageInfo.width }}×{{ imageInfo.height }}</span
        >
        <span class="info-type">{{ imageInfo.type }}</span>
      </div>
      <div class="preview-actions">
        <div class="preview-btn" @click="toggleFullscreen" title="全屏预览">
          <span class="fullscreen-icon">{{ isFullscreen ? "⤢" : "⛶" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Loader } from "lucide-vue-next";
import { onMounted, onBeforeUnmount, getCurrentInstance, ref, computed } from "vue";
import BreakImageIcon from "@/components/icons/BreakImageIcon.vue";

const { proxy } = getCurrentInstance();
var isShowPreview = ref(false);
var imageInfo = ref(null);
var previewImageUrl = ref("");
var previewImage = ref(null);
var previewSize = ref("fit");
var scale = ref(1);
var translateX = ref(0);
var translateY = ref(0);
var isDragging = ref(false);
var dragStartX = ref(0);
var dragStartY = ref(0);
var isFullscreen = ref(false);
var previewStyle = ref({});
var loadError = ref(false)

const previewMode = computed(() => store.state.previewMode);

onMounted(() => {
  proxy.emitter.on("showPreview", showPreview);
  proxy.emitter.on("hidePreview", hidePreview);
  proxy.emitter.on("hidePopupPreview", hidePopupPreview);

  // 添加全局鼠标事件监听
  window.addEventListener("mousemove", handleDrag);
  window.addEventListener("mouseup", stopDrag);
});

onBeforeUnmount(() => {
  // 清理事件监听器
  window.removeEventListener("mousemove", handleDrag);
  window.removeEventListener("mouseup", stopDrag);
});

import { useStore } from 'vuex';
const store = useStore();
const baseImageUrl = computed(() => store.state.baseImageUrl);

const showPreview = (obj) => {
  loadError.value = false
  imageInfo.value = null
  let {url, event} = obj;
  if (!url.match(/^https?:\/\//)) {
    if (baseImageUrl.value) {
      const baseUrl = baseImageUrl.value.endsWith("/")
        ? baseImageUrl.value
        : `${baseImageUrl.value}/`;
      const imageUrl = url.startsWith("/") ? url.slice(1) : url;
      url = baseUrl + imageUrl;
    }
  }
  previewImageUrl.value = url;
  isShowPreview.value = true;
  resetTransform();

  if (previewMode.value === "popup" && event) {
    let rect = event.target.getBoundingClientRect()
    previewStyle.value = {
      left: `${rect.right}px`,
      top: `${rect.top}px`,
    };
  }
};

const hidePreview = () => {
  isShowPreview.value = false;
};

const hidePopupPreview = () => {
  if (previewMode.value === 'popup') {
    isShowPreview.value = false;
  }
};

const resetTransform = () => {
  // 重置缩放和位置状态
  scale.value = 1;
  translateX.value = 0;
  translateY.value = 0;
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const handleWheel = (event) => {
  if (!isFullscreen.value) return;

  const delta = event.deltaY > 0 ? -0.1 : 0.1;
  const newScale = Math.max(0.1, Math.min(5, scale.value + delta));
  scale.value = newScale;
};

const startDrag = (event) => {
  if (!isFullscreen.value) return;

  isDragging.value = true;
  dragStartX.value = event.clientX - translateX.value;
  dragStartY.value = event.clientY - translateY.value;
};

const handleDrag = (event) => {
  if (isDragging.value) {
    translateX.value = event.clientX - dragStartX.value;
    translateY.value = event.clientY - dragStartY.value;
  }
};

const stopDrag = () => {
  isDragging.value = false;
};

const handleImageLoad = (event) => {
  const img = event.target;
  imageInfo.value = {
    width: img.naturalWidth,
    height: img.naturalHeight,
    type: getImageType(previewImageUrl.value),
  };
  resetTransform();
};

const getImageType = (url) => {
  if (url.startsWith("data:image/")) {
    return url.split(";")[0].split("/")[1].toUpperCase();
  }
  const ext = url.split(".").pop().toLowerCase();
  return ext.toUpperCase();
};

const handleImageError = () => {
  loadError.value = true
  console.error("Image load failed:", previewImageUrl.value);
};
</script>

<style scoped>
/* 修改侧边栏预览样式，与 VueJSONEditor 保持一致 */
.image-preview-sidebar {
  position: fixed;
  right: -400px;
  top: 16px;
  bottom: 16px;
  height: auto;
  width: 400px;
  background: rgba(240, 240, 240, 0.8); /* 修改为半透明黑色 */
  padding: 0;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.082);
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  border-radius: 10px;
  overflow: hidden;
}

.image-preview-sidebar.show {
  right: 16px;
}

.image-wrapper {
  position: relative;
  will-change: transform;
}

.preview-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  will-change: transform;
  transform-origin: center;
  transition: transform 0.05s ease-out;
}

.preview-header {
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  bottom: 0;
  width: 100%;
  background: rgba(219, 219, 219, 0.5);
  z-index: 2;
  transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.preview-header.fullscreen-header {
  padding: 12px 32px 32px 16px;
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
  border: 1px solid #949494;
  border-radius: 4px;
  color: #000000;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.preview-btn:hover {
  background: #bebebe;
}

.preview-btn:active {
  background: #bdbdbd;
}

.fullscreen-icon {
  font-size: 14px;
}

.image-preview-sidebar.fullscreen {
  width: 100vw;
  top: 0px;
  right: 0px;
  bottom: 0px;
}

.preview-info {
  font-size: 12px;
  display: flex;
}

.preview-container {
  flex: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-size {
  color: #999;
  cursor: default;
}

.info-type {
  margin-left: 4px;
  border-radius: 4px;
  background-color: #838383;
  padding: 0 6px;
  color: rgb(228, 228, 228);
  display: inline-flex;
  align-items: center;
  height: 16px;
  font-size: 11px;
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
  width: 300px;
}
</style>
