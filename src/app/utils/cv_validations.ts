export const validation_prompt = `
### ATS and Recruiter Quality Rules

Apply these rules when generating or improving the CV:

1. Structure and hierarchy
- Recommended section order: contact information, professional profile, work experience, education/certifications, skills, projects or languages when relevant.
- Prioritize recent and relevant experience. Use more space for roles that match the job offer.
- Keep section headings clear, conventional, and translated to the predominant language of the job offer.

2. Achievement writing
- Prefer bullet points that follow this pattern: action verb + context + result + business impact.
- Use metrics only when they are provided or clearly supported by the candidate data.
- If no metric is available, write concrete outcomes without inventing numbers.
- Avoid generic claims such as "proactive", "dynamic", "hard worker", or "team player" unless supported by evidence.

3. Job-offer alignment
- Mirror important job-offer keywords naturally when the candidate data supports them.
- Prioritize skills, tools, responsibilities, and domain terms that appear in the job offer.
- Do not keyword-stuff. Keywords must fit naturally inside profile, experience, skills, or projects.

4. ATS compatibility
- Use real text, not text embedded in images.
- Prefer simple semantic sections and readable bullet lists.
- Avoid complex tables, decorative icons, excessive graphics, headers/footers that contain critical information, and hidden text.
- Keep contact information easy to parse: name, email, phone, location, LinkedIn, portfolio when available.

5. Skills section
- Separate hard skills, tools/platforms, methodologies, languages, and soft skills when useful.
- Prioritize skills required by the job offer.
- Add proficiency levels only if the candidate data supports them.

6. Special cases
- Career change: emphasize transferable skills, relevant projects, certifications, and outcomes.
- Employment gaps: mention only useful context provided by the candidate, such as training, freelance work, or certifications.
- Freelance/project-based profiles: include a project section with client/problem/action/result when data is available.

7. Final quality checklist
- The CV should be accurate, concise, targeted, and readable in under one minute.
- The strongest matching evidence should appear in the top third of the page.
- The final HTML should be print-friendly, professional, and consistent.
- Never add unsupported claims, fake links, fake certifications, fake employers, or fabricated metrics.
`;
