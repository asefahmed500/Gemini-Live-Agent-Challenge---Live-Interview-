import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Video, Mic, BarChart3, Zap, Play, Star } from "lucide-react"

export default function Page() {
  return (
    <div className="w-full">
      {/* Hero Section - Full Width with Centered Content */}
      <section className="relative w-full min-h-[80vh] flex items-center justify-center bg-gradient-to-b from-primary/5 via-background to-background px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative z-10 w-full max-w-5xl mx-auto text-center">
          <Badge variant="secondary" className="mb-6 inline-flex">
            <Zap className="mr-1 h-3 w-3" />
            AI-Powered Interview Practice
          </Badge>
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Master Your Interview Skills
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            Practice with AI-powered interviews. Get real-time feedback on your
            responses, confidence, and communication skills.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/interview" className="w-full sm:w-auto">
              <Button size="lg" className="h-12 w-full sm:w-auto px-8 text-base">
                <Play className="mr-2 h-4 w-4" />
                Start Interview
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="h-12 w-full sm:w-auto px-8 text-base"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section - Full Width */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-20 bg-muted/30">
        <div className="w-full max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our AI-powered platform provides comprehensive feedback on every aspect of your interview performance.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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

      {/* CTA Section - Full Width */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-24">
        <div className="w-full max-w-4xl mx-auto">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="px-8 py-12 sm:px-12 sm:py-16 text-center">
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl md:text-4xl">
                Ready to Practice?
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-muted-foreground text-base sm:text-lg">
                Start your first interview practice session now. No signup
                required.
              </p>
              <Link href="/interview">
                <Button size="lg" className="h-12 px-8 text-base">
                  <Zap className="mr-2 h-4 w-4" />
                  Get Started Free
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Trust Indicators - Full Width */}
      <section className="w-full px-4 sm:px-6 lg:px-8 py-12 bg-muted/20">
        <div className="w-full max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>Real-time Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>Industry Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>Detailed Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
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
    <Card className="border-border/50 hover:border-primary/50 transition-colors h-full">
      <CardContent className="p-6 sm:p-8 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-full bg-primary/10 p-3 text-primary">
          {icon}
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
