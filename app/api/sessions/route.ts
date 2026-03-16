import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // No auth check - get all sessions for demo
    const sessions = await prisma.interviewSession.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ sessions })
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
