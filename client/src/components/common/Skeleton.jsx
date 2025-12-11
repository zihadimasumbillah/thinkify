const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 rounded',
    title: 'h-6 rounded',
    avatar: 'w-10 h-10 rounded-full',
    card: 'h-40 rounded-xl',
    button: 'h-10 w-24 rounded-lg',
  };

  return (
    <div className={`skeleton ${variants[variant]} ${className}`} />
  );
};

export const PostSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="avatar" />
      <div className="flex-1">
        <Skeleton className="w-32 mb-2" />
        <Skeleton className="w-24 h-3" />
      </div>
    </div>
    <Skeleton variant="title" className="w-3/4 mb-3" />
    <Skeleton className="w-full mb-2" />
    <Skeleton className="w-full mb-2" />
    <Skeleton className="w-2/3 mb-4" />
    <div className="flex gap-4">
      <Skeleton className="w-16" />
      <Skeleton className="w-16" />
      <Skeleton className="w-16" />
    </div>
  </div>
);

export const CommentSkeleton = () => (
  <div className="flex gap-3 animate-pulse">
    <Skeleton variant="avatar" />
    <div className="flex-1">
      <Skeleton className="w-24 mb-2" />
      <Skeleton className="w-full mb-1" />
      <Skeleton className="w-3/4" />
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 mb-6">
      <div className="skeleton w-24 h-24 rounded-full" />
      <div className="flex-1">
        <Skeleton variant="title" className="w-40 mb-2" />
        <Skeleton className="w-24 mb-2" />
        <Skeleton className="w-full max-w-md" />
      </div>
    </div>
  </div>
);

export default Skeleton;
