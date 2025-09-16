/**
 * Basic AI classification for civic issues
 * MVP implementation uses rule-based classification
 * Can be enhanced with actual ML models later
 */

export interface ClassificationResult {
  category: string
  confidence: number
  reasoning: string
}

const CATEGORY_KEYWORDS = {
  pothole: [
    'pothole', 'hole', 'crack', 'damage', 'asphalt', 'road', 'street', 'pavement',
    'broken', 'damaged', 'surface', 'bump', 'rough'
  ],
  garbage: [
    'trash', 'garbage', 'litter', 'waste', 'dump', 'rubbish', 'debris',
    'bottle', 'can', 'bag', 'dirty', 'mess', 'overflow'
  ],
  streetlight: [
    'light', 'lamp', 'lighting', 'bulb', 'dark', 'broken', 'out', 'dead',
    'flickering', 'electricity', 'power', 'illumination'
  ],
  graffiti: [
    'graffiti', 'tag', 'spray', 'paint', 'vandalism', 'marking', 'writing',
    'drawing', 'wall', 'building', 'defacement'
  ]
}

/**
 * Classify issue based on text analysis (notes, image metadata, etc.)
 */
export function classifyIssueText(text: string): ClassificationResult {
  const normalizedText = text.toLowerCase()
  const scores: Record<string, number> = {}

  // Calculate scores for each category
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    scores[category] = keywords.reduce((score, keyword) => {
      if (normalizedText.includes(keyword)) {
        return score + 1
      }
      return score
    }, 0)
  })

  // Find the highest scoring category
  const bestMatch = Object.entries(scores).reduce((best, [category, score]) => {
    if (score > best.score) {
      return { category, score }
    }
    return best
  }, { category: 'other', score: 0 })

  // Calculate confidence based on score
  const totalKeywords = Object.values(CATEGORY_KEYWORDS).flat().length
  const confidence = Math.min(bestMatch.score / 3, 1) // Normalize to 0-1 range

  return {
    category: confidence > 0.3 ? bestMatch.category : 'other',
    confidence,
    reasoning: confidence > 0.3 
      ? `Detected keywords related to ${bestMatch.category}`
      : 'No clear category detected from text analysis'
  }
}

/**
 * Enhanced classification that could include image analysis
 * For MVP, we'll simulate image analysis
 */
export async function classifyIssue(
  photo: File,
  notes?: string
): Promise<ClassificationResult> {
  // Text-based classification
  const textResult = notes ? classifyIssueText(notes) : null

  // Simulate image analysis (in real implementation, this would call an ML API)
  const imageResult = await simulateImageClassification(photo)

  // Combine results (prioritize image analysis if available)
  if (imageResult.confidence > 0.5) {
    return imageResult
  } else if (textResult && textResult.confidence > 0.3) {
    return textResult
  } else {
    // Default to most common category with low confidence
    return {
      category: 'pothole',
      confidence: 0.2,
      reasoning: 'Default suggestion - please verify and correct if needed'
    }
  }
}

/**
 * Simulate image-based classification
 * In production, this would integrate with actual ML services
 */
async function simulateImageClassification(photo: File): Promise<ClassificationResult> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))

  // Simple heuristics based on file size and name
  const filename = photo.name.toLowerCase()
  const filesize = photo.size

  if (filename.includes('road') || filename.includes('street')) {
    return {
      category: 'pothole',
      confidence: 0.7,
      reasoning: 'Image appears to show road-related issue'
    }
  }

  if (filename.includes('light') || filename.includes('lamp')) {
    return {
      category: 'streetlight',
      confidence: 0.6,
      reasoning: 'Image appears to show lighting-related issue'
    }
  }

  if (filesize > 2000000) { // Large files might be detailed photos
    return {
      category: 'other',
      confidence: 0.4,
      reasoning: 'High-detail image detected - manual categorization recommended'
    }
  }

  // Default low-confidence result
  return {
    category: 'other',
    confidence: 0.1,
    reasoning: 'Unable to classify from image analysis'
  }
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: string) {
  const categoryMap = {
    pothole: {
      label: 'Pothole',
      emoji: '🕳️',
      description: 'Road surface damage and potholes'
    },
    garbage: {
      label: 'Garbage/Litter',
      emoji: '🗑️',
      description: 'Trash, litter, and waste management issues'
    },
    streetlight: {
      label: 'Broken Street Light',
      emoji: '💡',
      description: 'Non-functioning or damaged street lighting'
    },
    graffiti: {
      label: 'Graffiti',
      emoji: '🎨',
      description: 'Unauthorized markings and graffiti'
    },
    other: {
      label: 'Other',
      emoji: '❓',
      description: 'Other civic issues not covered by specific categories'
    }
  }

  return categoryMap[category as keyof typeof categoryMap] || categoryMap.other
}