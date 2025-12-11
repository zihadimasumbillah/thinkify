import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiSearch, HiFilter, HiAdjustments } from 'react-icons/hi';
import PostCard from '../components/posts/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import Button from '../components/common/Button';
import api from '../services/api';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page')) || 1;

  // Fetch posts
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'explore', { search, category, sort, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 15);

      const response = await api.get(`/posts?${params.toString()}`);
      return response.data;
    },
  });

  // Fetch categories for filter
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const posts = data?.posts || [];
  const pagination = data?.pagination;
  const categories = categoriesData?.categories || [];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
    { value: 'most-liked', label: 'Most Liked' },
  ];

  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.delete('page'); // Reset to page 1
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = search || category || sort !== 'newest';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {search ? `Search: "${search}"` : 'Explore'}
          </h1>
          <p className="text-gray-400 mt-1">
            Discover discussions from the community
          </p>
        </div>

        <Button 
          variant="secondary" 
          icon={HiAdjustments}
          onClick={() => setShowFilters(!showFilters)}
        >
          Filters {hasActiveFilters && '•'}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="card p-4 space-y-4"
        >
          {/* Search */}
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Search discussions..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Category & Sort */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select
                value={category}
                onChange={(e) => updateFilter('category', e.target.value)}
                className="input"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.slug}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sort By</label>
              <select
                value={sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="input"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters}>
              Clear all filters
            </Button>
          )}
        </motion.div>
      )}

      {/* Results Count */}
      {pagination && (
        <p className="text-sm text-gray-500">
          Showing {posts.length} of {pagination.totalItems} discussions
        </p>
      )}

      {/* Posts List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="card p-8 text-center">
          <p className="text-red-500 mb-4">Failed to load discussions</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <div className="card p-8 text-center">
          <HiSearch className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300 mb-2">No discussions found</h3>
          <p className="text-gray-500 mb-4">
            {search 
              ? `No results for "${search}". Try different keywords.`
              : 'No discussions match your filters.'}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="secondary"
            disabled={!pagination.hasPrevPage}
            onClick={() => updateFilter('page', page - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={!pagination.hasNextPage}
            onClick={() => updateFilter('page', page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
