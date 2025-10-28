import { ConvexError, v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { GoogleGenAI } from "@google/genai";
import { getSystemPrompt } from "@/utils/prompts";
import { getNodeTemplate, getReactTemplate } from "@/lib/utils";

export const CreateWorkspace = mutation({
    args: {
        name: v.string(),
        messages: v.any(),
        fileData: v.optional(v.any()),
        template: v.optional(v.union(v.literal("react-ts"), v.literal("node"))),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: 401, severity: "high", message: "You must be logged in to create a workspace." });
        }

        const workspaceId = await ctx.db.insert("workspaces", {
            name: args.name,
            messages: args.messages,
            files: args.fileData,
            ownerId: identity.subject,
            template: args.template ?? "react-ts"
        });
        return workspaceId;
    }
});

export const GetSidebarWorkspaces = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: 401, severity: "high", message: "You must be logged in to get a workspace." });
        }

        const userId = identity.subject;
        const sidebarWorkspaces = await ctx.db.query("workspaces")
            .filter((q) => q.eq(q.field("ownerId"), userId))
            .order("desc")
            .paginate(args.paginationOpts);

        return {
            page: sidebarWorkspaces.page.map((workspace) => ({
                _id: workspace._id,
                name: workspace.name,
            })),
            isDone: sidebarWorkspaces.isDone,
            continueCursor: sidebarWorkspaces.continueCursor,
        };
    }
});

export const GetWorkspace = query({
    args: {
        workspaceId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: 401, severity: "high", message: "You must be logged in to get a workspace." });
        }

        const userId = identity.subject;
        const workspace = await ctx.db.query("workspaces").filter((q) => q.eq(q.field("_id"), args.workspaceId)).first();

        if (!workspace) {
            throw new ConvexError({ code: 404, severity: "high", message: "Workspace not found." });
        }

        if (workspace.ownerId !== userId) {
            throw new ConvexError({ code: 403, severity: "high", message: "You do not have access to this workspace." });
        }

        return workspace;
    }
});

export const GenerateWorkspaceName = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: args.prompt,
                config: {
                    maxOutputTokens: 300,
                    systemInstruction: {
                        role: "model",
                        parts: [
                            {
                                text: "Based on the prompt, generate a concise and descriptive name for a coding workspace (maximum 5 words). Respond with only the name itself — do not include explanations, examples, or any additional text."
                            }
                        ]
                    },
                    thinkingConfig: { thinkingBudget: 200 }
                }
            });

            return response.text;
        } catch (error) {
            throw new ConvexError({
                code: 500,
                severity: "high",
                message: "Internal server error"
            });
        }
    }
});

export const UpdateWorkspaceMessages = mutation({
    args: {
        workspaceId: v.string(),
        messages: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: 401, severity: "high", message: "You must be logged in to update a workspace." });
        }

        const workspace = await ctx.db.query("workspaces").filter((q) => q.eq(q.field("_id"), args.workspaceId)).first();

        if (!workspace) {
            throw new ConvexError({ code: 404, severity: "high", message: "Workspace not found." });
        }

        if (workspace.ownerId !== identity.subject) {
            throw new ConvexError({ code: 403, severity: "high", message: "You do not have access to update this workspace." });
        }

        await ctx.db.patch(workspace._id, { messages: args.messages });
    }
});

export const UpdateWorkspaceFileData = mutation({
    args: {
        workspaceId: v.string(),
        fileData: v.any(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: 401, severity: "low", message: "Not authenticated." });
        }

        const workspace = await ctx.db.query("workspaces").filter((q) => q.eq(q.field("_id"), args.workspaceId)).first();
        if (!workspace) {
            throw new ConvexError({ code: 404, severity: "medium", message: "Workspace not found." });
        }

        if (workspace.ownerId !== identity.subject) {
            throw new ConvexError({ code: 403, severity: "medium", message: "Access denied for this workspace." });
        }

        await ctx.db.patch(workspace._id, { files: args.fileData.files, dependencies: args.fileData.dependencies, devDependencies: args.fileData.devDependencies??{} });
    }
});

