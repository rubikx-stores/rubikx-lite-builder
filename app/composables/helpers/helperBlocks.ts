import type { FieldConfig } from '../editor/useBlockRegistry'
import { fontField, fontCss } from '../editor/fontFields'

// ─── Text ─────────────────────────────────────────────────────────────────────

export interface HelperTextData {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textAlign: string
  paddingY: number
}

export const helperTextDefaults: HelperTextData = {
  content: 'Start customizing by editing this default text directly in the editor.',
  fontFamily: '',
  fontSize: 16,
  fontWeight: '400',
  color: '#111827',
  textAlign: 'left',
  paddingY: 16,
}

export const helperTextFields: FieldConfig[] = [
  { key: '_h_font', label: 'Font', type: 'header' },
  fontField('fontFamily', 'Font Family'),
  { key: 'content', label: 'Text', type: 'textarea', placeholder: 'Enter your text…' },
  { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1 },
  { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['400', '500', '600', '700'] },
  { key: 'color', label: 'Text Color', type: 'color' },
  { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4 },
]

export function renderHelperText(data: HelperTextData): string {
  return `<section data-component-title="Text" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.paddingY}px 16px;${fontCss(undefined, data.fontFamily)}">
  <div style="max-width:80rem;margin:0 auto;">
    <p style="margin:0;font-size:${data.fontSize}px;font-weight:${data.fontWeight};color:${data.color};text-align:${data.textAlign};white-space:pre-wrap;">${data.content}</p>
  </div>
</section>`
}

// ─── Headers (H2–H6) ────────────────────────────────────────────────────────────
// Identical fields across all 5 levels — only the tag name and default font
// size differ, so they're built through one shared factory instead of 5
// near-duplicate blocks.

export interface HelperHeaderData {
  content: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  color: string
  textAlign: string
  paddingY: number
}

function makeHeaderBlock(tag: string, title: string, defaultFontSize: number) {
  const defaults: HelperHeaderData = {
    content: 'Layouts and visual.',
    fontFamily: '',
    fontSize: defaultFontSize,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'left',
    paddingY: 16,
  }

  const fields: FieldConfig[] = [
    { key: '_h_font', label: 'Font', type: 'header' },
    fontField('fontFamily', 'Font Family'),
    { key: 'content', label: 'Heading Text', type: 'text', placeholder: 'Enter heading…' },
    { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1 },
    { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['400', '500', '600', '700', '800'] },
    { key: 'color', label: 'Text Color', type: 'color' },
    { key: 'textAlign', label: 'Text Alignment', type: 'select', options: ['left', 'center', 'right'] },
    { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4 },
  ]

  function render(data: HelperHeaderData): string {
    return `<section data-component-title="${title}" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.paddingY}px 16px;${fontCss(undefined, data.fontFamily)}">
  <div style="max-width:80rem;margin:0 auto;">
    <${tag} style="margin:0;font-size:${data.fontSize}px;font-weight:${data.fontWeight};color:${data.color};text-align:${data.textAlign};">${data.content}</${tag}>
  </div>
</section>`
  }

  return { defaults, fields, render }
}

export const {
  defaults: helperHeaderH2Defaults,
  fields: helperHeaderH2Fields,
  render: renderHelperHeaderH2,
} = makeHeaderBlock('h2', 'Header H2', 32)

export const {
  defaults: helperHeaderH3Defaults,
  fields: helperHeaderH3Fields,
  render: renderHelperHeaderH3,
} = makeHeaderBlock('h3', 'Header H3', 28)

export const {
  defaults: helperHeaderH4Defaults,
  fields: helperHeaderH4Fields,
  render: renderHelperHeaderH4,
} = makeHeaderBlock('h4', 'Header H4', 24)

export const {
  defaults: helperHeaderH5Defaults,
  fields: helperHeaderH5Fields,
  render: renderHelperHeaderH5,
} = makeHeaderBlock('h5', 'Header H5', 20)

export const {
  defaults: helperHeaderH6Defaults,
  fields: helperHeaderH6Fields,
  render: renderHelperHeaderH6,
} = makeHeaderBlock('h6', 'Header H6', 16)

// ─── YouTube Video ──────────────────────────────────────────────────────────────
// Aspect ratio + extra-height follows the same idea as Ru1Hero's aspectRatio/
// extraHeight fields (app/composables/themes/themes-data.ts:470-478): the ratio
// sets a responsive base height via the padding-top percentage trick, and
// extraHeight adds on top of that via calc() rather than overriding it outright.

export interface HelperYoutubeData {
  videoUrl: string
  aspectRatio: string
  extraHeight: number
  paddingY: number
}

export const helperYoutubeDefaults: HelperYoutubeData = {
  videoUrl: '',
  aspectRatio: '16/9',
  extraHeight: 0,
  paddingY: 16,
}

export const helperYoutubeFields: FieldConfig[] = [
  { key: 'videoUrl', label: 'YouTube Video URL or ID', type: 'url', placeholder: 'https://www.youtube.com/watch?v=…' },
  { key: 'aspectRatio', label: 'Aspect Ratio', type: 'select', options: ['16/9', '4/3', '1/1', '9/16', '21/9'] },
  { key: 'extraHeight', label: 'Extra Height', type: 'number', unit: 'px', step: 10, placeholder: '0' },
  { key: 'paddingY', label: 'Vertical Padding', type: 'number', unit: 'px', step: 4 },
]

