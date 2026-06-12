interface ComponentData {
  title: string
  html_code: string
  cover_image: string | null
  category: string
}

interface Themes {
  themes: {
    data: ComponentData[]
  }
}

const component: Themes[] = [
  {
    themes: {
      data: [],
    },
  },
]

export default component
