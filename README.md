# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase Feature Setup

Apply `supabase/migrations/20260928_candidate_progress_and_feedback.sql` to the connected Supabase project before using cross-device study progress or question reports. Run it through the Supabase SQL Editor or your normal migration workflow. The tables use row-level security so candidates can only access their own records.

Question reports appear as `open` rows in the Supabase `question_feedback` table. Reviewers can use the Table Editor to triage them as `reviewing` or `resolved` and update question-bank content after verification.

Study reminders are opt-in browser notifications and fire only while Project Jill is open in a supported browser.
