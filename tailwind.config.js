/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        button: {
          pink: "#E44195",
        },
        text: {
          pink: "#DD127A",
          gray: "#565656",
        },
        border: {
          gray: "#79747E",
        },
        placeholder: {
          gray: "#757575",
        },
      },
    },
  },
  plugins: [],
};
