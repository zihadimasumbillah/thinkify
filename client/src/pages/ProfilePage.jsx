import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiCalendar, HiUserGroup, HiDocumentText } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import PostCard from '../components/posts/PostCard';
import { ProfileSkeleton, PostSkeleton } from '../components/common/Skeleton';
import api from '../services/api';
import useAuthStore from '../stores/authStore';

const ProfilePage = () => {
  const { username } = useParams();
  const queryClient = useQueryClient();
  const { user: currentUser, isAuthenticated } = useAuthStore();

  const isOwnProfile = currentUser?.username === username;

  // Fetch user profile
  const { data: userData, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['user', username],
    queryFn: async () => {
      const response = await api.get(`/users/${username}`);
      return response.data;
    },
  });

  // Fetch user's posts
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: async () => {
      const response = await api.get(`/users/${username}/posts?limit=10`);
      return response.data;
    },
  });

  const profile = userData?.user;
  const posts = postsData?.posts || [];

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: () => api.post(`/users/${profile._id}/follow`),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['user', username]);
      toast.success(response.data.message);
    },
    onError: () => {
      toast.error('Failed to update follow status');
    },
  });

  const isFollowing = profile?.followers?.some(
    (follower) => follower._id === currentUser?._id || follower === currentUser?._id
  );

  const handleFollow = () => {
    if (!isAuthenticated) {
      toast.error('Please login to follow users');
      return;
    }
    followMutation.mutate();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (userError || !profile) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-100 mb-2">User Not Found</h2>
        <p className="text-gray-400 mb-4">The user @{username} doesn't exist or has been removed.</p>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <Avatar
            src={profile.avatar}
            alt={profile.displayName || profile.username}
            size="xl"
            className="ring-4 ring-primary/20"
          />

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-100">
                  {profile.displayName || profile.username}
                </h1>
                <p className="text-gray-500">@{profile.username}</p>
              </div>

              {/* Action Buttons */}
              {!isOwnProfile && isAuthenticated && (
                <Button
                  variant={isFollowing ? 'secondary' : 'primary'}
                  onClick={handleFollow}
                  isLoading={followMutation.isPending}
                  className="sm:ml-auto"
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              )}

              {isOwnProfile && (
                <Link to="/settings" className="sm:ml-auto">
                  <Button variant="secondary">Edit Profile</Button>
                </Link>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-300 mb-4">{profile.bio}</p>
            )}

            {/* Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <HiDocumentText className="w-4 h-4" />
                <span><strong className="text-gray-200">{profile.postCount || 0}</strong> posts</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <HiUserGroup className="w-4 h-4" />
                <span><strong className="text-gray-200">{profile.followerCount || 0}</strong> followers</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <HiUserGroup className="w-4 h-4" />
                <span><strong className="text-gray-200">{profile.followingCount || 0}</strong> following</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <HiCalendar className="w-4 h-4" />
                <span>Joined {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User's Posts */}
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">
          Posts by @{profile.username}
        </h2>

        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-gray-400">
              {isOwnProfile 
                ? "You haven't posted anything yet." 
                : `@${profile.username} hasn't posted anything yet.`}
            </p>
            {isOwnProfile && (
              <Link to="/create" className="mt-4 inline-block">
                <Button>Create Your First Post</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <PostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfilePage;
