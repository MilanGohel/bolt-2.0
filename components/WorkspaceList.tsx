"use client"

import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"
import { usePaginatedQuery } from "convex/react"
import { paginationOptsValidator } from "convex/server"
import Link from "next/link"

export default function WorkspaceList() {
  const { user } = useUser()
  if (!user)
    return (
      <div className="p-4 text-sm text-zinc-500">
        Please sign in to view your workspaces.
      </div>
    )

  const {
    isLoading,
    loadMore,
    results: workspaces,
    status,
  } = usePaginatedQuery(
    api.workspaces.GetSidebarWorkspaces,
    {},
    {initialNumItems: 10}
  )

  return (
    <div className="w-full h-full overflow-y-auto bg-transparent text-zinc-900 dark:text-zinc-100">
      <div className="p-2 bg-transparent">
        {isLoading ? (
          <div className="space-y-2 animate-pulse bg-transparent">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-9 rounded-md bg-zinc-200 dark:bg-zinc-800"
              ></div>
            ))}
          </div>
        ) : (
          <div className="space-y-1 bg-transparent">
            {workspaces.map((workspace: any) => (
              <Link href={`/workspace/${workspace._id}`} key={workspace._id}>
                <div
                  className="flex items-center px-3 py-2 rounded-md text-sm cursor-pointer bg-transparent hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="truncate">
                    {workspace.name || "Untitled workspace"}
                  </span>
                </div>
              </Link>
            ))}

            {status === "CanLoadMore" && (
              <button
                onClick={() => loadMore(10)}
                className="w-full mt-2 py-2 text-center text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors bg-transparent"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
