"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Edit, Trash2, MoreHorizontal, Lock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { ShareButton } from "./share-button"
import { Whiteboard, User } from "@prisma/client"

interface WhiteboardListProps {
  whiteboards: (Whiteboard & { user: Pick<User, "name"> })[]
  showOwner?: boolean
}

export function WhiteboardList({ whiteboards, showOwner = false }: WhiteboardListProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/whiteboards/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete whiteboard")
      }

      router.refresh()
    } catch (error) {
      console.error("Error deleting whiteboard:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (whiteboards.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
          <h2 className="mt-6 text-xl font-semibold">No whiteboards found</h2>
          <p className="mb-8 mt-2 text-center text-sm font-normal leading-6 text-muted-foreground">
            {showOwner
              ? "There are no public whiteboards available at the moment."
              : "You haven&apos;t created any whiteboards yet. Create your first whiteboard to get started."}
          </p>
          {!showOwner && (
            <Link
              href="/whiteboard/new"
              className="relative inline-flex h-9 items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Create a Whiteboard
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {whiteboards.map((whiteboard) => (
          <Card key={whiteboard.id} className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {whiteboard.title}
                    {whiteboard.isPublic ? (
                      <Globe className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    Last updated {formatDistanceToNow(new Date(whiteboard.updatedAt), { addSuffix: true })}
                    {showOwner && ` • By ${whiteboard.user.name}`}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {!showOwner && (
                      <>
                        <Link href={`/whiteboard/${whiteboard.id}/edit`}>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => setDeleteId(whiteboard.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            {!showOwner && (
              <CardFooter className="flex justify-between items-center">
                <ShareButton whiteboardId={whiteboard.id} />
                <Link href={`/whiteboard/${whiteboard.id}`}>
                  <Button variant="secondary">
                    <Edit className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </Link>
              </CardFooter>
            )}
            {showOwner && (
              <CardFooter>
                <Link href={`/whiteboard/${whiteboard.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Open
                  </Button>
                </Link>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the whiteboard and all of its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

