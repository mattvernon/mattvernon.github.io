/**
 * Arrange elements in a centered masonry grid.
 * Returns elements with x, y, width, height assigned.
 */
export function autoLayout(elements, opts = {}) {
  const {
    columns = 5,
    cardWidth = 260,
    gap = 30,
    infoBarHeight = 42,
  } = opts

  const totalWidth = columns * cardWidth + (columns - 1) * gap
  const offsetX = -totalWidth / 2
  const colHeights = new Array(columns).fill(0)

  return elements.map((el) => {
    // Find shortest column
    const col = colHeights.indexOf(Math.min(...colHeights))

    // Calculate card height from aspect ratio
    const rawHeight = Math.round(cardWidth / (el.aspectRatio || 0.75))
    const height = Math.max(160, Math.min(440, rawHeight))

    const x = offsetX + col * (cardWidth + gap)
    const y = colHeights[col]

    colHeights[col] += height + infoBarHeight + gap

    return {
      ...el,
      x,
      y,
      width: cardWidth,
      height,
    }
  })
}
