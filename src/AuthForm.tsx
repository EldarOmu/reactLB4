import { useState, type FormEvent } from "react";
import { ApiError, login, register } from "./api";
import type { AuthMode, UserProfile } from "./types";

interface AuthFormProps {
  mode: AuthMode;
  onAuth: (user: UserProfile) => void;
  onSwitch: () => void;
}

// Как в схеме: буквы, цифры и символы @ . + - _, пароль не короче 6 символов.
const USERNAME_PATTERN = /^[\w.@+-]+$/;

function AuthForm({ mode, onAuth, onSwitch }: AuthFormProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const isRegister = mode === "register";
  const isValid = isRegister
    ? USERNAME_PATTERN.test(username) && username.length <= 150 && password.length >= 6
    : username.trim() !== "" && password !== "";

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isValid || busy) {
      return;
    }

    setBusy(true);
    setError("");
    let registered = false;

    try {
      const credentials = { username: username.trim(), password };
      if (isRegister) {
        await register(credentials);
        registered = true;
      }
      // После регистрации сразу входим, чтобы точно получить сессию.
      const user = await login(credentials);
      onAuth(user);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Что-то пошло не так";
      setError(registered ? `Аккаунт создан, но войти не удалось. ${message}` : message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>{isRegister ? "Регистрация" : "Вход"}</h2>

      <label>
        Имя пользователя
        <input
          type="text"
          value={username}
          maxLength={150}
          autoComplete="username"
          onChange={(event) => setUsername(event.target.value)}
        />
        {isRegister && <small>Буквы, цифры и символы @ . + - _</small>}
      </label>

      <label>
        Пароль
        <input
          type="password"
          value={password}
          autoComplete={isRegister ? "new-password" : "current-password"}
          onChange={(event) => setPassword(event.target.value)}
        />
        {isRegister && <small>Не короче 6 символов</small>}
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" disabled={!isValid || busy}>
        {busy ? "Подождите…" : isRegister ? "Зарегистрироваться" : "Войти"}
      </button>

      <button type="button" className="link" onClick={onSwitch}>
        {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
      </button>
    </form>
  );
}

export default AuthForm;