export const GenerateAIResponse = action({
    args: {
        prompt: v.string(),
        history: v.any(),
    },
    handler: async (ctx, { prompt, history }) => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            // const chat = ai.chats.create({
            //     model: "gemini-2.5-flash",
            //     config: {
            //         systemInstruction: {
            //             role: "model",
            //             parts: [
            //                 {
            //                     text: getSystemPrompt()
            //                 }
            //             ]
            //         },
            //     },
            //     history: history
            // });

            // const response = await chat.sendMessage({
            //     message: prompt,
            // })

            // return response.text;

            const response = {
                "files": {
                    "index.tsx": {
                        "code": "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nconst root = ReactDOM.createRoot(\n  document.getElementById('root') as HTMLElement\n);\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);\n"
                    },
                    "App.tsx": {
                        "code": "import React, { useState } from 'react';\nimport TodoItem from './TodoItem';\n\ninterface Todo {\n  id: number;\n  text: string;\n  completed: boolean;\n}\n\nfunction App() {\n  const [todos, setTodos] = useState<Todo[]>([]);\n  const [newTodoText, setNewTodoText] = useState<string>('');\n\n  const handleAddTodo = () => {\n    if (newTodoText.trim() === '') return;\n    const newTodo: Todo = {\n      id: Date.now(),\n      text: newTodoText.trim(),\n      completed: false,\n    };\n    setTodos((prevTodos) => [...prevTodos, newTodo]);\n    setNewTodoText('');\n  };\n\n  const handleToggleComplete = (id: number) => {\n    setTodos((prevTodos) =>\n      prevTodos.map((todo) =>\n        todo.id === id ? { ...todo, completed: !todo.completed } : todo\n      )\n    );\n  };\n\n  const handleDeleteTodo = (id: number) => {\n    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));\n  };\n\n  return (\n    <div className=\"min-h-screen bg-gray-100 flex items-center justify-center p-4\">\n      <div className=\"bg-white shadow-md rounded-lg p-6 w-full max-w-md\">\n        <h1 className=\"text-3xl font-bold text-center text-gray-800 mb-6\">Todo App</h1>\n        <div className=\"flex mb-4\">\n          <input\n            type=\"text\"\n            className=\"flex-grow border border-gray-300 rounded-l-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500\"\n            placeholder=\"Add a new todo...\"\n            value={newTodoText}\n            onChange={(e) => setNewTodoText(e.target.value)}\n            onKeyPress={(e) => {\n              if (e.key === 'Enter') {\n                handleAddTodo();\n              }\n            }}\n          />\n          <button\n            onClick={handleAddTodo}\n            className=\"bg-blue-600 text-white p-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500\"\n          >\n            Add\n          </button>\n        </div>\n        <ul className=\"space-y-3\">\n          {todos.map((todo) => (\n            <TodoItem\n              key={todo.id}\n              todo={todo}\n              onToggleComplete={handleToggleComplete}\n              onDeleteTodo={handleDeleteTodo}\n            />\n          ))}\n        </ul>\n        {todos.length === 0 && (\n          <p className=\"text-center text-gray-500 mt-6\">No todos yet! Add some above.</p>\n        )}\n      </div>\n    </div>\n  );\n}\n\nexport default App;\n"
                    },
                    "TodoItem.tsx": {
                        "code": "import React from 'react';\n\ninterface Todo {\n  id: number;\n  text: string;\n  completed: boolean;\n}\n\ninterface TodoItemProps {\n  todo: Todo;\n  onToggleComplete: (id: number) => void;\n  onDeleteTodo: (id: number) => void;\n}\n\nconst TodoItem: React.FC<TodoItemProps> = ({ todo, onToggleComplete, onDeleteTodo }) => {\n  return (\n    <li className=\"flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm\">\n      <div className=\"flex items-center\">\n        <input\n          type=\"checkbox\"\n          checked={todo.completed}\n          onChange={() => onToggleComplete(todo.id)}\n          className=\"form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500\"\n        />\n        <span className={\`ml-3 text-lg \${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}\`}>\n          {todo.text}\n        </span>\n      </div>\n      <button\n        onClick={() => onDeleteTodo(todo.id)}\n        className=\"ml-4 px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500\"\n      >\n        Delete\n      </button>\n    </li>\n  );\n};\n\nexport default TodoItem;\n"
                    },
                    "index.css": {
                        "code": "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
                    },
                    "tailwind.config.js": {
                        "code": "/** @type {import('tailwindcss').Config} */\nmodule.exports = {\n  content: [\n    \"./index.html\",\n    \"./src/**/*.{js,ts,jsx,tsx}\"\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n}\n"
                    },
                    "postcss.config.js": {
                        "code": "module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n"
                    }
                },
                "dependencies": {
                    "react": "^18.2.0",
                    "react-dom": "^18.2.0",
                    "@types/react": "^18.2.0",
                    "@types/react-dom": "^18.2.0",
                    "typescript": "^5.0.0",
                    "tailwindcss": "^3.0.0",
                    "autoprefixer": "^10.0.0",
                    "postcss": "^8.0.0"
                },
                "projectTitle": "React TypeScript Todo App",
                "explanation": "A simple todo application built with React and TypeScript, featuring adding, toggling completion, and deleting todos. Styled with Tailwind CSS for a modern look."
            }
            return response;
        }
        catch (err) {
            console.log("Error generating AI response:", err);
            throw new ConvexError(err instanceof Error ? err.message : "Internal server error");
        }
    }
});

