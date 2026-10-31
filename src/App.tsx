import { useEffect, useState } from "react";
import { ApiError, getProfile, logout } from "./api";
import AuthForm from "./AuthForm";
import ProfileForm from "./ProfileForm";
import ProfileView from "./ProfileView";
import type { AuthMode, UserProfile } from "./types";

interface Message {
  text: string;
  type: "ok" | "error";
}

function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<AuthMode>("login");
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  // При открытии страницы спрашиваем сервер, есть ли уже действующая сессия.
  useEffect(() => {
    let cancelled = false;
    getProfile()
      .then((current) => {
        if (!cancelled) {
          setUser(current);
        }
      })
      .catch(() => {
        // нет сессии — показываем форму входа
      })
      .finally(() => {
        if (!cancelled) {
          setChecking(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleAuth(loggedIn: UserProfile): void {
    setUser(loggedIn);
    setEditing(false);
    setMessage(null);
  }

  function handleSaved(updated: UserProfile): void {
    setUser(updated);
    setEditing(false);
    setMessage({ text: "Профиль сохранён.", type: "ok" });
  }

  async function handleLogout(): Promise<void> {
    try {
      await logout();
    } catch (e) {
      // 401/403 значит, что сессия уже закончилась — считаем, что вышли.
      const sessionGone = e instanceof ApiError && (e.status === 401 || e.status === 403);
      if (!sessionGone) {
        setMessage({ text: e instanceof ApiError ? e.message : "Не удалось выйти.", type: "error" });
        return;
      }
    }
    setUser(null);
    setEditing(false);
    setMode("login");
    setMessage(null);
  }

  if (checking) {
    return (
      <main>
        <p>Загрузка…</p>
      </main>
    );
  }

  return (
    <main>
      <header className="bar">
        <h1>Профиль участника группы</h1>
        {user && (
          <div className="bar-user">
            <span>{user.username}</span>
            <button type="button" className="secondary" onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </header>

      {message && (
        <p className={message.type === "ok" ? "notice" : "error"} role={message.type === "ok" ? "status" : "alert"}>
          {message.text}
        </p>
      )}

      {user ? (
        editing ? (
          <ProfileForm user={user} onSaved={handleSaved} onCancel={() => setEditing(false)} />
        ) : (
          <ProfileView
            user={user}
            onEdit={() => {
              setMessage(null);
              setEditing(true);
            }}
          />
        )
      ) : (
        <AuthForm
          key={mode}
          mode={mode}
          onAuth={handleAuth}
          onSwitch={() => setMode(mode === "login" ? "register" : "login")}
        />
      )}
    </main>
  );
}

export default App;
