import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { HiPhotograph, HiX } from 'react-icons/hi';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import api from '../services/api';

const CreatePostPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    coverImage: '',
  });
  const [errors, setErrors] = useState({});

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.data;
    },
  });

  const categories = categoriesData?.categories || [];

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/posts', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Post created successfully!');
      navigate(`/post/${data.post.slug}`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message);
      
      if (error.response?.data?.errors) {
        const fieldErrors = {};
        error.response.data.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const postData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category,
      tags: formData.tags
        .split(',')
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0),
      coverImage: formData.coverImage.trim() || undefined,
    };

    createMutation.mutate(postData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="text-2xl font-bold text-gray-100 mb-6">Create Discussion</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="What's on your mind?"
            className={`input text-xl font-medium ${errors.title ? 'border-red-500' : ''}`}
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
          <p className="text-xs text-gray-500 mt-1">{formData.title.length}/200 characters</p>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`input ${errors.category ? 'border-red-500' : ''}`}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-sm text-red-500 mt-1">{errors.category}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="label">Content *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Share your thoughts, ideas, or questions..."
            rows={10}
            className={`input resize-none ${errors.content ? 'border-red-500' : ''}`}
          />
          {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content}</p>}
          <p className="text-xs text-gray-500 mt-1">{formData.content.length} characters</p>
        </div>

        {/* Cover Image */}
        <div>
          <label className="label">Cover Image (optional)</label>
          <div className="flex gap-4">
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="input flex-1"
            />
            {formData.coverImage && (
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, coverImage: '' }))}
                className="p-3 bg-dark-100 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
              >
                <HiX className="w-5 h-5" />
              </button>
            )}
          </div>
          {formData.coverImage && (
            <div className="mt-3 relative">
              <img
                src={formData.coverImage}
                alt="Cover preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="label">Tags (optional)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="javascript, react, webdev (comma-separated)"
            className="input"
          />
          <p className="text-xs text-gray-500 mt-1">
            Add up to 5 tags, separated by commas
          </p>
          {formData.tags && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.split(',').map((tag, i) => {
                const trimmed = tag.trim();
                if (!trimmed) return null;
                return (
                  <span key={i} className="badge-primary">
                    #{trimmed.toLowerCase()}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-4 border-t border-dark-50">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={createMutation.isPending}
            className="flex-1"
          >
            Publish Discussion
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreatePostPage;
