/*
  Front-end stand-in for the AI matching (FR-AI2 recommendations).
  The real system compares Gemini embeddings. Here we give points for:
  major, skills overlap, preferred city, preferred training type and academic level.

  Phase 3 rules kept here:
   - students only see a label ("Strong match" / "Good match"), never a number
   - listings that exclude the student's major/level rank lower and never get "Strong match"
   - companies never see these labels
*/

export const MATCH_LABEL = {
  STRONG: 'Strong match',
  GOOD: 'Good match',
}

export function isEligible(student, listing) {
  const majorOk = !listing.majors?.length || listing.majors.includes(student.major)
  const levelOk = !listing.academicLevels?.length || listing.academicLevels.includes(student.academicLevel)
  return majorOk && levelOk
}

// 0..100 score (internal only, never shown to users)
export function scoreListing(student, listing) {
  if (!student) return 0
  let score = 0
  if (listing.majors?.includes(student.major)) score += 35
  const skills = new Set((student.skills ?? []).map((s) => s.toLowerCase()))
  const overlap = (listing.skills ?? []).filter((s) => skills.has(s.toLowerCase())).length
  score += Math.min(overlap, 4) * 10
  if (student.preferredCities?.includes(listing.city)) score += 10
  if (student.preferredTypes?.includes(listing.trainingType)) score += 10
  if (listing.academicLevels?.includes(student.academicLevel)) score += 5
  if (!isEligible(student, listing)) score -= 40
  return score
}

/**
 * Top N recommendations for a student (FR-S3 / FR-AI2).
 * Returns [{ listing, label }] best first.
 *  - excludeIds: listing ids the student already applied to
 */
export function recommendListings(student, openListings, { excludeIds = [], limit = 10 } = {}) {
  if (!student?.resume) return []
  const skip = new Set(excludeIds)
  return openListings
    .filter((l) => !skip.has(l.id))
    .map((listing) => ({ listing, score: scoreListing(student, listing) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ listing, score }) => ({
      listing,
      label: score >= 60 && isEligible(student, listing) ? MATCH_LABEL.STRONG : MATCH_LABEL.GOOD,
    }))
}
