/*
  Profile completion used by the dashboard banner and the profile page "Profile strength" bar.
  5 sections, each one is either complete or not:
   - personal:    name + phone + bio
   - academic:    university + major + academicLevel + graduationDate
   - skills:      at least 1 skill
   - preferences: at least 1 preferred city and 1 preferred training type
   - resume:      a resume was uploaded
*/

const filled = (value) => String(value ?? '').trim().length > 0

export const PROFILE_SECTIONS = [
  { key: 'personal', label: 'Personal details', done: (p) => filled(p.name) && filled(p.phone) && filled(p.bio) },
  {
    key: 'academic',
    label: 'Academic information',
    done: (p) => filled(p.university) && filled(p.major) && filled(p.academicLevel) && filled(p.graduationDate),
  },
  { key: 'skills', label: 'Skills', done: (p) => (p.skills ?? []).length > 0 },
  {
    key: 'preferences',
    label: 'Preferences',
    done: (p) => (p.preferredCities ?? []).length > 0 && (p.preferredTypes ?? []).length > 0,
  },
  { key: 'resume', label: 'Resume', done: (p) => p.resume != null },
]

/**
 * profileCompletion(profile) -> { done, total, percent, sections: { personal: true, ... } }
 */
export function profileCompletion(profile) {
  const sections = {}
  let done = 0
  for (const section of PROFILE_SECTIONS) {
    const ok = Boolean(profile) && section.done(profile)
    sections[section.key] = ok
    if (ok) done++
  }
  const total = PROFILE_SECTIONS.length
  return { done, total, percent: Math.round((done / total) * 100), sections }
}
