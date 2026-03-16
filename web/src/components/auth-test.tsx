"use client"

import { useCurrentUser } from "@/hooks/use-current-user"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

export function AuthTest() {
  const { user, isLoading, isAuthenticated } = useCurrentUser()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Authentication Test</h3>
      <div className="space-y-2">
        <p><strong>Status:</strong> {isAuthenticated ? "Authenticated" : "Not authenticated"}</p>
        {user && (
          <>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.name || "Not set"}</p>
          </>
        )}
        {isAuthenticated && (
          <Button onClick={() => signOut()} variant="outline">
            Sign Out
          </Button>
        )}
      </div>
    </div>
  )
}
