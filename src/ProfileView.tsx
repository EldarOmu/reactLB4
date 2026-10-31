import type { UserProfile } from "./types";

interface ProfileViewProps {
  user: UserProfile;
  onEdit: () => void;
}

function ProfileView({ user, onEdit }: ProfileViewProps) {
  const { profile } = user;

  return (
    <section className="card">
      <h2>Мой профиль</h2>

      <dl>
        <div>
          <dt>Имя пользователя</dt>
          <dd>{user.username}</dd>
        </div>
        <div>
          <dt>Имя</dt>
          <dd>{profile.first_name || "не указано"}</dd>
        </div>
        <div>
          <dt>Специализация</dt>
          <dd>{profile.specialization_display || "не указана"}</dd>
        </div>
        <div>
          <dt>О себе</dt>
          <dd>{profile.bio || "не указано"}</dd>
        </div>
        <div>
          <dt>Гонорар</dt>
          <dd>{profile.fee || "не указан"}</dd>
        </div>
      </dl>

      <button type="button" onClick={onEdit}>
        Редактировать
      </button>
    </section>
  );
}

export default ProfileView;
