import type { Credentials, ProfileUpdate, SpecializationChoice, UserProfile } from "./types";

// Адрес сервера можно переопределить переменной VITE_API_URL (файл .env).
const API_URL: string = (import.meta.env.VITE_API_URL ?? "https://inai-col2.fishrungames.com").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const FIELD_NAMES: Record<string, string> = {
  username: "Имя пользователя",
  password: "Пароль",
  first_name: "Имя",
  specialization: "Специализация",
  bio: "О себе",
  fee: "Гонорар",
};

// Сервер возвращает ошибки как {"поле": ["текст"]} или {"detail": "текст"}.
function extractMessage(data: unknown): string | null {
  if (typeof data === "string") {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(extractMessage).filter(Boolean).join(" ") || null;
  }
  if (data && typeof data === "object") {
    const parts = Object.entries(data).map(([key, value]) => {
      const message = extractMessage(value);
      if (!message) {
        return null;
      }
      return key === "detail" || key === "non_field_errors" ? message : `${FIELD_NAMES[key] ?? key}: ${message}`;
    });
    return parts.filter(Boolean).join(" ") || null;
  }
  return null;
}

async function request<T>(path: string, method: string = "GET", body?: unknown): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      // include: браузер отправляет и принимает cookie sessionid
      credentials: "include",
      headers: body === undefined ? { Accept: "application/json" } : { Accept: "application/json", "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Не удалось связаться с сервером. Проверьте интернет.", 0);
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractMessage(data) ?? `Ошибка сервера (${response.status})`, response.status);
  }

  return data as T;
}

export function register(credentials: Credentials): Promise<UserProfile> {
  return request<UserProfile>("/api/register/", "POST", credentials);
}

export function login(credentials: Credentials): Promise<UserProfile> {
  return request<UserProfile>("/api/login/", "POST", credentials);
}

export function logout(): Promise<unknown> {
  return request<unknown>("/api/logout/", "POST");
}

export function getProfile(): Promise<UserProfile> {
  return request<UserProfile>("/api/profile/");
}

export function updateProfile(update: ProfileUpdate): Promise<UserProfile> {
  return request<UserProfile>("/api/profile/", "PATCH", update);
}

export function getSpecializations(): Promise<SpecializationChoice[]> {
  return request<SpecializationChoice[]>("/api/specializations/");
}
