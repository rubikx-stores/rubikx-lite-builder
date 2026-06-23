<script setup>
import { ref, computed } from 'vue'
import { sharedPageBuilderStore } from '../../../stores/shared-store'
import { useTranslations } from '../../../composables/useTranslations'
import Typography from '../EditorMenu/Editables/Typography.vue'
import ClassEditor from '../EditorMenu/Editables/ClassEditor.vue'
import StyleEditor from '../EditorMenu/Editables/StyleEditor.vue'
import ImageEditor from '../EditorMenu/Editables/ImageEditor.vue'
import OpacityEditor from '../EditorMenu/Editables/OpacityEditor.vue'
import Padding from '../EditorMenu/Editables/Padding.vue'
import Margin from '../EditorMenu/Editables/Margin.vue'
import BorderRadius from '../EditorMenu/Editables/BorderRadius.vue'
import BackgroundColorEditor from '../EditorMenu/Editables/BackgroundColorEditor.vue'
import TextColorEditor from '../EditorMenu/Editables/TextColorEditor.vue'
import Borders from '../EditorMenu/Editables/Borders.vue'
import LinkEditor from '../EditorMenu/Editables/LinkEditor.vue'
import EditGetElement from '../EditorMenu/Editables/EditGetElement.vue'
import HTMLEditor from '../EditorMenu/Editables/HTMLEditor.vue'
import { extractCleanHTMLFromPageBuilder } from '../../../composables/extractCleanHTMLFromPageBuilder'

defineProps({
  isLoading: {
    Type: Boolean,
    required: true,
    default: true,
  },
})

const { translate } = useTranslations()

// Use shared store instance
const pageBuilderStateStore = sharedPageBuilderStore

const getElement = computed(() => {
  return pageBuilderStateStore.getElement
})
const getComponent = computed(() => {
  return pageBuilderStateStore.getComponent
})
const getComponents = computed(() => {
  return pageBuilderStateStore.getComponents
})
const current = ref('element')

