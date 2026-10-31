import { useEffect, useState, type FormEvent } from "react";
import { ApiError, getSpecializations, updateProfile } from "./api";
import type { ProfileUpdate, SpecializationChoice, UserProfile } from "./types";

interface ProfileFormProps {
  user: UserProfile;
  onSaved: (user: UserProfile) => void;
  onCancel: () => void;
}

// До 8 цифр до точки и до 2 после, как в схеме.
const FEE_PATTERN = /^\d{0,8}(?:\.\d{0,2})?$/;

function ProfileForm({ user, onSaved, onCancel }: ProfileFormProps) {
  const { profile } = user;

  const [firstName, setFirstName] = useState(profile.first_name ?? "");
  const [specialization, setSpecialization] = useState(profile.specialization ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [fee, setFee] = useState(profile.fee ?? "");
  const [choices, setChoices] = useState<SpecializationChoice[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Варианты для списка берём с сервера.
  useEffect(() => {
    let cancelled = false;
    getSpecializations()
      .then((list) => {
        if (!cancelled) {
          setChoices(list);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Не удалось загрузить список специализаций.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedFee = fee.trim().replace(",", ".");
  const isFeeValid = FEE_PATTERN.test(normalizedFee);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!isFeeValid || busy) {
      return;
    }

    // Пустые специализацию и гонорар не отправляем: сервер не примет пустое значение.
    const update: ProfileUpdate = { first_name: firstName.trim(), bio: bio.trim() };
    if (specialization !== "") {
      update.specialization = specialization;
    }
    if (normalizedFee !== "") {
      update.fee = normalizedFee;
    }

    setBusy(true);
    setError("");
    try {
      onSaved(await updateProfile(update));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Что-то пошло не так");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Редактирование профиля</h2>

      <label>
        Имя
        <input type="text" value={firstName} maxLength={100} onChange={(event) => setFirstName(event.target.value)} />
      </label>

      <label>
        Специализация
        <select value={specialization} onChange={(event) => setSpecialization(event.target.value)}>
          {specialization === "" && <option value="">Не выбрана</option>}
          {choices.map((choice) => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        О себе
        <textarea rows={4} value={bio} onChange={(event) => setBio(event.target.value)} />
      </label>

      <label>
        Гонорар
        <input
          type="text"
          inputMode="decimal"
          value={fee}
          placeholder="Например, 1500.50"
          onChange={(event) => setFee(event.target.value)}
        />
        <small>До 8 цифр и до 2 знаков после точки</small>
      </label>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button type="submit" disabled={!isFeeValid || busy}>
          {busy ? "Сохраняем…" : "Сохранить"}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  );
}

export default ProfileForm;
