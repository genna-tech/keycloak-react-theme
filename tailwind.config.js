/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors"

const primaryColors = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#7c3aed',
  300: '#6d28d9',
  500: '#5b21b6',
  600: '#4c1d95',
  700: '#31254c',
}

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: primaryColors,
        secondary: colors.gray,
        provider: {
          apple: '#000000',
          bitbucket: '#0052CC',
          discord: '#5865F2',
          facebook: '#1877F2',
          github: '#181717',
          gitlab: '#FC6D26',
          google: '#4285F4',
          instagram: '#E4405F',
          linkedin: '#0A66C2',
          microsoft: '#5E5E5E',
          oidc: '#F78C40',
          openshift: '#EE0000',
          paypal: '#00457C',
          slack: '#4A154B',
          stackoverflow: '#F58025',
          twitter: '#1DA1F2',
        }
      }
    },
  },
  plugins: [],
}

