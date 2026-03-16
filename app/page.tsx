"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Mic, BarChart3, Zap, Play, Star } from "lucide-react"

export default function Page() {
  return (
    <div className="flex flex-col">
      <section className="relative px-6 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10 container">
          <Badge variant="secondary" className="mb-6">
            <Zap className="mr-1 h-3 w-3" />
            AI-Powered Interview Practice
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
            Master Your Interview Skills
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Practice with AI-powered interviews. Get real-time feedback on your
            responses, confidence, and communication skills.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/interview">
              <Button size="lg" className="h-12 px-8 text-base">
                <Play className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="container">
          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Video className="h-6 w-6" />}
              title="Real-Time Analysis"
              description="AI analyzes your facial expressions and body language during practice."
            />
            <FeatureCard
              icon={<Mic className="h-6 w-6" />}
              title="Voice Assessment"
              description="Get feedback on speech clarity, tone, and confidence levels."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6" />}
              title="Detailed Reports"
              description="Track progress with comprehensive analytics and improvement tips."
            />
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-6 py-16">
        <div className="container">
          <Card className="mx-auto max-w-3xl border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="px-8 py-12 text-center">
              <h2 className="mb-4 text-2xl font-bold md:text-3xl">
                Ready to Practice?
              </h2>
              <p className="mx-auto mb-6 max-w-lg text-muted-foreground">
                Start your first interview practice session now. No signup
                required.
              </p>
              <Link href="/interview">
                <Button size="lg" className="h-11 px-8">
                  <Zap className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="container">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Real-time Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Industry Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Detailed Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>24/7 Available</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-6 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
