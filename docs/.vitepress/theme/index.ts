import DefaultTheme from 'vitepress/theme'
import CurrentMonth from './CurrentMonth.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CurrentMonth', CurrentMonth)
  }
}
