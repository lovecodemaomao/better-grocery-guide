import DefaultTheme from 'vitepress/theme'
import CurrentMonth from './CurrentMonth.vue'
import PriceCompare from './PriceCompare.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CurrentMonth', CurrentMonth)
    app.component('PriceCompare', PriceCompare)
  }
}
