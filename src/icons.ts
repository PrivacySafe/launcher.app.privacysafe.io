import { addIcon } from '@iconify/vue'
import { IconifyIcon } from '@iconify/vue/offline'
import roundChat from '@iconify-icons/ic/round-chat'
import roundMail from '@iconify-icons/ic/round-mail'
import roundCloud from '@iconify-icons/ic/round-cloud'
import roundPeople from '@iconify-icons/ic/round-people'
import baselineClose from '@iconify-icons/ic/baseline-close'
import baselineLanguage from '@iconify-icons/ic/baseline-language'
import baselineBrush from '@iconify-icons/ic/baseline-brush'

const icons: Record<string, IconifyIcon> = {
  'baseline-close': baselineClose,
  'round-chat': roundChat,
  'round-mail': roundMail,
  'round-cloud': roundCloud,
  'round-people': roundPeople,
  'baseline-language': baselineLanguage,
  'baseline-brush': baselineBrush,
}

export function iconsInitialization() {
  Object.keys(icons).forEach(name => {
    addIcon(name, icons[name])
  })
}
