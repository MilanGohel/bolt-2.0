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
        fileData: v.optional(v.any()),
        ownerId: v.string()
    }).index("by_ownerId", ["ownerId"]),
})