import PALETTES from './palettes'

declare var $, Color

export const DEFAULT_PALETTE = 'd3category20'

export function get_palette(name_or_palette?: string|string[]) : string[] {
  if (name_or_palette instanceof Array) {
    return name_or_palette
  } else if (typeof name_or_palette === 'string') {
    return PALETTES[name_or_palette] || PALETTES[DEFAULT_PALETTE]
  } else {
    return PALETTES[DEFAULT_PALETTE]
  }
}

/**
 * Return a set of colors for rendering graphs that are tuned to
 * the current UI color theme. Colors are derived from the
 * background color of the 'body' element.
 *
 * TODO: cache the results keyed by background color.
 *
 * TODO: if the model had back links to containers, we could walk
 * up the containment hierarchy to see if the chart is contained
 * in something that has a background style set (i.e. well, alert,
 * etc...) and get the colors based on that.
 *
 * Or we could just pre-compute them all based on the background
 * colors from the CSS.
 */
export function get_colors() {
  let color = Color(window.getComputedStyle($('body')[0]).backgroundColor)
  if (color.isDark()) {
    return {
      majorGridLineColor: color.lighten(0.75).hex(),
      minorGridLineColor: color.lighten(0.5).hex(),
      fgcolor: color.lighten(3.0).hex()
    }
  } else {
    return {
      majorGridLineColor: color.darken(0.15).hex(),
      minorGridLineColor: color.darken(0.05).hex(),
      fgcolor: color.darken(0.75).hex()
    }
  }
}

/**
 * Return a low contrast monochromatic color palette for
 * transforms like HighlightAverage, which de-emphasize a mass of
 * raw metrics in order to highlight computed series.
 */
export function get_low_contrast_palette() {
  /* TODO: get from options parameter */
  let light_step = 0.1
  , dark_step  = 0.05
  , count      = 6
  , bg    = Color(window.getComputedStyle($('body')[0]).backgroundColor)
  , color = bg.isDark() ? bg.lighten(0.25) : bg.darken(0.1)

  let palette = []
  for (var i = 0; i < count; i++) {
    palette.push(color.hex())
    bg.isDark() ? color.lighten(light_step) : color.darken(dark_step)
  }

  return palette
}