export const SetWorkspaceTemplateFiles = mutation({
    args: {
        workspaceId: v.string(),
        template: v.union(v.literal("react-ts"), v.literal("node")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new ConvexError({ code: 401, severity: "high", message: "You must be logged in to update a workspace." });
        }

        const workspace = await ctx.db.query("workspaces").filter((q) => q.eq(q.field("_id"), args.workspaceId)).first();
        if (!workspace) {
            throw new ConvexError({ code: 404, severity: "high", message: "Workspace not found." });
        }

        if (workspace.ownerId !== identity.subject) {
            throw new ConvexError({ code: 403, severity: "high", message: "You do not have access to update this workspace." });
        }
        if (args.template === "react-ts") {
            workspace.files = getReactTemplate().files;
            workspace.dependencies = getReactTemplate().dependencies;
            workspace.template = args.template;
        }
        else if (args.template === "node") {
            workspace.files = getNodeTemplate().files;
            workspace.dependencies = getNodeTemplate().dependencies;
            workspace.template = args.template;
        }
        await ctx.db.patch(workspace._id, { files: workspace.files, dependencies: workspace.dependencies, template: workspace.template });
    }
})

export const classifyProjectType = action({
    args: { prompt: v.string() },
    handler: async (ctx, { prompt }) => {
        try {
            return "react-ts";
            //   const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            //   const response = await ai.models.generateContent({
            //     model: "gemini-2.5-flash",
            //     contents: prompt,
            //     config: {
            //       maxOutputTokens: 200,
            //       thinkingConfig: { thinkingBudget: 500 },
            //       systemInstruction: `
            //       You are a strict classifier. 
            //       Read the user's project prompt carefully.
            //       Return only one word: "react-ts" or "node" — based on what kind of project the user most likely wants to create.
            //       Do not explain or output anything else.
            //       Examples:
            //       - "create a todo app" → react-ts
            //       - "build an api server" → node
            //       - "react dashboard" → react-ts
            //       - "express backend" → node
            //       - "fullstack app with react frontend" → react-ts
            //       Output must be exactly one word: either "react-ts" or "node".
            //       `,
            //     },
            //   });
            //   const text = response.text;
            //   if(!text) throw new ConvexError("No response from AI");
            //   if (text.includes("react-ts")) return "react-ts";
            //   if (text.includes("node")) return "node";
            //   throw new ConvexError("No matching template found.");
        } catch (err) {
            throw new ConvexError("Internal server error");
        }
    }
});