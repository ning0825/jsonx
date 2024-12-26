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
        // const props = filterProps(this, {});
        // this.prevProps = props;
        console.log('mounted => ', this);
        this.editor = createJSONEditor({
            target: this.$refs['editor'],
            props: this,
        });
    },
    updated() {
        // const updatedProps = filterProps(this, this.prevProps);
        // this.prevProps = updatedProps;
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
        });
    },
    beforeUnmount() {
        this.editor.destroy();
        this.editor = null;
    }
}
</script>

<style scoped>
.vue-jsoneditor {
    height: 100%;
    border-radius: 20px;
}
</style>