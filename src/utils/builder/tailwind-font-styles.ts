interface TailwindFontStyles {
  fontWeight: string[]
  fontFamily: string[]
  fontStyle: string[]
}

const tailwindFontStyles: TailwindFontStyles = {
  fontWeight: [
    'none',
    'font-thin',
    'font-extralight',
    'font-light',
    'font-normal',
    'font-medium',
    'font-bold',
    'font-extrabold',
    'font-black',
  ],
  fontFamily: [
    'none',
    'font-sans',
    'font-serif',
    'font-mono',
    'font-arial',
    'font-helvetica',
    'font-georgia',
    'font-times',
    'font-times-new-roman',
    'font-courier',
    'font-courier-new',
    'font-verdana',
    'font-tahoma',
    'font-trebuchet',
    'font-garamond',
    'font-palantino',
    'font-bookman',
    'font-comic-sans',
    'font-impact',
    'font-lucida',
    'font-lucida-console',
    'font-lucida-sans',
    'font-candara',
    'font-optima',
    'font-avenir',
    'font-futura',
    'font-calibri',
    'font-cambria',
    'font-didot',
    'font-franklin-gothic',
    'font-rockwell',
    'font-baskerville',
  ],
  fontStyle: ['none', 'italic', 'non-italic'],
}

export default tailwindFontStyles
