import React from 'react';

interface AvatarProps {
  name: string;
  size: 'big' | 'small';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('');

  if (size === 'big') {
    return (
      <span className="inline-flex items-center justify-center h-40 w-40 rounded-full bg-gray-500">
        <span className="text-4xl font-medium leading-none text-white">
          {initials}
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-gray-500">
      <span className="text-xs font-medium leading-none text-white">
        {initials}
      </span>
    </span>
  );
};
