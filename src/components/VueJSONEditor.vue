<template>
    <div className="vue-jsoneditor" ref="editor"></div>
</template>

<script>
import { createJSONEditor, ColorPicker } from 'vanilla-jsoneditor';

// JSONEditor properties as of version 2.3.1
// const supportedPropNames = [
//     'content',
//     'selection',
//     'readOnly',
//     'indentation',
//     'tabSize',
//     'mode',
//     'mainMenuBar',
//     'navigationBar',
//     'statusBar',
//     'askToFormat',
//     'escapeControlCharacters',
//     'escapeUnicodeCharacters',
//     'flattenColumns',
//     'parser',
//     'validator',
//     'validationParser',
//     'pathParser',
//     'queryLanguages',
//     'queryLanguageId',
//     'onChangeQueryLanguage',
//     'onChange',
//     'onRenderValue',
//     'onClassName',
//     'onRenderMenu',
//     'onRenderContextMenu',
//     'onChangeMode',
//     'onSelect',
//     'onError',
//     'onFocus',
//     'onBlur',
// ];

// const supportedPropNamesSet = new Set(supportedPropNames);

// function filterProps(props, prevProps) {
//     return Object.fromEntries(
//         Object.entries(props)
//             .filter(([key, value]) => supportedPropNamesSet.has(key))
//             .filter(([key, value]) => value !== prevProps[key])
//     );
// }

