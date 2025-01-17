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
    props: {
        content: Object,
        readOnly: Boolean,
        mainMenuBar: Boolean,
        navigationBar: Boolean,
        baseImageUrl: String,
    },
    data() {
        return {
            editor: null,
            prevProps: {},
            isActualSize: false,
            isFullscreen: false,
            preImgUrl: '',
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

        getFullImageUrl(url) {
            // 如果 url 已经是完整的 URL（以 http:// 或 https:// 开头），则直接返回
            if (url.match(/^https?:\/\//)) {
                return url;
            }

            // 如果设置了 baseUrl，则拼接
            if (this.baseImageUrl) {
                const baseUrl = this.baseImageUrl.endsWith('/') ? this.baseImageUrl : `${this.baseImageUrl}/`;
                const imageUrl = url.startsWith('/') ? url.slice(1) : url;
                return baseUrl + imageUrl;
            }

            return url;
        },

        needsBaseUrl(url) {
            // 检查是否是完整URL
            return !url.match(/^https?:\/\//) && !this.baseImageUrl;
        },

        async handleMouseOver(event) {
            const target = event.target.closest('.jse-value');
            if (target) {
                const text = target.textContent.trim();
                if (this.isImageUrl(text)) {
                    // 检查是否需要 baseUrl
                    if (this.needsBaseUrl(text)) {
                        // 创建提示元素
                        const tooltip = document.createElement('div');
                        tooltip.textContent = '请设置 Base URL';
                        tooltip.className = 'base-url-tooltip';

                        // 设置提示位置
                        const rect = target.getBoundingClientRect();
                        tooltip.style.position = 'fixed';
                        tooltip.style.left = `${rect.right + 10}px`;
                        tooltip.style.top = `${rect.top}px`;

                        // 添加到文档中
                        document.body.appendChild(tooltip);

                        // 触发打开配置面板的事件
                        this.$emit('openConfig');

                        // 200ms 后移除提示
                        setTimeout(() => {
                            document.body.removeChild(tooltip);
                        }, 2000);

                        return; // 不显示预览
                    }

                    this.preImgUrl = text;
                    let preview = document.querySelector('.image-preview');
                    let imgInfo = document.querySelector('.image-info');
                    let imgSuf = this.getImageFormat(text);
                    const content = document.querySelector('.content');

                    if (!preview) {
                        var wh = await this.getImageSize(this.getFullImageUrl(text));
                        preview = document.createElement('div');
                        preview.className = 'image-preview';
                        const img = document.createElement('img');
                        img.src = this.getFullImageUrl(text);
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
                            this.toggleSize();
                        });
                    } else if (preview && this.preImgUrl != text) {
                        var wh = await this.getImageSize(this.getFullImageUrl(text));
                        const img = preview.querySelector('img');
                        img.src = this.getFullImageUrl(text);
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
            btn.textContent = this.isActualSize ? '显示为匹配空间' : '显示为实际大小';

            if (this.isActualSize) {
                // 获取图片的自然尺寸
                const naturalWidth = img.naturalWidth;
                const naturalHeight = img.naturalHeight;

                // 设置具体的高度值而不是 auto
                img.style.width = `${naturalWidth}px`;
                img.style.height = `${naturalHeight}px`;
            } else {
                // 获取容器尺寸
                const container = preview;
                const containerWidth = container.clientWidth;
                const containerHeight = container.clientHeight;

                // 计算适应容器的尺寸，保持宽高比
                const imgRatio = img.naturalWidth / img.naturalHeight;
                const containerRatio = containerWidth / containerHeight;

                let width, height;
                if (imgRatio > containerRatio) {
                    width = containerWidth;
                    height = containerWidth / imgRatio;
                } else {
                    height = containerHeight;
                    width = containerHeight * imgRatio;
                }

                img.style.width = `${width}px`;
                img.style.height = `${height}px`;
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
    transition: width 0.5s ease, height 0.5s ease;
    object-fit: contain;
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

.base-url-tooltip {
    background-color: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-5px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>