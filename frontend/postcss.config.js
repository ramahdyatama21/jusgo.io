export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Suppress vendor prefix warnings
      ignoreUnknownVersions: true,
      remove: false,
      add: false
    }
  }
}