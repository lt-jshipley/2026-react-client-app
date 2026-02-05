# TODO

Tracked feature gaps to implement one at a time.

## Gaps

- [x] **Settings/Profile page** — Replace placeholder with a working profile edit form (name, email) using React Hook Form + Zod
- [x] **User CRUD UI** — Wire up existing create, update, and delete user mutations to actual UI (e.g., admin user management page)
- [x] **User posts display** — Use the existing `userPostsQueryOptions` query to show posts on the user detail page
  - [x] Make the user name in `AuthLayout` a link to `/users/$userId` for the logged-in user
  - [x] Move `/users/$userId` route under `_authenticated` so it uses `AuthLayout` consistently
  - [x] Add "Users" link to the nav bar in both layouts (leads to `/users` index)
  - [x] Link dashboard stat cards (Total Users, Total Posts) to relevant pages
- [ ] **Theme toggle** — Expose the uiStore theme (light/dark/system) switcher in the UI
- [ ] **Sidebar** — Implement a sidebar component wired to the uiStore sidebar state
- [ ] **Locale switching** — Add a language picker that uses the uiStore locale + i18next
- [ ] **Spanish translations** — Add complete Spanish locale files and a UI toggle to switch between English and Spanish
