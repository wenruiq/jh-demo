/**
 * Realistic AI streaming simulation utilities
 *
 * Simulates the experience of modern AI chat applications with:
 * - Initial "thinking" delay before streaming begins
 * - Token/word-based streaming (not character-by-character)
 * - Variable speed based on content type
 * - Natural pauses at punctuation and paragraph breaks
 * - Gradual acceleration (starts slower, speeds up)
 */

export interface StreamOptions {
  /** Initial delay before streaming starts (simulates AI "thinking") */
  thinkingDelay?: number
  /** Base delay between tokens in ms */
  baseTokenDelay?: number
  /** Minimum delay between tokens */
  minTokenDelay?: number
  /** Maximum delay between tokens */
  maxTokenDelay?: number
  /** Extra delay at sentence endings (.!?) */
  sentenceEndDelay?: number
  /** Extra delay at paragraph breaks */
  paragraphDelay?: number
  /** Whether to accelerate over time */
  accelerate?: boolean
  /** Callback when thinking phase starts */
  onThinkingStart?: () => void
  /** Callback when streaming phase starts */
  onStreamStart?: () => void
}

const DEFAULT_OPTIONS: Required<Omit<StreamOptions, "onThinkingStart" | "onStreamStart">> = {
  thinkingDelay: 1200,
  baseTokenDelay: 12,
  minTokenDelay: 5,
  maxTokenDelay: 25,
  sentenceEndDelay: 40,
  paragraphDelay: 60,
  accelerate: true,
}

// Regex patterns for content analysis (top-level for performance)
const SENTENCE_END_PATTERN = /[.!?]$/
const WHITESPACE_SPLIT_PATTERN = /(\s+)/
const TABLE_ROW_PATTERN = /^\|.*\|$/

/**
 * Simple tokenizer that splits text into streamable chunks
 * Preserves whitespace and handles special markdown elements
 */
function tokenize(text: string): string[] {
  const lines = text.split("\n")
  const tokens: string[] = []

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx]

    // Handle table rows as single tokens (stream faster)
    if (TABLE_ROW_PATTERN.test(line)) {
      tokens.push(line)
    } else {
      // Split by whitespace, keeping the whitespace
      const parts = line.split(WHITESPACE_SPLIT_PATTERN)
      for (const part of parts) {
        if (part) {
          tokens.push(part)
        }
      }
    }

    // Add newline between lines (but not after the last line)
    if (lineIdx < lines.length - 1) {
      tokens.push("\n")
    }
  }

  return tokens
}

/**
 * Calculate delay for a given token based on content and position
 */
function getTokenDelay(
  token: string,
  index: number,
  total: number,
  options: Required<Omit<StreamOptions, "onThinkingStart" | "onStreamStart">>
): number {
  let delay = options.baseTokenDelay

  // Add randomness for natural feel (±30%)
  const randomFactor = 0.7 + Math.random() * 0.6
  delay *= randomFactor

  // Acceleration: start slower, speed up over time
  if (options.accelerate) {
    const progress = index / total
    // Start at 1.5x speed, accelerate to 0.6x by the end
    const accelerationFactor = 1.5 - progress * 0.9
    delay *= accelerationFactor
  }

  // Extra delay at sentence endings
  if (SENTENCE_END_PATTERN.test(token.trim())) {
    delay += options.sentenceEndDelay * (0.7 + Math.random() * 0.6)
  }

  // Extra delay at paragraph breaks
  if (token === "\n" && index > 0) {
    delay += options.paragraphDelay * 0.5
  }

  // Faster for table rows
  if (TABLE_ROW_PATTERN.test(token)) {
    delay *= 0.3
  }

  // Clamp to min/max
  return Math.max(options.minTokenDelay, Math.min(options.maxTokenDelay, delay))
}

export interface StreamController {
  /** Stop the stream */
  stop: () => void
  /** Promise that resolves when streaming completes */
  promise: Promise<void>
}

/**
 * Simulate realistic AI streaming
 *
 * @param text - The full text to stream
 * @param onUpdate - Callback called with accumulated text as it streams
 * @param onComplete - Optional callback when streaming completes
 * @param options - Streaming configuration options
 * @returns Controller object with stop() method and completion promise
 */
export function simulateRealisticStream(
  text: string,
  onUpdate: (text: string) => void,
  onComplete?: () => void,
  options: StreamOptions = {}
): StreamController {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const tokens = tokenize(text)

  let stopped = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const stop = (): void => {
    stopped = true
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const promise = new Promise<void>((resolve) => {
    // Start with thinking delay
    options.onThinkingStart?.()

    timeoutId = setTimeout(() => {
      if (stopped) {
        resolve()
        return
      }

      options.onStreamStart?.()
      let currentIndex = 0
      let accumulated = ""

      const streamNext = (): void => {
        if (stopped || currentIndex >= tokens.length) {
          if (!stopped) {
            onComplete?.()
          }
          resolve()
          return
        }

        accumulated += tokens[currentIndex]
        onUpdate(accumulated)

        const delay = getTokenDelay(tokens[currentIndex], currentIndex, tokens.length, opts)
        currentIndex++

        timeoutId = setTimeout(streamNext, delay)
      }

      streamNext()
    }, opts.thinkingDelay)
  })

  return { stop, promise }
}

/**
 * Simpler streaming for short texts (like polish dialog)
 * Uses faster settings optimized for quick feedback
 */
export function simulateQuickStream(
  text: string,
  onUpdate: (text: string) => void,
  onComplete?: () => void
): StreamController {
  return simulateRealisticStream(text, onUpdate, onComplete, {
    thinkingDelay: 800,
    baseTokenDelay: 8,
    minTokenDelay: 4,
    maxTokenDelay: 20,
    sentenceEndDelay: 25,
    paragraphDelay: 40,
    accelerate: true,
  })
}

/**
 * Word-by-word streaming for inline AI responses
 * Good for shorter responses like AI check results
 */
export function simulateWordStream(
  text: string,
  onUpdate: (text: string) => void,
  onComplete?: () => void,
  thinkingDelay = 500
): StreamController {
  const words = text.split(WHITESPACE_SPLIT_PATTERN)
  let stopped = false
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const stop = (): void => {
    stopped = true
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  const promise = new Promise<void>((resolve) => {
    timeoutId = setTimeout(() => {
      if (stopped) {
        resolve()
        return
      }

      let currentIndex = 0
      let accumulated = ""

      const streamNext = (): void => {
        if (stopped || currentIndex >= words.length) {
          if (!stopped) {
            onComplete?.()
          }
          resolve()
          return
        }

        accumulated += words[currentIndex]
        onUpdate(accumulated)
        currentIndex++

        // Variable delay: 15-40ms per word with slight acceleration
        const progress = currentIndex / words.length
        const baseDelay = 25 - progress * 10 // 25ms down to 15ms
        const delay = baseDelay + Math.random() * 15

        timeoutId = setTimeout(streamNext, delay)
      }

      streamNext()
    }, thinkingDelay)
  })

  return { stop, promise }
}
