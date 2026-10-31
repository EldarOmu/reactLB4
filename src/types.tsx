// Типы повторяют схему Band Members API (Band_Members_API.yaml).

export interface Profile {
  first_name?: string;
  specialization?: string; // значение вроде "guitar"
  specialization_display: string; // подпись вроде "Гитара" (только чтение)
  bio?: string;
  fee?: string; // десятичное число строкой, например "1500.50"
}

export interface UserProfile {
  id: number;
  username: string;
  profile: Profile;
}

export interface Credentials {
  username: string;
  password: string;
}

// Что можно менять через PATCH /api/profile/
export interface ProfileUpdate {
  first_name?: string;
  specialization?: string;
  bio?: string;
  fee?: string;
}

export interface SpecializationChoice {
  value: string;
  label: string;
}

export type AuthMode = "login" | "register";
