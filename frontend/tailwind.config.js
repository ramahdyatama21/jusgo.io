// frontend/tailwind.config.js

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    // Disable problematic vendor prefixes that cause warnings
    textSizeAdjust: false,
    fontSmoothing: false,
  },
  future: {
    // Disable experimental features that might cause warnings
    hoverOnlyWhenSupported: true,
  },
}