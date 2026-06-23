interface ComponentHelper {
  html_code: string
  id: string | null
  title: string
  icon: string
}

const componentHelpers: ComponentHelper[] = [
  {
    html_code: `
    <section>
    <div class="md:pt-4 md:pb-4 pt-4 pb-4 lg:px-4 px-2">
    <div class="mx-auto max-w-7xl">
    <div>
    <p>
    Start customizing by editing this default text directly in the editor.
    </p>
    </div>
    </div>
    </div>
    </section>`,
    id: null,
    title: 'Text',
    icon: `
    <span class="material-symbols-outlined">
    text_fields
    </span>
    `,
  },
  {
    html_code: `<section><div class="md:pt-4 md:pb-4 pt-4 pb-4 lg:px-4 px-2"><div class="mx-auto max-w-7xl"><div class="break-words"><h2>Layouts and visual.</h2></div></div></div></section>`,
    id: null,
    title: 'Header H2',
    icon: `
    <span class="material-symbols-outlined">
    format_h2
    </span>
    `,
  },
  {
    html_code: `<section><div class="md:pt-4 md:pb-4 pt-4 pb-4 lg:px-4 px-2"><div class="mx-auto max-w-7xl"><div class="break-words"><h3>Layouts and visual.</h3></div></div></div></section>`,
    id: null,
    title: 'Header H3',
    icon: `
    <span class="material-symbols-outlined">
    format_h3
    </span>
    `,
  },
  {
    html_code: `<section><div class="md:pt-4 md:pb-4 pt-4 pb-4 lg:px-4 px-2"><div class="mx-auto max-w-7xl"><div class="break-words"><h4>Layouts and visual.</h4></div></div></div></section>`,
    id: null,
    title: 'Header H4',
    icon: `
    <span class="material-symbols-outlined">
    format_h3
    </span>
    `,
  },
  {
    html_code: `<section><div class="md:pt-4 md:pb-4 pt-4 pb-4 lg:px-4 px-2"><div class="mx-auto max-w-7xl"><div class="break-words"><h5>Layouts and visual.</h5></div></div></div></section>`,
    id: null,
    title: 'Header H5',
    icon: `
    <span class="material-symbols-outlined">
    format_h3
    </span>
    `,
  },
  {
    html_code: `<section><div class="md:pt-4 md:pb-4 pt-4 pb-4 lg:px-4 px-2"><div class="mx-auto max-w-7xl"><div class="break-words"><h6>Layouts and visual.</h6></div></div></div></section>`,
    id: null,
    title: 'Header H6',
    icon: `
    <span class="material-symbols-outlined">
    format_h3
    </span>
    `,
  },
  {
    html_code: `
    <section>
    <div class="py-4">
    <div class="mx-auto max-w-7xl w-full pt-6 pb-6 bg-gray-100">
    <div id="youtube-video" class="w-full aspect-video p-4">

    <iframe
    frameborder="0" 
    allowfullscreen
    class="w-full aspect-video"
    src="" 
    sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen">
    </iframe>
    </div>
    </div>
    </div>
    </section>`,
    id: null,
    title: 'YouTube Video',
    icon: `
    <span class="material-symbols-outlined">
    play_circle
    </span>
    `,
  },
  {
    html_code: `<section><div class="relative py-8"><div class="absolute inset-0 flex items-center" aria-hidden="true"><div class="w-full border-4 border-gray-800 leading-none"></div></div><div class="relative flex justify-start"></div></div></section>`,
    id: null,
    title: 'Break Divider',
    icon: `
    <span class="material-symbols-outlined">
    horizontal_rule
    </span>
    `,
  },
  {
    html_code: `<section> <div class="w-full md:pt-2 md:pb-2 pt-4 pb-4 lg:px-4 px-2"> <div class="mx-auto max-w-7xl"> <div class="flex justify-start"> <div class="flex items-center font-medium text-white bg-green-600" id="linktree" > <span> <a id="linktree" target="_blank" rel="noopener noreferrer nofollow" href="https://www.google.com" >Link to landing page</a > </span> </div> </div> </div> </div> </section>`,
    id: null,
    title: 'Left Positioned Button',
    icon: `
        <span class="material-symbols-outlined">
        link
        </span>
        `,
  },
  {
    html_code: `<section> <div class="w-full md:pt-2 md:pb-2 pt-4 pb-4 lg:px-4 px-2"> <div class="mx-auto max-w-7xl"> <div class="flex justify-center"> <div class="flex items-center font-medium text-white bg-green-600" id="linktree" > <span> <a id="linktree" target="_blank" rel="noopener noreferrer nofollow" href="https://www.google.com" >Link to landing page</a > </span> </div> </div> </div> </div> </section>`,
    id: null,
    title: 'Centered Button',
    icon: `
        <span class="material-symbols-outlined">
        link
        </span>
        `,
  },
  {
    html_code: `<section> <div class="w-full md:pt-2 md:pb-2 pt-4 pb-4 lg:px-4 px-2"> <div class="mx-auto max-w-7xl"> <div class="flex justify-end"> <div class="flex items-center font-medium text-white bg-green-600" id="linktree" > <span> <a id="linktree" target="_blank" rel="noopener noreferrer nofollow" href="https://www.google.com" >Link to landing page</a > </span> </div> </div> </div> </div> </section>`,
    id: null,
    title: 'Right Positioned Button',
    icon: `
        <span class="material-symbols-outlined">
        link
        </span>
        `,
  },
]

export default componentHelpers
