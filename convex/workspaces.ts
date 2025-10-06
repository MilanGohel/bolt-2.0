import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateWorkspace = mutation({
    args: {
        name: v.string(),
        messages: v.any(),
        fileData: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthenticated");
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