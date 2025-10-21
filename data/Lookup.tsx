import { stripIndents } from "@/utils/stripIndents";

export default {
  DEFAULT_FILES_REACT: {
    "public/index.html": {
      code: stripIndents`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
            <script src="https://cdn.tailwindcss.com/"></script>
        </head>
        <body>
            <div id="root"></div>
        </body>
        </html>`,
    },
    "/App.css": {
      code: stripIndents`@tailwind base;
        @tailwind components;
        @tailwind utilities;

        body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        }`,
    },
    "/tailwind.config.js": {
      code: stripIndents`module.exports = {
        content: ['./src/**/*.{js,jsx,ts,tsx}'],
        theme: {
            extend: {},
        },
        }`,
    },
    "/postcss.config.js": {
      code: stripIndents`module.exports = {
        plugins: ['tailwindcss'],
        }`,
    },
  },
  DEPENDENCIES_REACT: {
    tailwindcss: "^3.4.17",
    "@vitejs/plugin-react": "^4.0.4",
    autoprefixer: "^10.4.16",
    postcss: "^8.4.32",
    react: "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwind-merge": "^3.3.1",
    "tailwind-scrollbar-hide": "^4.0.0",
    uuid: "^13.0.0",
    "react-markdown": "^10.1.0",
    next: "15.5.4",
    "next-themes": "^0.4.6",
    uuid4: "^2.0.3",
    "tailwindcss-animate": "^1.0.7",
    "@google/genai": "^1.23.0",
    axios: "^1.12.2",
    "class-variance-authority": "^0.7.1",
    clsx: "^2.1.1",
    dotenv: "^17.2.3",
    "lucide-react": "^0.544.0",
  },
};
