import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        picture: v.string(),
        uid: v.string()
    }),
    workspaces: defineTable({
        name: v.string(),
        messages: v.any(),
        files: v.optional(v.any()),
        dependencies: v.optional(v.any()),
        ownerId: v.string(),
        devDependencies: v.optional(v.any()),
        template: v.optional(v.union(v.literal("react-ts"), v.literal("node"))),
    }).index("by_ownerId", ["ownerId"]),
})