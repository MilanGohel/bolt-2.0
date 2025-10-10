import { v } from "convex/values";
import { action, mutation, query } from "./_generated/server";
import { paginationOptsValidator } from "convex/server";
import { GoogleGenAI } from "@google/genai";

export const CreateWorkspace = mutation({
    args: {
        name: v.string(),
        messages: v.any(),
        fileData: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to create a workspace.");
        }
        const workspaceId = await ctx.db.insert("workspaces", {
            name: args.name,
            messages: args.messages,
            fileData: args.fileData,
            ownerId: identity.subject
        });
        return workspaceId;
    }
})

export const GetSidebarWorkspaces = query({
    args: {
        paginationOpts: paginationOptsValidator,
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to get a workspace.");
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
})

export const GetWorkspace = query({
    args: {
        workspaceId: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("You must be logged in to get a workspace.");
        }

        const userId = identity.subject;
        const workspace = await ctx.db.query("workspaces").filter((q) => q.eq(q.field("_id"), args.workspaceId)).first();

        if (!workspace) {
            throw new Error("Workspace not found.");
        }

        if (workspace.ownerId !== userId) {
            throw new Error("You do not have access to this workspace.");
        }

        return workspace;
    }
})

export const GenerateWorkspaceName = action({
    args: {
        prompt: v.string(),
    },
    handler: async (ctx, args) => {
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
                thinkingConfig: {
                    thinkingBudget: 200
                }
            }
        });

        return response.text;
    }
})

