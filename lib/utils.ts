import { stripIndents } from "@/utils/stripIndents";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function getReactTemplate() {
  return {
    files: {
      "public/index.html": {
        code: stripIndents`
          <!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>React App</title>
              <script src="https://cdn.tailwindcss.com/"></script>
          </head>
          <body>
              <div id="root"></div>
          </body>
          </html>
        `,
      },
      "App.tsx": {
        code: stripIndents`
          import React from 'react';

          const App: React.FC = () => {
            return (
              <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <h1 className="text-3xl font-bold text-blue-600">Hello React + TypeScript</h1>
              </div>
            );
          };

          export default App;
        `,
      },
      "index.tsx": {
        code: stripIndents`
          import React from 'react';
          import ReactDOM from 'react-dom/client';
          import App from './App';
          import './styles.css';

          ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
            <React.StrictMode>
              <App />
            </React.StrictMode>
          );
        `,
      },
      "package.json": {
        code: stripIndents`
          {
            "name": "react-ts-template",
            "version": "0.0.0",
            "private": true,
            "scripts": {
              "dev": "vite",
              "build": "tsc && vite build",
              "preview": "vite preview"
            },
            "dependencies": {
              "react": "^18.2.0",
              "react-dom": "^18.2.0"
            },
            "devDependencies": {
              "@types/react": "^18.2.66",
              "@types/react-dom": "^18.2.22",
              "@vitejs/plugin-react-swc": "^3.5.0",
              "typescript": "^5.2.2",
              "vite": "^5.2.0",
              "tailwindcss": "^3.4.1",
              "postcss": "^8.4.38",
              "autoprefixer": "^10.4.19"
            }
          }
        `,
      },
      "styles.css": {
        code: stripIndents`
          @tailwind base;
          @tailwind components;
          @tailwind utilities;

          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        `,
      },
      "tailwind.config.js": {
        code: stripIndents`
          module.exports = {
            content: ['./{src,public}/**/*.{js,jsx,ts,tsx,html}'],
            theme: {
                extend: {},
            },
            plugins: [],
          };
        `,
      },
      "postcss.config.js": {
        code: stripIndents`
          module.exports = {
            plugins: {
              tailwindcss: {},
              autoprefixer: {},
            },
          };
        `,
      },
      "tsconfig.json": {
        code: stripIndents`
          {
            "compilerOptions": {
              "target": "ESNext",
              "lib": ["DOM", "DOM.Iterable", "ESNext"],
              "allowJs": false,
              "skipLibCheck": true,
              "esModuleInterop": true,
              "allowSyntheticDefaultImports": true,
              "strict": true,
              "forceConsistentCasingInFileNames": true,
              "module": "ESNext",
              "moduleResolution": "Node",
              "resolveJsonModule": true,
              "isolatedModules": true,
              "noEmit": true,
              "jsx": "react-jsx",
              "paths": {
                "@/*": ["./src/*"]
              }
            },
            "include": ["src", "App.tsx", "index.tsx", "tailwind.config.js", "postcss.config.js"],
            "references": [{ "path": "./tsconfig.node.json" }]
          }
        `,
      },
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0",
      "typescript": "^5.2.2",
      "@types/react": "^18.2.66",
      "@types/react-dom": "^18.2.22",
      "@vitejs/plugin-react-swc": "^3.5.0",
      "vite": "^5.2.0",
      "tailwindcss": "^3.4.1",
      "postcss": "^8.4.38",
      "autoprefixer": "^10.4.19"
    },
  };
}

// ----------------------------
// Node + TypeScript Template
// ----------------------------
export function getNodeTemplate() {
  return {
    files: {
      "index.js": {
        code: stripIndents`
          const express = require('express');
          const dotenv = require('dotenv');

          dotenv.config();

          const app = express();
          const port = process.env.PORT || 3000;

          app.get('/', (req, res) => {
            res.send('Hello from Node.js Server');
          });

          app.listen(port, () => {
            console.log(\`Server running on http://localhost:\${port}\`);
          });
        `,
      },
      "package.json": {
        code: stripIndents`
          {
            "name": "node-template",
            "version": "1.0.0",
            "description": "A simple Node.js template",
            "main": "index.js",
            "scripts": {
              "start": "node index.js",
              "dev": "nodemon index.js"
            },
            "dependencies": {
              "express": "^4.18.2",
              "dotenv": "^16.4.5"
            },
            "devDependencies": {
              "nodemon": "^3.1.0"
            }
          }
        `,
      },
    },
    dependencies: {
      "express": "^4.18.2",
      "dotenv": "^16.4.5",
      "nodemon": "^3.1.0"
    },
  };
}


export function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<F>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}