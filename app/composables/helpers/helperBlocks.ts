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
