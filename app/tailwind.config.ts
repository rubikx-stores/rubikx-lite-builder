import type { Config } from 'tailwindcss'

export default {
  content: [],
  theme: {
    extend: {
      colors: {
        myPrimaryBrandColor: '#000000',
        myPrimaryLinkColor: '#16a34a',
        myPrimaryLightGrayColor: '#eff2f6',
        myPrimaryLightMediumGrayColor: '#dee6f0',
        myPrimaryMediumGrayColor: '#9ca3af',
        myPrimaryDarkGrayColor: '#111827',
        myPrimaryErrorColor: '#d60000',
        myPrimarySuccesColor: '#16a34a',
      },
    },
  },
  plugins: [],
} satisfies Config
