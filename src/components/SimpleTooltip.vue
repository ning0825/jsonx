<template>
  <TooltipProvider>
    <Tooltip :defaultOpen="defaultOpen" :open="isOpen" :delay-duration="delay" @update:open="updateOpen">
      <TooltipTrigger asChild>
        <div>
          <slot />
        </div>
      </TooltipTrigger>
      <TooltipContent 
        :class="tooltipClass"
        :side="side"
        :side-offset="sideOffset"
        :align="align">
        {{ content }}
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

const props = defineProps({
  // 提示内容
  content: {
    type: String,
    required: true
  },
  // 是否默认显示
  defaultOpen: {
    type: Boolean,
    default: false
  },
  // 控制开关状态
  open: {
    type: Boolean,
    default: undefined
  },
  // 延迟显示时间(ms)
  delay: {
    type: Number,
    default: 500
  },
  // 显示位置：top, right, bottom, left
  side: {
    type: String,
    default: 'top'
  },
  // 偏移距离
  sideOffset: {
    type: Number,
    default: 12
  },
  // 对齐方式：center, start, end
  align: {
    type: String,
    default: 'center'
  },
  // 自定义样式类
  tooltipClass: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['update:open']);

// 内部状态
const isOpen = ref(props.open);

// 监听外部 open 变化
watch(() => props.open, (newValue) => {
  if (newValue !== undefined) {
    isOpen.value = newValue;
  }
});

// 更新状态并触发事件
function updateOpen(value) {
  isOpen.value = value;
  emits('update:open', value);
}
</script>

<style scoped>
/* 可以在此处添加额外的样式 */
</style> 