function helperYoutubeEmbedSrc(input: string): string {
  const idMatch = input.match(/(?:youtu\.be\/|[?&]v=|embed\/)([\w-]{11})/)
  const id = idMatch ? idMatch[1] : input.trim()
  return id ? `https://www.youtube.com/embed/${id}` : ''
}

function helperYoutubeRatioPercent(ratio: string): number {
  const [w, h] = ratio.split('/').map(Number)
  return w > 0 && h > 0 ? (h / w) * 100 : 56.25
}

export function renderHelperYoutube(data: HelperYoutubeData): string {
  const percent = helperYoutubeRatioPercent(data.aspectRatio)
  const boxHeight = data.extraHeight ? `calc(${percent}% + ${data.extraHeight}px)` : `${percent}%`
  const src = helperYoutubeEmbedSrc(data.videoUrl)
  return `<section data-component-title="YouTube Video" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.paddingY}px 16px;">
  <div style="max-width:80rem;margin:0 auto;">
    <div style="position:relative;width:100%;height:0;padding-top:${boxHeight};background:#f3f4f6;">
      ${src ? `<iframe src="${src}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" allowfullscreen></iframe>` : ''}
    </div>
  </div>
</section>`
}

// ─── Break Divider ──────────────────────────────────────────────────────────────

export interface HelperDividerData {
  color: string
  thickness: number
  width: number
  spacing: number
}

export const helperDividerDefaults: HelperDividerData = {
  color: '#d1d5db',
  thickness: 1,
  width: 100,
  spacing: 32,
}

export const helperDividerFields: FieldConfig[] = [
  { key: 'color', label: 'Color', type: 'color' },
  { key: 'thickness', label: 'Thickness', type: 'number', unit: 'px', step: 1 },
  { key: 'width', label: 'Width', type: 'number', unit: '%', step: 5 },
  { key: 'spacing', label: 'Vertical Spacing', type: 'number', unit: 'px', step: 4 },
]

export function renderHelperDivider(data: HelperDividerData): string {
  return `<section data-component-title="Break Divider" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:${data.spacing}px 16px;">
  <div style="max-width:80rem;margin:0 auto;display:flex;justify-content:center;">
    <div style="width:${data.width}%;border-top:${data.thickness}px solid ${data.color};"></div>
  </div>
</section>`
}

// ─── Buttons (Left / Centered / Right Positioned) ──────────────────────────────
// Identical fields across all 3 variants — only the default justify-content
// differs, and alignment is fixed per variant (not user-editable) so the 3
// picker cards stay distinct.

export interface HelperButtonData {
  label: string
  href: string
  fontFamily: string
  fontSize: number
  fontWeight: string
  textColor: string
  bgColor: string
  paddingX: number
  paddingY: number
  borderRadius: number
}

function makeButtonBlock(title: string, justify: string) {
  const defaults: HelperButtonData = {
    label: 'Link to landing page',
    href: 'https://www.google.com',
    fontFamily: '',
    fontSize: 16,
    fontWeight: '500',
    textColor: '#ffffff',
    bgColor: '#16a34a',
    paddingX: 24,
    paddingY: 12,
    borderRadius: 4,
  }

  const fields: FieldConfig[] = [
    { key: '_h_font', label: 'Font', type: 'header' },
    fontField('fontFamily', 'Font Family'),
    { key: 'label', label: 'Button Text', type: 'text', placeholder: 'e.g. Shop Now' },
    { key: 'href', label: 'Link URL', type: 'url', placeholder: 'https://…' },
    { key: 'fontSize', label: 'Font Size', type: 'number', unit: 'px', step: 1 },
    { key: 'fontWeight', label: 'Font Weight', type: 'select', options: ['400', '500', '600', '700'] },
    { key: 'textColor', label: 'Text Color', type: 'color' },
    { key: 'bgColor', label: 'Background Color', type: 'color' },
    { key: 'paddingX', label: 'Padding X (width)', type: 'number', unit: 'px', step: 2 },
    { key: 'paddingY', label: 'Padding Y (height)', type: 'number', unit: 'px', step: 2 },
    { key: 'borderRadius', label: 'Border Radius', type: 'number', unit: 'px', step: 1 },
  ]

  function render(data: HelperButtonData): string {
    return `<section data-component-title="${title}" data-component-props="${encodeURIComponent(JSON.stringify(data))}" style="padding:16px;">
  <div style="max-width:80rem;margin:0 auto;display:flex;justify-content:${justify};">
    <a href="${data.href}" target="_blank" rel="noopener noreferrer nofollow" style="display:inline-block;padding:${data.paddingY}px ${data.paddingX}px;background:${data.bgColor};color:${data.textColor};text-decoration:none;font-size:${data.fontSize}px;font-weight:${data.fontWeight};border-radius:${data.borderRadius}px;${fontCss(undefined, data.fontFamily)}">${data.label}</a>
  </div>
</section>`
  }

  return { defaults, fields, render }
}

export const {
  defaults: helperButtonLeftDefaults,
  fields: helperButtonLeftFields,
  render: renderHelperButtonLeft,
} = makeButtonBlock('Left Positioned Button', 'flex-start')

export const {
  defaults: helperButtonCenterDefaults,
  fields: helperButtonCenterFields,
  render: renderHelperButtonCenter,
} = makeButtonBlock('Centered Button', 'center')

export const {
  defaults: helperButtonRightDefaults,
  fields: helperButtonRightFields,
  render: renderHelperButtonRight,
} = makeButtonBlock('Right Positioned Button', 'flex-end')
