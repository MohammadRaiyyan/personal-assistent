# API Integration Summary

This document lists backend APIs, expected request/response payloads, and the frontend files that integrate each endpoint.

## Backend APIs (available)

- GET /api/user/profile
  - Response: { message: string, data: UserProfile }
  - Frontend: `AuthContext` fetches profile; root route loader also fetches profile.

- Insights
  - GET /api/insight/industry-insights
    - Response: { message: string, data: InsightObject }
    - Frontend: `frontend/src/routes/app/index.tsx` loader and `frontend/src/components/features/dashboard/insights.tsx`
  - POST /api/insight/industry-insights
    - Used to create industry insights (backend only)

- Cover Letters
  - GET /api/cover-letter/
    - Response: { message: string, data: CoverLetter[] }
    - Frontend: `frontend/src/routes/app/cover-letters/index.tsx`, `frontend/src/components/features/cover-letter/cover-letters.tsx`
  - GET /api/cover-letter/:coverLetterId
    - Response: { message: string, data: CoverLetter }
    - Frontend: `frontend/src/routes/app/cover-letters/$id.tsx`
  - POST /api/cover-letter/
    - Body: { companyName, positionTitle, jobDescription }
    - Response: { message: string, data: newCoverLetter }
    - Frontend: `frontend/src/components/features/cover-letter/generate.tsx`
  - DELETE /api/cover-letter/:coverLetterId
    - Frontend: delete wired in `frontend/src/components/features/cover-letter/cover-letters.tsx`

- Resumes
  - GET /api/resume/
    - Response: { message: string, data: Resume[] }
    - Frontend: `frontend/src/routes/app/resume.tsx` loader
  - GET /api/resume/:resumeId
    - Response: { message: string, data: Resume }
  - POST /api/resume/
    - Body: { content }
    - Frontend: save created via `frontend/src/components/features/resume/form-builder.tsx`
  - PATCH /api/resume/:resumeId
    - Body: { content }
    - Frontend: update wired in `form-builder.tsx` when `resumeId` present
  - DELETE /api/resume/:resumeId
  - POST /api/resume/improve-resume
    - Body: { type, content, industry }
    - Response: { message, data: improvedContent }
    - Frontend: `form-builder.tsx` calls `improveResume` and updates preview

- Interview
  - GET /api/interview/assessments
    - Response: { message, data: Assessment[] }
    - Frontend: preloaded in `frontend/src/routes/app/interview/index.tsx`
  - GET /api/interview/take-assessments
    - Response: { message, data: QuizQuestion[] }
    - Frontend: `frontend/src/components/features/interview/quiz.tsx` uses `takeAssessments`
  - POST /api/interview/save-results
    - Body: { questions, answers, industry, category, score }
    - Frontend: `quiz.tsx` calls `saveQuizResult`

## Frontend files created/updated

- `frontend/src/lib/api.ts` — shared fetch helper (credentials included)
- `frontend/src/lib/coverLetterApi.ts`
- `frontend/src/lib/resumeApi.ts`
- `frontend/src/lib/interviewApi.ts`
- `frontend/src/context/auth-context.tsx` — exposes `profile` and fetches profile
- `frontend/src/routes/__root.tsx` — added loader for profile
- `frontend/src/routes/app/index.tsx` — insights loader
- `frontend/src/routes/app/cover-letters/index.tsx` — cover letters loader
- `frontend/src/routes/app/cover-letters/$id.tsx` — single cover letter loader
- `frontend/src/routes/app/cover-letters/new.tsx` — create UI (wired to API)
- `frontend/src/routes/app/resume.tsx` — resume loader
- `frontend/src/routes/app/interview/index.tsx` — assessments loader
- `frontend/src/components/features/cover-letter/*` — wired create/delete/preview
- `frontend/src/components/features/resume/form-builder.tsx` — save/create/update + improve
- `frontend/src/components/features/interview/*` — take quiz/save results

## Notes / Verification

- All frontend calls use `http://localhost:4000` and `credentials: include` (cookie-based session).
- Payload shapes align with backend controllers; if you change param names (e.g., `positionTitle` vs `jobTitle`) ensure both sides agree.
- I did not add automated tests; recommend adding integration tests for cover-letter, resume create/update, and interview save-results.

## Next steps

- Run the frontend and backend locally and perform manual smoke tests for each flow.
- Add a couple of integration tests (supertest / jest) in backend for core endpoints.
- Optional: centralize error handling and show loading states in UI where missing.

\*\*\* End of document
