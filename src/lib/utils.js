import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function valueUpdater(updaterOrValue, ref) {
    ref.value =
        typeof updaterOrValue === 'function' ?
        updaterOrValue(ref.value) :
        updaterOrValue;
}

export function copyToClipboard(text) {
    var input = document.createElement("input"); // 创建input对象
    input.value = text // 设置复制内容
    document.body.appendChild(input); // 添加临时实例
    input.select(); // 选择实例内容
    document.execCommand("Copy"); // 执行复制
    document.body.removeChild(input); // 删除临时实例
}