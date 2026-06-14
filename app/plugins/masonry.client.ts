import mitt from 'mitt'
import { VueMasonryPlugin } from 'vue-masonry'

export default defineNuxtPlugin((nuxtApp) => {
  const emitter = mitt()
  nuxtApp.vueApp.config.globalProperties.emitter = emitter
  nuxtApp.vueApp.use(VueMasonryPlugin)
})
