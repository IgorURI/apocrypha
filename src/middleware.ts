import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { type UserMetadata } from "./lib/types"

const isPublicRoute = createRouteMatcher(["/api/cron(.*)", "/sign-in(.*)", "/sign-up(.*)"])

const isAdminRoute = createRouteMatcher(["/admin(.*)", "/api/admin(.*)"])

export default clerkMiddleware((auth, request) => {
    if (!isPublicRoute(request)) {
        auth().protect()

        if (isAdminRoute(request)) {
            const { sessionClaims } = auth()
            const userMetadata = sessionClaims?.metadata as UserMetadata | undefined
            if (!userMetadata?.isAdmin) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
            }
        }
    }
})

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
}
