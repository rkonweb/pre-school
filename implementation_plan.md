# Implementation Plan - Job Management UI

## Goal
Create a comprehensive Job Management Interface within the existing Admin Console (`/admin/cms/careers`) to allow the user to easily create, edit, and delete job postings without touching code or database scripts.

## User Review Required
> [!NOTE]
> This will enhance the existing `/admin/cms/careers` page to include Job Management.

## Proposed Changes

### Admin Console
#### [MODIFY] [Careers Admin Page](file:///i:/anti-gravity/pre-school/src/app/(admin-console)/admin/cms/careers/page.tsx)
-   Integrate a "Job Postings" management section.
-   Add a list of current jobs.
-   Add "Add Job" button and modal/form.
-   Allow editing and deleting jobs.

### Server Actions
#### [MODIFY] [cms-actions.ts](file:///i:/anti-gravity/pre-school/src/app/actions/cms-actions.ts)
-   Ensure `updateJobPostingAction` exists (was missing in view).
-   Ensure `createJobPostingAction` supports all fields.

## Verification Plan
### Manual Verification
-   Navigate to `/admin/cms/careers`.
-   Create a new job.
-   Verify it appears on the public `/careers` page.