export default {
    name: 'VueJSONEditor',
    props: [
        'content',
        'readOnly',
        'mainMenuBar',
        'navigationBar',
    ],
    data() {
        return {
            editor: null,
            prevProps: {},
            isActualSize: false,
            isFullscreen: false
        }
    },
    mounted() {
        this.editor = createJSONEditor({
            target: this.$refs['editor'],
            props: {
                content: this.content,
                readOnly: this.readOnly,
                mainMenuBar: this.mainMenuBar,
                navigationBar: this.navigationBar,
                // onRenderValue: (props) => {
                //     const value = props.value;
                //     const type = Array.isArray(value) ? 'array' : typeof value;
                //     return [{
                //         component: ColorPicker,
                //         props: {
                //             ...props,
                //             value: `${props.value} [${type}]`
                //         }
                //     }]
                // }
            },
        });

        // 添加鼠标悬浮事件监听
        this.$refs.editor.addEventListener('mouseenter', this.handleMouseOver, true);
        document.addEventListener('click', this.handleMouseOut, true);
        // this.$refs.editor.addEventListener('mouseleave', this.handleMouseOut, true);
        // 保留点击事件用于复制功能
        this.$refs.editor.addEventListener('click', this.handleClick);
    },
    updated() {
        this.editor.updateProps({
            content: this.content,
            readOnly: this.readOnly,
            mainMenuBar: this.mainMenuBar,
            navigationBar: this.navigationBar,
            // onRenderValue: (props) => {
            //     const value = props.value;
            //     const type = Array.isArray(value) ? 'array' : typeof value;
            //     console.log(props)
            //     return [{
            //         component: ColorPicker,
            //         props: {
            //             ...props,
            //             value: `${props.value} [${type}]`
            //         }
            //     }]
            // }
        });
    },
    beforeUnmount() {

        this.$refs.editor.removeEventListener('mouseenter', this.handleMouseOver, true);
        document.removeEventListener('click', this.handleMouseOut, true);
        this.$refs.editor.removeEventListener('click', this.handleClick);
        this.editor.destroy();
        this.editor = null;
    },
    watch: {
        content: {
            handler(newValue) {
                if (this.editor) {
                    this.editor.updateProps({ content: newValue });
                }
            },
            immediate: true
        }
    },
    methods: {
        isImageUrl(url) {
            // 检查是否是图片文件扩展名
            if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) {
                return true;
            }

            try {
                const urlObj = new URL(url);

                // 检查查询参数中的图片相关标识
                const params = urlObj.searchParams;
                if (params.has('format') || params.has('auto')) {
                    return true;
                }

                // 检查路径中的图片相关标识
                const pathIndicators = [
                    '/images/',
                    '/image/',
                    '/img/',
                    '/photos/',
                    '/assets/'
                ];

                return pathIndicators.some(indicator =>
                    urlObj.pathname.toLowerCase().includes(indicator)
                );
            } catch {
                return false;
            }
        },

        getImageFormat(url) {
            // 先尝试从URL路径中获取格式
            const extensionMatch = url.match(/\.([a-zA-Z]+)(?:\?|$)/);
            if (extensionMatch) {
                return extensionMatch[1].toUpperCase();
            }

            // 再尝试从查询参数中获取格式
            try {
                const urlObj = new URL(url);
                const format = urlObj.searchParams.get('format');
                if (format) {
                    return format.toUpperCase();
                }

                // 检查auto参数
                const auto = urlObj.searchParams.get('auto');
                if (auto) {
                    return auto.toUpperCase();
                }
            } catch (e) {
                console.error('URL parsing failed:', e);
            }

            return 'IMG'; // 默认返回通用格式标识
        },

        async handleMouseOver(event) {
            const target = event.target.closest('.jse-value');
            if (target) {
                const text = target.textContent.trim();
                if (this.isImageUrl(text)) {
                    var wh = await this.getImageSize(text);
                    let preview = document.querySelector('.image-preview');
                    let imgInfo = document.querySelector('.image-info');
                    // 使用新的格式获取方法
                    let imgSuf = this.getImageFormat(text);
                    const content = document.querySelector('.content');

                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'image-preview';
                        const img = document.createElement('img');
                        img.src = text;
                        img.style.setProperty('--natural-width', `${wh.width}px`);
                        img.style.setProperty('--natural-height', `${wh.height}px`);
                        preview.appendChild(img);
                        imgInfo = document.createElement('div');
                        imgInfo.className = 'image-info';
                        imgInfo.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center;">
                                    <span>${wh.width} x ${wh.height}</span>
                                    <span class="image-suffix">${imgSuf}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="size-toggle-btn" onclick="this.closest('.image-preview').__vue__?.toggleSize()">
                                        ${this.isActualSize ? '显示为匹配空间' : '显示为实际大小'}
                                    </button>
                                    <button class="size-toggle-btn fullscreen-btn" onclick="this.closest('.image-preview').__vue__?.toggleFullscreen()">
                                        全屏查看
                                    </button>
                                </div>
                            </div>
                        `;
                        preview.appendChild(imgInfo);
                        content.appendChild(preview);

                        // 将所有需要的方法绑定到 preview.__vue__ 上
                        preview.__vue__ = {
                            toggleSize: this.toggleSize.bind(this),
                            toggleFullscreen: this.toggleFullscreen.bind(this)
                        };

                        // 强制重绘
                        preview.offsetHeight;

                        // 添加显示类
                        requestAnimationFrame(() => {
                            preview.classList.add('show');
                            content.classList.add('with-preview');
                        });
                    } else {
                        const img = preview.querySelector('img');
                        img.src = text;
                        imgInfo = preview.querySelector('.image-info');
                        imgInfo.innerHTML = `
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center;">
                                    <span>${wh.width} x ${wh.height}</span>
                                    <span class="image-suffix">${imgSuf}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <button class="size-toggle-btn" onclick="this.closest('.image-preview').__vue__?.toggleSize()">
                                        ${this.isActualSize ? '显示为匹配空间' : '显示为实际大小'}
                                    </button>
                                    <button class="size-toggle-btn fullscreen-btn" onclick="this.closest('.image-preview').__vue__?.toggleFullscreen()">
                                        全屏查看
                                    </button>
                                </div>
                            </div>
                        `;
                        img.style.setProperty('--natural-width', `${wh.width}px`);
                        img.style.setProperty('--natural-height', `${wh.height}px`);
                    }
                }
            }
        },

        handleMouseOut(event) {
            if (!event.target?.closest('.jse-value') &&
                !event.target?.closest('.image-preview')) {
                const preview = document.querySelector('.image-preview');
                const content = document.querySelector('.content');

                if (preview) {
                    // 先添加过渡效果
                    preview.classList.remove('show');
                    content.classList.remove('with-preview');

                    // 等待过渡完成后移除元素
                    preview.addEventListener('transitionend', () => {
                        preview.remove();
                    }, { once: true });
                }
            }
        },

        handleClick(event) {
            const target = event.target.closest('.jse-key, .jse-value');
            if (target) {
                const text = target.textContent.trim();
                // 只保留复制功能
                navigator.clipboard.writeText(text).then(() => {
                    const tooltip = document.createElement('div');
                    tooltip.textContent = 'copied!';
                    tooltip.className = 'copy-tooltip';
                    const rect = target.getBoundingClientRect();
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = `${rect.right}px`;
                    tooltip.style.top = `${rect.top}px`;
                    document.body.appendChild(tooltip);
                    setTimeout(() => {
                        document.body.removeChild(tooltip);
                    }, 350);
                });
            }
        },

        getTypeIcon(value) {
            if (Array.isArray(value)) return '📑'; // 数组
            switch (typeof value) {
                case 'string': return '📝'; // 字符串
                case 'number': return '🔢'; // 数字
                case 'boolean': return '⭕'; // 布尔值
                case 'object': return value === null ? '❌' : '📦'; // null或对象
                default: return '❓'; // 其他类型
            }
        },

        getImageSize(url) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = function () {
                    resolve({
                        width: this.width,
                        height: this.height
                    });
                };
                img.onerror = reject;
                img.src = url;
            });
        },

        toggleSize() {
            this.isActualSize = !this.isActualSize;
            const preview = document.querySelector('.image-preview');
            const img = preview.querySelector('img');
            const btn = preview.querySelector('.size-toggle-btn');

            if (this.isActualSize) {
                img.classList.add('actual-size');
                btn.textContent = '显示为匹配空间';
            } else {
                img.classList.remove('actual-size');
                btn.textContent = '显示为实际大小';
            }
        },

        toggleFullscreen() {
            this.isFullscreen = !this.isFullscreen;
            const preview = document.querySelector('.image-preview');
            const btn = preview.querySelector('.fullscreen-btn');

            if (this.isFullscreen) {
                preview.classList.add('fullscreen');
                btn.textContent = '退出全屏';
            } else {
                preview.classList.remove('fullscreen');
                btn.textContent = '全屏查看';
            }
        }
    }
}
</script>

<style>
.vue-jsoneditor {
    height: 100%;
    background-color: rgba(250, 250, 250, 0.8);
}

.json-type {
    color: #666;
    font-size: 0.85em;
    padding: 0 4px;
    border-radius: 3px;
    background-color: #f0f0f0;
    margin-right: 4px;
}

.copy-tooltip {
    background-color: #000000bd;
    color: #fff;
    padding: 2px 6px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
}

.image-preview {
    position: fixed;
    right: 0;
    top: 0;
    height: 100vh;
    width: 400px;
    background: rgba(0, 0, 0, 0.8);
    overflow: hidden;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease, width 0.3s ease;
}

.image-preview.show {
    transform: translateX(0);
}

.image-preview.fullscreen {
    width: 100vw;
}

.content {
    transition: padding-right 0.3s ease;
}

/* .content.with-preview {
    padding-right: 300px;
} */

.image-preview img {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    transition: width .5s ease, height .5s ease;
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.image-preview img.actual-size {
    width: var(--natural-width, auto) !important;
    height: var(--natural-height, auto) !important;
}

.image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
    color: #BDBDBDFF;
    padding: 8px 16px;
    font-size: 12px;
}

.image-suffix {
    margin-left: 4px;
    border-radius: 100px;
    background-color: #49484e;
    padding: 0 6px;
    color: #CCCCCCFF;
    display: inline-flex;
    align-items: center;
    height: 16px;
    font-size: 11px;
}

.size-toggle-btn {
    margin-left: 8px;
    padding: 2px 8px;
    border-radius: 100px;
    background-color: #49484e;
    border: none;
    color: #CCCCCCFF;
    cursor: pointer;
    font-size: 11px;
    height: 16px;
    display: inline-flex;
    align-items: center;
    transition: background-color 0.2s;
}

.size-toggle-btn:hover {
    background-color: #5a5962;
}
</style>