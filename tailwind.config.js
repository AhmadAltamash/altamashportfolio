/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			backdropBlur: {
				sm: '4px',
			  },
			// Theme text colors backed by RGB-channel CSS variables so opacity
			// modifiers (e.g. text-text-primary/70) actually work. A plain
			// `text-[var(--text-primary)]/70` can't be resolved by Tailwind at
			// build time because var() isn't a color format it can parse for
			// alpha — these named utilities fix that.
			colors: {
				'text-primary': 'rgb(var(--text-primary-rgb) / <alpha-value>)',
				'text-secondary': 'rgb(var(--text-secondary-rgb) / <alpha-value>)',
			},
		  },
		},
	plugins: [],
}
