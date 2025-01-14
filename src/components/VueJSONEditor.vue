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
            prevProps: {}
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
        async handleMouseOver(event) {
            const target = event.target.closest('.jse-value');
            if (target) {
                const text = target.textContent.trim();
                if (text.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                    var wh = await this.getImageSize(text);
                    let preview = document.querySelector('.image-preview');
                    let imgInfo = document.querySelector('.image-info');
                    let imgSuf = text.split('.').pop().toUpperCase();
                    const content = document.querySelector('.content');

                    if (!preview) {
                        preview = document.createElement('div');
                        preview.className = 'image-preview';
                        preview.innerHTML = `<img src="${text}" alt="preview">`;
                        imgInfo = document.createElement('div');
                        imgInfo.className = 'image-info';
                        imgInfo.innerHTML = `<span>${wh.width} x ${wh.height}</span><span class="image-suffix">${imgSuf}</span>`;
                        preview.appendChild(imgInfo);
                        content.appendChild(preview);

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
                        imgInfo.innerHTML = `<span>${wh.width} x ${wh.height}</span><span class="image-suffix">${imgSuf}</span>`;
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
    transition: transform 0.3s ease;
}

.image-preview.show {
    transform: translateX(0);
}

.content {
    transition: padding-right 0.3s ease;
}

/* .content.with-preview {
    padding-right: 300px;
} */

.image-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.image-info {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    background-image: linear-gradient(to top, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0));
    color: #fff;
    padding: 8px;
    font-size: 12px;
}

.image-suffix {
    margin-left: 4px;
    border-radius: 100px;
    background-color: #49484e;
    padding: 0 6px;
    color: #f8f8f8;
    display: inline-flex;
    align-items: center;
    height: 16px;
    font-size: 11px;
}
</style>