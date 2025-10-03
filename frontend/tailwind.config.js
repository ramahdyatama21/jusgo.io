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
  // Override Tailwind's base styles to remove vendor prefixes
  important: true,
}