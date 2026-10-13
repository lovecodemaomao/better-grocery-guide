import DefaultTheme from 'vitepress/theme'
import CurrentMonth from './CurrentMonth.vue'
import PriceCompare from './PriceCompare.vue'
import ReferenceCheck from './ReferenceCheck.vue'
import BuyingCard from './BuyingCard.vue'
import TaskNav from './TaskNav.vue'
import TonightPicks from './TonightPicks.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('CurrentMonth', CurrentMonth)
    app.component('PriceCompare', PriceCompare)
    app.component('ReferenceCheck', ReferenceCheck)
    app.component('BuyingCard', BuyingCard)
    app.component('TaskNav', TaskNav)
    app.component('TonightPicks', TonightPicks)
  }
}
