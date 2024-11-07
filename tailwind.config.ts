import type { Config } from "tailwindcss"

const {
  default: flattenColorPalette,
} = require("tailwindcss/lib/util/flattenColorPalette")

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: {
          DEFAULT: "var(--input)",
          background: "var(--input-background)",
        },
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        pulse: "var(--pulse)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
          secondary: "var(--destructive-secondary)",
        },
        success: {
          DEFAULT: "var(--success)",
          foreground: "var(--success-foreground)",
          secondary: "var(--success-secondary)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          foreground: "var(--warning-foreground)",
        },
        error: {
          DEFAULT: "var(--error)",
          foreground: "var(--error-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          "DEFAULT": "hsl(var(--sidebar-background))",
          "foreground": "hsl(var(--sidebar-foreground))",
          "primary": "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          "accent": "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          "border": "hsl(var(--sidebar-border))",
          "ring": "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "sparkle": {
          "0%": {
            color: "#8beac1",
          },
          "25%": {
            color: "#9da1b8",
          },
          "50%": {
            color: "#58a8ae",
          },
          "75%": {
            color: "#9da1b8",
          },
          "100%": {
            color: "#8beac1",
          },
        },
        "shine": {
          from: {
            backgroundPosition: "200% 0",
          },
          to: {
            backgroundPosition: "-200% 0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "sparkle": "sparkle 3s ease-in-out infinite",
        "shine": "shine 8s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), addVariablesForColors],
} satisfies Config

export default config

// This plugin adds each Tailwind color as a global CSS variable, e.g. var(--gray-200).
function addVariablesForColors({ addBase, theme }: any) {
  const allColors = flattenColorPalette(theme("colors"))
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  )

  addBase({
    ":root": newVars,
  })
}
