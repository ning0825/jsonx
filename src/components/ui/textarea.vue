<script setup lang="ts">
import { cn } from "@/lib/utils"
import { computed } from "vue"

const props = defineProps<{
    modelValue?: string
    class?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const value = computed({
    get() {
        return props.modelValue
    },
    set(value) {
        emit('update:modelValue', value)
    }
})
</script>

<template>
    <textarea :class="cn(
        'flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
    )" :value="value" @input="value = ($event.target as HTMLTextAreaElement).value" />
</template>