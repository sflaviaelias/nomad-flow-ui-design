
import React from "react";
import { ProfileAvatar } from "./ProfileAvatar";

interface EditProfileAvatarBlockProps {
  avatarUrl: string | null | undefined;
  name: string;
  onChange: (file: File) => void;
}

export function EditProfileAvatarBlock({
  avatarUrl,
  name,
  onChange,
}: EditProfileAvatarBlockProps) {
  return (
    <div className="flex flex-col items-center mb-2">
      <ProfileAvatar
        avatarUrl={avatarUrl}
        editable
        onChange={onChange}
        name={name}
      />
    </div>
  );
}
