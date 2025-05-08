import { createStore } from 'vuex'

export default createStore({
  state: {
    // 配置面板状态
    isConfigOpen: false,
    // 图片基础URL
    baseImageUrl: localStorage.getItem('baseImageUrl') || '',
    // 编辑器字体大小
    fontSize: parseInt(localStorage.getItem('editor-font-size')) || 14,
    // 预览模式
    previewMode: localStorage.getItem('preview-mode') || 'popup',
    // 主题模式
    isDarkTheme: localStorage.getItem('is-dark-theme') === 'true',
    // 是否显示关闭提示
    shouldShowClosePrompt: localStorage.getItem('closePrompt') !== 'true'
  },
  
  mutations: {
    // 切换配置面板显示状态
    toggleConfig(state) {
      state.isConfigOpen = !state.isConfigOpen
    },
    
    // 设置配置面板显示状态
    setConfigOpen(state, value) {
      state.isConfigOpen = value
    },
    
    // 更新基础图片URL
    setBaseImageUrl(state, url) {
      state.baseImageUrl = url
      localStorage.setItem('baseImageUrl', url)
    },
    
    // 更新字体大小
    setFontSize(state, size) {
      state.fontSize = size
      localStorage.setItem('editor-font-size', size)
    },
    
    // 更新预览模式
    setPreviewMode(state, mode) {
      state.previewMode = mode
      localStorage.setItem('preview-mode', mode)
    },
    
    // 切换主题
    toggleTheme(state) {
      state.isDarkTheme = !state.isDarkTheme
      localStorage.setItem('is-dark-theme', state.isDarkTheme)
    },
    
    // 设置关闭提示状态
    setClosePrompt(state, value) {
      state.shouldShowClosePrompt = value
      localStorage.setItem('closePrompt', value)
    }
  },
  
  actions: {
    // 保存基础图片URL
    saveBaseUrl({ commit }, url) {
      commit('setBaseImageUrl', url)
    },
    
    // 重置字体大小
    resetFontSize({ commit }) {
      commit('setFontSize', 14)
    },
    
    // 初始化配置
    initConfig({ state }) {
      // 应用主题
      const editorContainer = document.querySelector('.my-editor')
      if (editorContainer) {
        if (state.isDarkTheme) {
          editorContainer.classList.add('jse-theme-dark')
          document.documentElement.style.setProperty('--jse-theme-color', '#383e42')
          document.documentElement.style.setProperty('--jse-theme-color-highlight', '#687177')
        } else {
          editorContainer.classList.remove('jse-theme-dark')
          document.documentElement.style.removeProperty('--jse-theme-color')
          document.documentElement.style.removeProperty('--jse-theme-color-highlight')
        }
      }
    }
  },
  
  getters: {
    // 获取当前主题状态
    isDarkTheme: state => state.isDarkTheme,
    
    // 获取当前预览模式
    currentPreviewMode: state => state.previewMode,
    
    // 获取当前字体大小
    currentFontSize: state => state.fontSize
  }
}) 