import componentHelpers from '#lib/componentHelpers'
import { useBlockRegistry } from '../editor/useBlockRegistry'
import {
  helperTextDefaults, helperTextFields, renderHelperText,
  helperHeaderH2Defaults, helperHeaderH2Fields, renderHelperHeaderH2,
  helperHeaderH3Defaults, helperHeaderH3Fields, renderHelperHeaderH3,
  helperHeaderH4Defaults, helperHeaderH4Fields, renderHelperHeaderH4,
  helperHeaderH5Defaults, helperHeaderH5Fields, renderHelperHeaderH5,
  helperHeaderH6Defaults, helperHeaderH6Fields, renderHelperHeaderH6,
  helperYoutubeDefaults, helperYoutubeFields, renderHelperYoutube,
  helperDividerDefaults, helperDividerFields, renderHelperDivider,
  helperButtonLeftDefaults, helperButtonLeftFields, renderHelperButtonLeft,
  helperButtonCenterDefaults, helperButtonCenterFields, renderHelperButtonCenter,
  helperButtonRightDefaults, helperButtonRightFields, renderHelperButtonRight,
} from './helperBlocks'

// Pre-rendered html_code for each of the 11 Helper Components titles, keyed
// exactly as they appear in src/utils/html-elements/componentHelpers.ts.
const RENDERED_HTML: Record<string, string> = {
  'Text': renderHelperText(helperTextDefaults),
  'Header H2': renderHelperHeaderH2(helperHeaderH2Defaults),
  'Header H3': renderHelperHeaderH3(helperHeaderH3Defaults),
  'Header H4': renderHelperHeaderH4(helperHeaderH4Defaults),
  'Header H5': renderHelperHeaderH5(helperHeaderH5Defaults),
  'Header H6': renderHelperHeaderH6(helperHeaderH6Defaults),
  'YouTube Video': renderHelperYoutube(helperYoutubeDefaults),
  'Break Divider': renderHelperDivider(helperDividerDefaults),
  'Left Positioned Button': renderHelperButtonLeft(helperButtonLeftDefaults),
  'Centered Button': renderHelperButtonCenter(helperButtonCenterDefaults),
  'Right Positioned Button': renderHelperButtonRight(helperButtonRightDefaults),
}

export function useHelperBlocks() {
  const blockRegistry = useBlockRegistry()

  blockRegistry.register('Text', { defaults: helperTextDefaults, fields: helperTextFields, render: renderHelperText })
  blockRegistry.register('Header H2', { defaults: helperHeaderH2Defaults, fields: helperHeaderH2Fields, render: renderHelperHeaderH2 })
  blockRegistry.register('Header H3', { defaults: helperHeaderH3Defaults, fields: helperHeaderH3Fields, render: renderHelperHeaderH3 })
  blockRegistry.register('Header H4', { defaults: helperHeaderH4Defaults, fields: helperHeaderH4Fields, render: renderHelperHeaderH4 })
  blockRegistry.register('Header H5', { defaults: helperHeaderH5Defaults, fields: helperHeaderH5Fields, render: renderHelperHeaderH5 })
  blockRegistry.register('Header H6', { defaults: helperHeaderH6Defaults, fields: helperHeaderH6Fields, render: renderHelperHeaderH6 })
  blockRegistry.register('YouTube Video', { defaults: helperYoutubeDefaults, fields: helperYoutubeFields, render: renderHelperYoutube })
  blockRegistry.register('Break Divider', { defaults: helperDividerDefaults, fields: helperDividerFields, render: renderHelperDivider })
  blockRegistry.register('Left Positioned Button', { defaults: helperButtonLeftDefaults, fields: helperButtonLeftFields, render: renderHelperButtonLeft })
  blockRegistry.register('Centered Button', { defaults: helperButtonCenterDefaults, fields: helperButtonCenterFields, render: renderHelperButtonCenter })
  blockRegistry.register('Right Positioned Button', { defaults: helperButtonRightDefaults, fields: helperButtonRightFields, render: renderHelperButtonRight })

  const helperComponentBlocks = componentHelpers.map((helper) =>
    RENDERED_HTML[helper.title] ? { ...helper, html_code: RENDERED_HTML[helper.title] } : helper
  )

  return { helperComponentBlocks }
}
