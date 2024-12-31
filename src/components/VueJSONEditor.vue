<template>
    <div className="vue-jsoneditor" ref="editor"></div>
</template>

<script>
import { createJSONEditor } from 'vanilla-jsoneditor';

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
            },
        });

        // 添加点击事件监听
        this.$refs.editor.addEventListener('click', this.handleClick);
    },
    updated() {
        // const updatedProps = filterProps(this, this.prevProps);
        // this.prevProps = updatedProps;
        const myRendererAction = {
            action: (node) => {
                // attach something to the HTML DOM node
                return {
                    update: (node) => {
                        // update the DOM
                        return node;
                    },
                    destroy: () => {
                        // cleanup the DOM
                    }
                }
            }
        }
        console.log('updated => ', this);
        console.log('updated => ', Object.keys(this));
        console.log('updated => ', this.content);
        console.log('updated => ', this.readOnly);
        console.log('updated => ', this.mainMenuBar);
        console.log('updated => ', this.navigationBar);
        this.editor.updateProps({
            content: this.content,
            readOnly: this.readOnly,
            mainMenuBar: this.mainMenuBar,
            navigationBar: this.navigationBar,
            onRenderValue: (p) => [myRendererAction]
            // onRenderValue: (params) => [{
            //     action: (node) => {
            //         return {
            //             update: (node) => {
            //                 // update the DOM
            //                 return '<div>123</div>';
            //             },
            //             destroy: () => {
            //                 // cleanup the DOM
            //             }
            //         }
            //     },
            //     props: {
            //         style: 'color: blue; font-weight: bold;',
            //         innerHTML: 'Custom Render'
            //     }
            // }]
        });
    },
    beforeUnmount() {
        // 移除事件监听
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
        handleClick(event) {
            const target = event.target.closest('.jse-key, .jse-value');
            if (target) {
                const text = target.textContent.trim();
                navigator.clipboard.writeText(text).then(() => {
                    // 创建提示元素
                    const tooltip = document.createElement('div');
                    tooltip.textContent = 'copied!';
                    tooltip.className = 'copy-tooltip';

                    // 设置提示元素的位置
                    const rect = target.getBoundingClientRect();
                    tooltip.style.position = 'fixed';
                    tooltip.style.left = `${rect.right}px`;
                    tooltip.style.top = `${rect.top}px`;

                    // 添加到文档中
                    document.body.appendChild(tooltip);

                    // 200ms 后移除提示
                    setTimeout(() => {
                        document.body.removeChild(tooltip);
                    }, 350);
                });
            }
        }
    }
}
</script>

<style>
.vue-jsoneditor {
    height: 100%;
    border-radius: 20px;
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
</style>