"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Briefcase, Check } from "lucide-react"

interface SetupFormProps {
  jobRole: string
  setJobRole: (role: string) => void
  difficulty: string
  setDifficulty: (difficulty: "easy" | "medium" | "hard") => void
  cvContent: string
  setCvContent: (content: string) => void
  jobDescription: string
  setJobDescription: (desc: string) => void
  interviewType: string
  setInterviewType: (type: "chat" | "video" | "voice") => void
  onStart: () => void
  isProcessing: boolean
}

export function SetupForm({
  jobRole,
  setJobRole,
  difficulty,
  setDifficulty,
  cvContent,
  setCvContent,
  jobDescription,
  setJobDescription,
  interviewType,
  setInterviewType,
  onStart,
  isProcessing,
}: SetupFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await processFile(file)
    }
  }

  const processFile = async (file: File) => {
    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text()
      setCvContent(text)
    } else if (file.type === "application/pdf") {
      setCvContent(
        `[PDF Uploaded: ${file.name}]\n\nNote: Please also paste your resume content in the text area below for best results.`
      )
    } else {
      setCvContent(
        `[File: ${file.name}]\n\nPlease paste your resume/CV content in the text area below.`
      )
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      await processFile(file)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Position
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobRole">Target Job Role</Label>
            <Input
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Frontend Developer, Product Manager"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value as "easy" | "medium" | "hard")
              }
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="easy">Easy - Entry Level</option>
              <option value="medium">Medium - Mid Level</option>
              <option value="hard">Hard - Senior Level</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Your Resume/CV
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
              isDragging ? "border-primary bg-primary/5" : "border-muted"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground">
              Drag and drop your CV/resume here, or
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Supports TXT, PDF, DOC (or paste below)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="cvContent">Or paste your resume content</Label>
            <Textarea
              id="cvContent"
              value={cvContent}
              onChange={(e) => setCvContent(e.target.value)}
              placeholder="Paste your resume/CV content here. Include your skills, experience, education..."
              rows={6}
            />
          </div>
          {cvContent && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Resume content added
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Job Description (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description you're targeting. This helps the AI ask relevant questions..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            The AI will tailor interview questions based on this job
            description.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Interview Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setInterviewType("chat")}
              className={`rounded-lg border-2 p-4 transition-all ${
                interviewType === "chat"
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-muted-foreground"
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Chat</div>
                <div className="text-xs text-muted-foreground">Text only</div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setInterviewType("video")}
              className={`rounded-lg border-2 p-4 transition-all ${
                interviewType === "video"
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-muted-foreground"
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Video</div>
                <div className="text-xs text-muted-foreground">
                  Camera + Voice
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setInterviewType("voice")}
              className={`rounded-lg border-2 p-4 transition-all ${
                interviewType === "voice"
                  ? "border-primary bg-primary/10"
                  : "border-muted hover:border-muted-foreground"
              }`}
            >
              <div className="text-center">
                <div className="font-medium">Voice</div>
                <div className="text-xs text-muted-foreground">Audio only</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      <Button
        onClick={onStart}
        disabled={isProcessing || !jobRole}
        className="w-full"
        size="lg"
      >
        {isProcessing ? "Starting..." : "Start Interview"}
      </Button>
    </div>
  )
}
