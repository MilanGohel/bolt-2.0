import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const CreateUser = mutation({
    args: {
        name: v.string(),
        uid: v.string(),
        email: v.string(),
        picture: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), args.email)).first();
        if(!user){
            const result = await ctx.db.insert("users", {
                name: args.name,
                email: args.email,
                picture: args.picture,
                uid: args.uid,
            })

            return result;
        }
        return user;
    }
})

export const GetUser = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.query("users").filter((q) => q.eq(q.field("email"), args.email)).first();
        return user;
    }
})