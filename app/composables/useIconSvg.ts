// Heroicons v2 24/outline — paths sourced from @heroicons/vue 2.2.0
const PATHS: Record<string, string> = {
  magnifyingGlass: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
  shoppingCart:    'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  user:            'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z',
  chevronDown:     'm19.5 8.25-7.5 7.5-7.5-7.5',
  xMark:           'M6 18 18 6M6 6l12 12',
  plus:            'M12 4.5v15m7.5-7.5h-15',
  trash:           'm14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0',
  pencil:          'm16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125',
  check:           'm4.5 12.75 6 6 9-13.5',
  arrowDownTray:   'M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3',
  arrowLeft:       'M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18',
}

export type IconName = keyof typeof PATHS

export function icon(
  name: IconName,
  opts: { size?: number; stroke?: string; style?: string; strokeWidth?: string } = {},
): string {
  const { size = 24, stroke = 'currentColor', style = '', strokeWidth = '1.5' } = opts
  const styleAttr = style ? ` style="${style}"` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="${strokeWidth}" stroke="${stroke}" width="${size}" height="${size}"${styleAttr}><path stroke-linecap="round" stroke-linejoin="round" d="${PATHS[name]}"/></svg>`
}
