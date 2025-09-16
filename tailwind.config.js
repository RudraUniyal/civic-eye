/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Enhanced Civic Eye Color Palette
        'civic': {
          // Primary Brand Colors
          'primary': '#2563EB',    // Vibrant blue for CTAs
          'primary-dark': '#1D4ED8',
          'primary-light': '#3B82F6',
          
          // Secondary Accent Colors
          'accent': '#10B981',     // Success green
          'accent-orange': '#F59E0B', // Warning/attention orange
          'accent-purple': '#8B5CF6', // Innovation purple
          
          // Sophisticated Neutrals
          'slate': '#1E293B',     // Deep slate for headers
          'slate-light': '#334155',
          'gray': '#64748B',      // Mid-tone text
          'gray-light': '#94A3B8',
          'gray-lighter': '#CBD5E1',
          'gray-bg': '#F1F5F9',   // Light background
          
          // Warm Neutrals
          'cream': '#FEF7ED',     // Warm background
          'sand': '#F5F5DC',      // Section dividers
          'beige': '#E5E7EB',     // Subtle elements
          
          // Status Colors
          'success': '#10B981',
          'warning': '#F59E0B',
          'error': '#EF4444',
          'info': '#3B82F6',
        },
      },
    },
  },
  plugins: [],
}