const updateCurrentTab = function (tab) {
  current.value = tab
}
function prettifyHtml(html) {
  if (!html) return ''

  const tab = '  '
  let indentLevel = 0
  let result = ''

  // Basic HTML entity escaping
  const escapedHtml = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

  // Split into tokens, keeping the tags
  const tokens = escapedHtml.split(/(&lt;[^&gt;]+&gt;)/g)

  const selfClosingTags = [
    '&lt;area',
    '&lt;base',
    '&lt;br',
    '&lt;col',
    '&lt;embed',
    '&lt;hr',
    '&lt;img',
    '&lt;input',
    '&lt;link',
    '&lt;meta',
    '&lt;param',
    '&lt;source',
    '&lt;track',
    '&lt;wbr',
  ]

  tokens.forEach((token) => {
    const trimmed = token.trim()
    if (!trimmed) return

    const isTag = trimmed.startsWith('&lt;') && trimmed.endsWith('&gt;')
    const isClosingTag = isTag && trimmed.startsWith('&lt;/')

    // Adjust indentation level
    if (isClosingTag) {
      indentLevel = Math.max(0, indentLevel - 1)
    }

    // Add indentation
    let line = tab.repeat(indentLevel) + trimmed

    // Syntax highlighting using spans
    if (isTag) {
      line = line.replace(/(&lt;\/?[[\w\s="/.':;#-\/\?]+&gt;)/g, (match) => {
        const tagName = match.match(/&lt;\/?([\w-]+)/)?.[1]
        let highlighted = match.replace(
          /(&lt;\/?[\w-]+)/g,
          `<span class="html-tag-symbol">&lt;</span><span class="html-tag-name">${tagName}</span>`,
        )

        // Highlight attributes
        highlighted = highlighted.replace(
          /([\w-]+)=(&quot;[^&quot;]*&quot;)/g,
          '<span class="html-attribute-name">$1</span><span class="html-operator">=</span><span class="html-attribute-value">$2</span>',
        )

        return highlighted + '<span class="html-tag-symbol">&gt;</span>'
      })
    }

    result += line + '\n'

    // Increase indent for next line
    if (isTag && !isClosingTag) {
      const isSelfClosing =
        trimmed.endsWith('/&gt;') || selfClosingTags.some((tag) => trimmed.startsWith(tag))
      if (!isSelfClosing) {
        indentLevel++
      }
    }
  })

  return result
}

const generateHTML = function (filename, HTML) {
  // Extract existing styles from the page
  const existingStyles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
    .map((style) => {
      if (style.tagName === 'STYLE') {
        return style.outerHTML // Inline styles
      } else if (style.tagName === 'LINK') {
        return `<link rel="stylesheet" href="${style.href}">` // External stylesheets
      }
      return ''
    })
    .join('\n')

  // Add your custom CSS
  const customCSS = `
      <style>
        #pagebuilder blockquote,
        #pagebuilder dl,
        #pagebuilder dd,
        #pagebuilder pre,
        #pagebuilder hr,
        #pagebuilder figure,
        #pagebuilder p,
        #pagebuilder h1,
        #pagebuilder h2,
        #pagebuilder h3,
        #pagebuilder h4,
        #pagebuilder h5,
        #pagebuilder h6,
        #pagebuilder ul,
        #pagebuilder ol,
        #pagebuilder li {
          margin: 0;
          padding: 0; /* Often useful for ul/ol too */
        }
      </style>
    `

  // Combine existing styles and custom CSS
  const css = `${existingStyles}\n${customCSS}`

  // Generate the full HTML
  const fullHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Downloaded HTML</title>
            ${css}
        </head>
        <body>
            <div id="pagebuilder" class="font-sans text-black">
                ${HTML}
            </div>
        </body>
        </html>
    `

  // Create and trigger the download
  const element = document.createElement('a')
  element.setAttribute('href', 'data:text/html;charset=utf-8,' + encodeURIComponent(fullHTML))
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

const handleDownloadHTML = function () {
  const pagebuilder = document.getElementById('pagebuilder')
  if (!pagebuilder) {
    return
  }

  // Extract clean HTML
  let html = extractCleanHTMLFromPageBuilder(pagebuilder)

  // Create a temporary DOM element to manipulate the HTML
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Remove 'hovered' and 'selected' attributes
  tempDiv.querySelectorAll('[hovered], [selected]').forEach((el) => {
    el.removeAttribute('hovered')
    el.removeAttribute('selected')
  })

  // Get the cleaned HTML back
  html = tempDiv.innerHTML

  generateHTML('downloaded_html.html', html)
}

const selectedTab = ref('globalPageStyles')

function selectTab(tab) {
  selectedTab.value = tab
}
</script>

<template>
  <div>
    <div>
      <!-- tabbar start -->
      <div
        class="mb-4 flex justify-start items-center gap-2 border-0 border-solid border-b border-gray-200 pb-4 overflow-x-auto"
      >
        <div class="flex justify-center items-center gap-2">
          <button
            @click="selectTab('globalPageStyles')"
            :class="[
              'pbx-mySecondaryButton text-xs px-4',
              selectedTab === 'globalPageStyles'
                ? 'bg-myPrimaryLinkColor text-white hover:text-white  hover:bg-myPrimaryLinkColor'
                : 'hover:text-black',
            ]"
          >
            <span>
              <svg
                fill="currentColor"
                height="22"
                viewBox="0 0 22 22"
                width="22"
                xmlns="http://www.w3.org/2000/svg"
                class="css-l0u10b"
              >
                <g clip-path="url(#prefix__clip0_1645_485)">
                  <path
                    clip-rule="evenodd"
                    d="M19.871 1.81a2.768 2.768 0 00-3.914 0l-3.543 3.544-2.5-2.5L0 12.768l8.914 8.914 9.914-9.914-2.5-2.5 3.543-3.543a2.768 2.768 0 000-3.914zm-2.5 1.415a.768.768 0 011.086 1.086L13.5 9.268l2.5 2.5-1.086 1.086-6.086-6.086 1.086-1.086 2.5 2.5 4.957-4.957zM7.414 8.182l-4.586 4.586 1.086 1.086 3.293-3.293 1.414 1.414-3.293 3.293 1.086 1.086 3.293-3.293 1.414 1.414-3.293 3.293 1.086 1.086 4.586-4.586-6.086-6.086z"
                    fill-rule="evenodd"
                  ></path>
                </g>
                <defs>
                  <clipPath id="prefix__clip0_1645_485">
                    <path d="M0 0h22v22H0z" fill="#fff"></path>
                  </clipPath>
                </defs>
              </svg>
            </span>
            <span>
              {{ translate('Global Page Styles') }}
            </span>
          </button>
          <button
            @click="selectTab('download')"
            :class="[
              'pbx-mySecondaryButton text-xs px-4',
              selectedTab === 'download'
                ? 'bg-myPrimaryLinkColor text-white hover:text-white  hover:bg-myPrimaryLinkColor'
                : 'hover:text-black',
            ]"
          >
            <span class="material-symbols-outlined"> download_2 </span>
            <span>
              {{ translate('Download HTML') }}
            </span>
          </button>
        </div>
        <div>
          <button
            @click="selectTab('viewHTMLConfig')"
            :class="[
              'pbx-mySecondaryButton text-xs px-4',
              selectedTab === 'viewHTMLConfig'
                ? 'bg-myPrimaryLinkColor text-white hover:text-white  hover:bg-myPrimaryLinkColor'
                : 'hover:text-black',
            ]"
          >
            <span class="material-symbols-outlined"> deployed_code </span>
            <span>
              {{ translate('Selected HTML') }}
            </span>
          </button>
        </div>
      </div>
      <!-- tabbar end -->

      <!-- loading spinner start -->
      <div v-if="isLoading">
        <div class="flex items-top justify-center mt-4 min-h-screen">
          <div
            class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
          >
            <span
              class="!absolute !m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
              >Loading...</span
            >
          </div>
        </div>
      </div>
      <!-- loading spinner end -->
      <!-- globalPageStyles start -->
      <div v-if="!isLoading">
        <div v-if="selectedTab === 'download'" class="min-h-screen">
          <div v-if="Array.isArray(getComponents) && getComponents.length >= 1">
            <p class="pbx-myPrimaryParagraph mt-6 mb-10">
              {{
                translate(
                  'Export the entire page as a standalone HTML file. This includes all sections, content, and applied styles, making it ready for use or integration elsewhere.',
                )
              }}
            </p>
            <div class="my-2 py-2">
              <button @click="handleDownloadHTML" type="button" class="pbx-myPrimaryButton">
                <span class="material-symbols-outlined"> download_2 </span>
                <span>
                  {{ translate('Download HTML file') }}
                </span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="selectedTab === 'globalPageStyles'" class="min-h-screen">
          <div>
            <p class="pbx-myPrimaryParagraph mt-6 mb-10">
              {{
                translate(
                  'Apply styles that affect the entire page. These settings include global font family, text color, background color, and other universal styles that apply to all sections.',
                )
              }}
            </p>
            <div
              class="grid lg:grid-cols-2 grid-cols-1 lg:gap-4 gap-4 py-4 mb-12"
            >
              <article
                class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl lg:col-span-2"
              >
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Typography
                </p>
                <Typography></Typography>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Text color
                </p>
                <TextColorEditor :globalPageLayout="true"></TextColorEditor>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Background color
                </p>
                <BackgroundColorEditor :globalPageLayout="true"></BackgroundColorEditor>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Padding
                </p>
                <Padding> </Padding>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Margin
                </p>
                <Margin> </Margin>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Border radius
                </p>
                <BorderRadius></BorderRadius>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Border style
                </p>
                <Borders></Borders>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">CSS</p>
                <ClassEditor></ClassEditor>
              </article>
              <article class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl">
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  Inline style
                </p>
                <StyleEditor></StyleEditor>
              </article>
              <article
                class="my-1 bg-gray-100 px-4 pt-2 pb-8 rounded-2xl lg:col-span-2"
              >
                <p class="pbx-myPrimaryParagraph italic pb-2 lg:mt-6 mt-8">
                  HTML editor
                </p>
                <HTMLEditor></HTMLEditor>
              </article>
            </div>
          </div>
        </div>
        <!-- globalPageStyles end -->
        <!-- viewHTMLConfig start -->
        <div v-if="selectedTab === 'viewHTMLConfig'" class="min-h-screen">
          <p class="pbx-myPrimaryParagraph mt-6 mb-10">
            {{
              translate(
                'Overview of Selected Element, Component, and Components. This section provides real-time updates based on your HTML selection.',
              )
            }}
          </p>

          <div
            class="w-full inset-x-0 h-[90vh] bg-white overflow-x-scroll lg:pt-2 pt-2"
          >
            <div
              class="flex items-left flex-col pbx-myPrimaryGap border-myPrimaryMediumGrayColor"
            >
              <!-- Types - start -->
              <div>
                <h4 class="pbx-myPrimaryParagraph text-xs pb-2">
                  {{ translate('Types') }}
                </h4>
                <div class="text-gray-100 overflow-hidden bg-gray-900">
                  <div class="flex bg-gray-900 ring-1 ring-white/5">
                    <div
                      class="mb-px flex text-xs font-medium text-myPrimaryMediumGrayColor"
                    >
                      <div class="px-4 py-4 text-gray-100">
                        {{ translate('Types') }}
                      </div>
                    </div>
                  </div>
                  <div class="px-4 pb-8 pt-4 text-gray-100 text-xs">
                    <p class="text-xs pb-2">
                      <span>{{ translate('Element type:') }} </span>
                      <span>
                        {{ typeof getElement }}
                      </span>
                    </p>

                    <p class="text-xs pb-2">
                      <span>{{ translate('Component type:') }} </span>
                      {{ typeof getComponent }}
                    </p>
                    <p class="text-xs pb-2">
                      <span>{{ translate('Components:') }} </span>
                      <span>
                        {{
                          Array.isArray(getComponents) === true
                            ? translate('array')
                            : typeof getComponents
                        }}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <!-- Types - end -->
              <!-- Code Block Component - start-->
              <div>
                <h4 class="pbx-myPrimaryParagraph text-xs pb-2">
                  {{ translate('Content') }}
                </h4>
                <div class="overflow-hidden bg-gray-900">
                  <div class="flex bg-gray-900 ring-1 ring-white/5">
                    <div
                      class="mb-px flex text-xs font-medium text-myPrimaryMediumGrayColor"
                    >
                      <div
                        @click="updateCurrentTab('element')"
                        class="px-4 py-4 cursor-pointer"
                        :class="[current === 'element' ? 'text-gray-100' : '']"
                      >
                        {{ translate('Element') }}
                      </div>
                      <div
                        @click="updateCurrentTab('component')"
                        class="px-4 py-4 cursor-pointer"
                        :class="[current === 'component' ? 'text-gray-100' : '']"
                      >
                        {{ translate('Component') }}
                      </div>
                      <div
                        @click="updateCurrentTab('components')"
                        class="px-4 py-4 cursor-pointer"
                        :class="[current === 'components' ? 'text-gray-100' : '']"
                      >
                        {{ translate('Components added') }}
                        {{ Array.isArray(getComponents) && getComponents.length }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="px-4 pb-8 pt-4 text-gray-100 text-xs break-all"
                  >
                    <div v-if="current === 'element'">
                      <div v-if="!getComponent">
                        <p class="pb-2 text-xs">
                          {{
                            getComponent === null
                              ? translate('No Element selected')
                              : typeof getComponent
                          }}
                        </p>
                      </div>
                      <div
                        v-if="getElement"
                        class="overflow-hidden border-solid border border-gray-100 mb-6"
                      >
                        <div
                          class="border-0 bg-gray-900 pt-4 1 border-solid border-b border-gray-200"
                        >
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <thead class="bg-gray-900">
                                <tr>
                                  <th
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                  >
                                    {{ translate('Selected HTML:') }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="bg-gray-900 divide-y divide-gray-200">
                                <tr>
                                  <td
                                    class="border-0 px-6 py-3 text-left text-xs text-gray-100 font-normal border-solid border-b"
                                  >
                                    {{ getElement?.outerHTML }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <thead class="bg-gray-900">
                                <tr>
                                  <th
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                  >
                                    {{ translate('Element src:') }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="bg-gray-900 divide-y divide-gray-200">
                                <tr>
                                  <td
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal whitespace-pre-line"
                                  >
                                    {{ getElement?.src ? getElement?.src : typeof getElement?.src }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div class="overflow-x-auto">
                          <table class="min-w-full">
                            <thead class="bg-gray-900">
                              <tr>
                                <th
                                  class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                >
                                  {{ translate('Element classes:') }}
                                </th>
                              </tr>
                            </thead>
                            <tbody class="bg-gray-900 divide-y divide-gray-200">
                              <tr>
                                <td
                                  class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                >
                                  {{
                                    getElement?.classList
                                      ? getElement?.classList
                                      : typeof getElement?.classList
                                  }}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div v-if="current === 'component'">
                      <div v-if="!getComponent">
                        <p class="pb-2 text-xs">
                          {{
                            getComponent === null
                              ? translate('No Component selected')
                              : typeof getComponent
                          }}
                        </p>
                      </div>
                      <div
                        v-if="getComponent"
                        class="overflow-hidden border-solid border border-gray-100 mb-6"
                      >
                        <div
                          class="border-0 bg-gray-900 pt-4 1 border-solid border-b border-gray-200"
                        >
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <thead class="bg-gray-900">
                                <tr>
                                  <th
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                  >
                                    {{ translate('ID:') }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="bg-gray-900 divide-y divide-gray-200">
                                <tr>
                                  <td
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                  >
                                    {{ getComponent?.id }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <thead class="bg-gray-900">
                                <tr>
                                  <th
                                    class="border-0 px-6 py-3 text-left text-xs text-gray-100 font-normal border-solid border-t border-gray-200"
                                  >
                                    {{ translate('Title:') }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="bg-gray-900 divide-y divide-gray-200">
                                <tr>
                                  <td
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal whitespace-pre-line"
                                  >
                                    {{ getComponent?.title }}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div class="overflow-x-auto">
                          <table class="min-w-full">
                            <thead class="bg-gray-900">
                              <tr>
                                <th
                                  class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                >
                                  {{ translate('HTML Code:') }}
                                </th>
                              </tr>
                            </thead>
                            <tbody class="bg-gray-900 divide-y divide-gray-200">
                              <tr>
                                <td
                                  class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                >
                                  <pre
                                    class="text-xs text-gray-100 whitespace-pre-wrap font-sans flex items-start justify-left"
                                  >
                              <code class="font-sans bg-gray-800 p-4 rounded-md block w-full" v-html="prettifyHtml(getComponent?.html_code)"></code>
                            </pre>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div v-if="current === 'components'">
                      <div v-if="Array.isArray(getComponents) && getComponents.length === 0">
                        <p class="pb-2 text-xs">
                          {{ translate('No Components added yet') }}
                        </p>
                      </div>

                      <div v-if="getComponents">
                        <div
                          v-for="component in getComponents"
                          :key="component.id"
                          class="overflow-hidden border-solid border border-gray-100 mb-6"
                        >
                          <!-- Id and Title above the table, styled to look connected -->
                          <div
                            class="border-0 bg-gray-900 pt-4 1 border-solid border-b border-gray-200"
                          >
                            <div class="overflow-x-auto">
                              <table class="min-w-full">
                                <thead class="bg-gray-900">
                                  <tr>
                                    <th
                                      class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                    >
                                      {{ translate('ID:') }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="bg-gray-900 divide-y divide-gray-200">
                                  <tr>
                                    <td
                                      class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                    >
                                      {{ component.id }}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <div class="overflow-x-auto">
                              <table class="min-w-full">
                                <thead class="bg-gray-900">
                                  <tr>
                                    <th
                                      class="border-0 px-6 py-3 text-left text-xs text-gray-100 font-normal border-solid border-t border-gray-200"
                                    >
                                      {{ translate('Title:') }}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody class="bg-gray-900 divide-y divide-gray-200">
                                  <tr>
                                    <td
                                      class="px-6 py-3 text-left text-xs text-gray-100 font-normal whitespace-pre-line"
                                    >
                                      {{ component.title }}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                          <div class="overflow-x-auto">
                            <table class="min-w-full">
                              <thead class="bg-gray-900">
                                <tr>
                                  <th
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                  >
                                    {{ translate('HTML Code:') }}
                                  </th>
                                </tr>
                              </thead>
                              <tbody class="bg-gray-900 divide-y divide-gray-200">
                                <tr>
                                  <td
                                    class="px-6 py-3 text-left text-xs text-gray-100 font-normal"
                                  >
                                    <pre
                                      class="text-xs text-gray-100 whitespace-pre-wrap font-sans flex items-start justify-left"
                                    >
                              <code class="font-sans w-full" v-html="prettifyHtml(component.html_code)"></code>
                            </pre>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Code Block Component - end-->
            </div>
          </div>
        </div>
      </div>
      <!-- viewHTMLConfig end -->
    </div>
  </div>
</template>

<style>
.html-tag {
  color: #ff79c6;
}
.html-attribute {
  color: #50fa7b;
}
.html-value {
  color: #f1fa8c;
}
</style>
