import { colorsByCodes, themeColors } from '@/constants'

export function setColorTheme({ theme, colors }: {
  theme: AvailableColorThemes;
  colors?: Record<string, string>;
}) {
  const parentElement = document.documentElement
  if (parentElement) {
    parentElement.setAttribute('data-theme', theme)

    const tColors = colors || themeColors[theme] || themeColors.default

    for (const item of Object.entries(tColors)) {
      const [color, value] = item
      parentElement.style.setProperty(`--${color}`, value)
    }
  }
}

export function getElementColor(initials = '?'): string {
  const code = initials.length === 1
    ? initials.charCodeAt(0) % 64
    : (initials.charCodeAt(0) + initials.charCodeAt(1)) % 64
  const codeAsString = initials[0] === '?' ? '?' : code.toFixed()
  return colorsByCodes[codeAsString]
}

export function invertColor(color: string): string {
  if (!color)
    return '#000'

  let tmpColor = color.substring(1)
  let tmpColorNum = parseInt(tmpColor, 16)
  tmpColorNum = 0xFFFFFF ^ tmpColorNum
  tmpColor = tmpColorNum.toString(16)
  tmpColor = ('00000' + tmpColor).slice(-6)
  tmpColor = `#${tmpColor}`
  return tmpColor
}

export function userNameFromUserId(userId: string): string {
  const indOfAt = userId.indexOf('@')
  return (indOfAt <= 0) ? '' : userId.substring(0, indOfAt)
}

export function userDomainFromUserId(userId: string): string {
  const indOfAt = userId.indexOf('@')
  return (indOfAt <= 0) ? userId : userId.substring(indOfAt)
}