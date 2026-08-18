export const validation_prompt = `
### ATS & Recruiter Quality Rules

1. Section order and hierarchy
- Conventional order: contact information, professional profile, work experience, education, skills, then relevant extras (certifications, projects, languages).
- Reorder or resize sections when the job offer demands it: the most offer-relevant sections come first and get the most space.
- Use conventional, localized headings (e.g., "Experience", "Education", "Skills") in the predominant language of the job offer.

2. Achievement writing
- Bullets follow: action verb + context + result. Use metrics only when present in the candidate data.
- Without metrics, state concrete outcomes; never invent numbers.
- Avoid unsupported clichés ("proactive", "dynamic", "hard worker", "team player") unless evidenced.

3. Job-offer alignment
- Mirror important job-offer keywords naturally where the candidate has matching evidence.
- Prioritize skills, tools, and domain terms that appear in the job offer.
- Never keyword-stuff; keywords must read naturally inside profile, experience, skills, or projects.

4. ATS compatibility
- Real text only: no text inside images, no decorative icons or graphics replacing text.
- Semantic HTML, readable bullet lists, no tables, no hidden text.
- Never place critical information (name, contact, skills) only in headers/footers.
- Contact must parse easily: name, email, phone, location, LinkedIn/portfolio.

5. Skills section
- Group hard skills, tools/platforms, methodologies, languages, and soft skills when useful.
- Offer-relevant groups first; add proficiency levels only when supported by the data.

6. Special cases
- Career change: emphasize transferable skills, relevant projects, certifications, and outcomes.
- Employment gaps: only mention useful context provided by the candidate (training, freelance, certifications).
- Freelance/project-based profiles: include a project section with client/problem/action/result when data exists.

7. Final quality checklist
- Accurate, concise, targeted, readable in under one minute.
- Strongest matching evidence in the top third of the page.
- Print-friendly, professional, consistent; nothing invented.
`;
