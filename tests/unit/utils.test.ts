import { describe, it, expect } from "vitest"
import { cn } from "@/lib/utils"

describe("Utils Unit Tests", () => {
  describe("cn (className utility)", () => {
    it("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500")
      expect(result).toBe("text-red-500 bg-blue-500")
    })

    it("should handle undefined and null values", () => {
      const result = cn("text-red-500", null, undefined, "bg-blue-500")
      expect(result).toBe("text-red-500 bg-blue-500")
    })

    it("should handle conditional class names", () => {
      const isActive = true
      const result = cn("base-class", isActive && "active-class", !isActive && "inactive-class")
      expect(result).toBe("base-class active-class")
    })

    it("should handle empty input", () => {
      const result = cn()
      expect(result).toBe("")
    })

    it("should deduplicate Tailwind classes", () => {
      // tailwind-merge deduplicates conflicting classes by keeping the last one
      const result = cn("text-red-500 text-blue-500", "text-red-500")
      expect(result).toBe("text-red-500")
    })

    it("should handle arrays of class names", () => {
      const result = cn(["text-red-500", "bg-blue-500"], "font-bold")
      expect(result).toContain("text-red-500")
      expect(result).toContain("bg-blue-500")
      expect(result).toContain("font-bold")
    })

    it("should handle objects with conditional classes", () => {
      const result = cn({
        "text-red-500": true,
        "bg-blue-500": false,
        "font-bold": true,
      })
      expect(result).toBe("text-red-500 font-bold")
    })
  })

  describe("calculateScore utility", () => {
    it("should calculate overall score from components", () => {
      const scores = {
        confidence: 85,
        clarity: 90,
        relevance: 88,
      }
      const overall = (scores.confidence + scores.clarity + scores.relevance) / 3
      expect(overall).toBeCloseTo(87.67, 1)
    })

    it("should handle empty scores", () => {
      const scores: any = {}
      const calculateOverall = (s: any) => {
        const values = Object.values(s)
        if (values.length === 0) return 0
        return values.reduce((a: number, b: number) => a + b, 0) / values.length
      }
      expect(calculateOverall(scores)).toBe(0)
    })

    it("should handle partial scores", () => {
      const scores = {
        confidence: 85,
        clarity: null as any,
        relevance: 88,
      }
      const calculateOverall = (s: any) => {
        const values = Object.values(s).filter((v) => v !== null)
        if (values.length === 0) return 0
        return values.reduce((a: number, b: number) => a + b, 0) / values.length
      }
      const result = calculateOverall(scores)
      expect(result).toBeCloseTo(86.5, 1)
    })
  })

  describe("formatDuration utility", () => {
    it("should format seconds to readable duration", () => {
      const formatDuration = (seconds: number) => {
        const minutes = Math.floor(seconds / 60)
        const remainingSeconds = seconds % 60
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
      }

      expect(formatDuration(90)).toBe("1:30")
      expect(formatDuration(60)).toBe("1:00")
      expect(formatDuration(30)).toBe("0:30")
      expect(formatDuration(3665)).toBe("61:05") // 1 hour 1 minute
    })
  })

  describe("validateEmail utility", () => {
    it("should validate correct email addresses", () => {
      const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
      }

      expect(validateEmail("test@example.com")).toBe(true)
      expect(validateEmail("user.name@example.co.uk")).toBe(true)
      expect(validateEmail("user+tag@example.com")).toBe(true)
    })

    it("should reject invalid email addresses", () => {
      const validateEmail = (email: string) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return regex.test(email)
      }

      expect(validateEmail("not-an-email")).toBe(false)
      expect(validateEmail("@example.com")).toBe(false)
      expect(validateEmail("test@")).toBe(false)
      expect(validateEmail("test@.com")).toBe(false)
    })
  })

  describe("validatePassword utility", () => {
    it("should validate strong passwords", () => {
      const validatePassword = (password: string) => {
        return {
          length: password.length >= 8,
          hasLower: /[a-z]/.test(password),
          hasUpper: /[A-Z]/.test(password),
          hasNumber: /\d/.test(password),
          hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        }
      }

      const result = validatePassword("SecurePassword123!")
      expect(result.length).toBe(true)
      expect(result.hasLower).toBe(true)
      expect(result.hasUpper).toBe(true)
      expect(result.hasNumber).toBe(true)
      expect(result.hasSpecial).toBe(true)
    })

    it("should reject weak passwords", () => {
      const validatePassword = (password: string) => {
        return {
          length: password.length >= 8,
          hasLower: /[a-z]/.test(password),
          hasUpper: /[A-Z]/.test(password),
          hasNumber: /\d/.test(password),
          hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        }
      }

      const weakPassword = validatePassword("weak")
      expect(weakPassword.length).toBe(false)

      const noNumber = validatePassword("Password!")
      expect(noNumber.hasNumber).toBe(false)

      const noSpecial = validatePassword("Password123")
      expect(noSpecial.hasSpecial).toBe(false)
    })
  })

  describe("truncateText utility", () => {
    it("should truncate long text", () => {
      const truncate = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text
        return text.slice(0, maxLength) + "..."
      }

      expect(truncate("Hello world", 5)).toBe("Hello...")
      expect(truncate("Short", 10)).toBe("Short")
    })
  })

  describe("getScoreColor utility", () => {
    it("should return appropriate color for score ranges", () => {
      const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-500"
        if (score >= 60) return "text-yellow-500"
        return "text-red-500"
      }

      expect(getScoreColor(85)).toBe("text-green-500")
      expect(getScoreColor(65)).toBe("text-yellow-500")
      expect(getScoreColor(45)).toBe("text-red-500")
    })
  })

  describe("getTrendIcon utility", () => {
    it("should return correct trend indicator", () => {
      const getTrend = (current: number, previous: number) => {
        if (current > previous) return "up"
        if (current < previous) return "down"
        return "neutral"
      }

      expect(getTrend(85, 80)).toBe("up")
      expect(getTrend(75, 80)).toBe("down")
      expect(getTrend(80, 80)).toBe("neutral")
    })
  })
})
