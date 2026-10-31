# Профиль участника группы

React + TypeScript (файлы `.tsx`): регистрация, вход, выход, просмотр и редактирование профиля.
Сервер: Band Members API (https://inai-col2.fishrungames.com/api/docs/).

## Запуск

```
npm install
npm run dev
```

Проверка типов и сборка: `npm run build`.

## Как это работает

- `src/api.tsx` — все запросы к серверу: `register`, `login`, `logout`, `getProfile`, `updateProfile`, `getSpecializations`. Запросы идут с `credentials: "include"`, поэтому браузер сам хранит cookie `sessionid`.
- `src/App.tsx` — состояние `user`. При открытии страницы вызывает `GET /api/profile/`: если сессия жива, сразу показывает профиль.
- `src/AuthForm.tsx` — вход и регистрация (после регистрации выполняется вход).
- `src/ProfileView.tsx` — просмотр профиля, `src/ProfileForm.tsx` — редактирование (`PATCH /api/profile/`).
- Типы в `src/types.tsx` повторяют схему API. Babel не используется: Vite 8 сам компилирует TSX, `tsc` только проверяет типы.

Другой адрес сервера: создайте файл `.env` со строкой `VITE_API_URL=https://адрес-сервера`.

## GitHub Pages

Settings → Pages → Source: **GitHub Actions**. Каждый пуш в `main` публикуется workflow `.github/workflows/deploy.yml`.
