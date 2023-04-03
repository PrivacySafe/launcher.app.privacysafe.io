import { createApp } from 'vue'
import { Button } from '@varlet/ui'
import router from './router'
import { iconsInitialization } from './icons'
import { initializationServices } from '@/services'
import App from '@/components/app.vue'

import '@varlet/touch-emulator'
import '@varlet/ui/es/button/style/index.js'
import '@/assets/styles/main.css'

const mode = process.env.NODE_ENV

const init = () => {
  iconsInitialization()
  initializationServices()
    .then(() => {
      const app = createApp(App)

      app.config.globalProperties.$router = router

      app
        .use(Button)
        .use(router)
        .mount('#app')
    })
}

if ((w3n as web3n.testing.CommonW3N).testStand && mode !== 'production') {
  import('@vue/devtools')
    .then(devtools => {
      (w3n as web3n.testing.CommonW3N).testStand.staticTestInfo()
        .then((data: { userNum: number, userId: string }) => {
          const { userNum } = data
          devtools.connect('http://localhost', 8098 + userNum);
          init()
        })
    })
} else if (mode !== 'production') {
  import('@vue/devtools')
    .then(devtools => {
      devtools.connect('http://localhost', 8098);
      init()
    })
} else {
  init()
}
