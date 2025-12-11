const Avatar = ({ src, alt, size = 'md', className = '' }) => {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  // Generate initials from alt text
  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  // Generate consistent color from name
  const getColor = (name) => {
    if (!name) return 'bg-primary';
    const colors = [
      'bg-primary',
      'bg-accent-purple',
      'bg-accent-blue',
      'bg-accent-pink',
      'bg-accent-cyan',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover border-2 border-dark-50 ${className}`}
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
    );
  }

  return (
    <div
      className={`
        ${sizes[size]} ${getColor(alt)}
        rounded-full flex items-center justify-center
        text-dark font-semibold border-2 border-dark-50
        ${size === 'xs' ? 'text-xs' : ''}
        ${size === 'sm' ? 'text-xs' : ''}
        ${size === 'md' ? 'text-sm' : ''}
        ${size === 'lg' ? 'text-xl' : ''}
        ${size === 'xl' ? 'text-2xl' : ''}
        ${className}
      `}
    >
      {getInitials(alt)}
    </div>
  );
};

export default Avatar;
