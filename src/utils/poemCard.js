function wrapCanvasText(context, text, maxWidth) {
  const lines = []
  let line = ''
  for (const char of String(text || '')) {
    const test = line + char
    if (line && context.measureText(test).width > maxWidth) {
      lines.push(line)
      line = char
    } else {
      line = test
    }
  }
  if (line) lines.push(line)
  return lines.length ? lines : ['']
}

export async function downloadPoemCard({ poem, poemLang, brand, anonymous, poetry, url }) {
  if (!poem) throw new Error('poem is required')

  await document.fonts?.ready
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  const width = 1200
  const padding = 120
  const contentWidth = width - padding * 2
  const serif = poemLang === 'zh-Hant' ? '"Noto Serif TC", serif' : '"Noto Serif SC", serif'

  context.font = `600 58px ${serif}`
  const titleLines = wrapCanvasText(context, poem.title, contentWidth)
  context.font = `400 36px ${serif}`
  const verseLines = poem.content.flatMap(line => wrapCanvasText(context, line, contentWidth))
  const height = Math.max(1500, 360 + titleLines.length * 82 + verseLines.length * 62 + 360)
  canvas.width = width
  canvas.height = height

  const paper = context.createLinearGradient(0, 0, width, height)
  paper.addColorStop(0, '#fbf8f0')
  paper.addColorStop(1, '#eee7d7')
  context.fillStyle = paper
  context.fillRect(0, 0, width, height)

  context.globalAlpha = .16
  context.fillStyle = '#d4af7a'
  context.beginPath()
  context.arc(width - 220, 210, 145, 0, Math.PI * 2)
  context.fill()
  context.fillStyle = '#607268'
  context.beginPath()
  context.moveTo(0, height - 300)
  context.lineTo(250, height - 610)
  context.lineTo(430, height - 390)
  context.lineTo(670, height - 720)
  context.lineTo(900, height - 420)
  context.lineTo(width, height - 570)
  context.lineTo(width, height)
  context.lineTo(0, height)
  context.closePath()
  context.fill()
  context.globalAlpha = 1

  context.strokeStyle = 'rgba(80,70,55,.25)'
  context.lineWidth = 3
  context.strokeRect(54, 54, width - 108, height - 108)
  context.strokeStyle = 'rgba(168,62,50,.28)'
  context.lineWidth = 2
  context.strokeRect(70, 70, width - 140, height - 140)

  let y = 190
  context.textAlign = 'center'
  context.fillStyle = '#a83e32'
  context.font = `500 28px ${serif}`
  context.fillText(poem.type?.name || poetry, width / 2, y)
  y += 100

  context.fillStyle = '#20231f'
  context.font = `600 58px ${serif}`
  for (const line of titleLines) {
    context.fillText(line, width / 2, y)
    y += 82
  }

  context.fillStyle = '#77786f'
  context.font = `400 28px ${serif}`
  context.fillText(`${poem.dynasty?.name || ''} · ${poem.author?.name || anonymous}`, width / 2, y + 12)
  y += 120

  context.fillStyle = '#2c2e29'
  context.font = `400 36px ${serif}`
  for (const line of verseLines) {
    context.fillText(line, width / 2, y)
    y += 62
  }

  const footerY = height - 150
  context.textAlign = 'left'
  context.fillStyle = '#a83e32'
  context.fillRect(padding, footerY - 48, 62, 62)
  context.fillStyle = '#fffaf0'
  context.font = `600 38px ${serif}`
  context.textAlign = 'center'
  context.fillText(poemLang === 'zh-Hant' ? '詩' : '诗', padding + 31, footerY - 3)

  context.textAlign = 'left'
  context.fillStyle = '#3e403a'
  context.font = `500 27px ${serif}`
  context.fillText(brand, padding + 82, footerY - 8)
  context.fillStyle = '#77786f'
  context.font = `400 20px ${serif}`
  context.fillText(url, padding + 82, footerY + 26)

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('canvas export failed')
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeTitle = poem.title.replace(/[\/:*?"<>|]/g, '_').slice(0, 40)
  link.href = objectUrl
  link.download = `诗笺-${safeTitle}-${poem.id}.png`
  link.click()
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
}
