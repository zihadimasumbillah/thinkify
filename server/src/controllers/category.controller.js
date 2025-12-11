import Category from '../models/Category.model.js';
import { asyncHandler } from '../utils/helpers.js';

/**
 * @desc    Get all categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ order: 1, name: 1 });

  res.status(200).json({
    success: true,
    categories
  });
});

/**
 * @desc    Get single category by slug
 * @route   GET /api/categories/:slug
 * @access  Public
 */
export const getCategory = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const category = await Category.findOne({ slug, isActive: true });

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  res.status(200).json({
    success: true,
    category
  });
});

/**
 * @desc    Create a new category
 * @route   POST /api/categories
 * @access  Private (admin only)
 */
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, color, order } = req.body;

  const category = await Category.create({
    name,
    description: description || '',
    icon: icon || '💬',
    color: color || '#4ADE80',
    order: order || 0
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    category
  });
});

/**
 * @desc    Update a category
 * @route   PUT /api/categories/:id
 * @access  Private (admin only)
 */
export const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, icon, color, isActive, order } = req.body;

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  if (name) category.name = name;
  if (description !== undefined) category.description = description;
  if (icon) category.icon = icon;
  if (color) category.color = color;
  if (isActive !== undefined) category.isActive = isActive;
  if (order !== undefined) category.order = order;

  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    category
  });
});

/**
 * @desc    Delete a category
 * @route   DELETE /api/categories/:id
 * @access  Private (admin only)
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) {
    return res.status(404).json({
      success: false,
      message: 'Category not found'
    });
  }

  // Soft delete by deactivating
  category.isActive = false;
  await category.save();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * @desc    Seed default categories
 * @route   POST /api/categories/seed
 * @access  Private (admin only)
 */
export const seedCategories = asyncHandler(async (req, res) => {
  const defaultCategories = [
    { name: 'General Discussion', icon: '💬', color: '#4ADE80', description: 'Open discussions on any topic', order: 1 },
    { name: 'Technology', icon: '💻', color: '#60A5FA', description: 'Tech news, programming, and gadgets', order: 2 },
    { name: 'Science', icon: '🔬', color: '#A78BFA', description: 'Scientific discoveries and research', order: 3 },
    { name: 'Philosophy', icon: '🤔', color: '#F472B6', description: 'Deep thoughts and philosophical debates', order: 4 },
    { name: 'Creative', icon: '🎨', color: '#FB923C', description: 'Art, writing, and creative works', order: 5 },
    { name: 'Gaming', icon: '🎮', color: '#34D399', description: 'Video games and gaming culture', order: 6 },
    { name: 'Books & Literature', icon: '📚', color: '#FBBF24', description: 'Book recommendations and discussions', order: 7 },
    { name: 'Music', icon: '🎵', color: '#EC4899', description: 'Music discovery and discussions', order: 8 },
    { name: 'Movies & TV', icon: '🎬', color: '#EF4444', description: 'Film and television discussions', order: 9 },
    { name: 'Feedback', icon: '📝', color: '#6366F1', description: 'Suggestions and feedback for Thinkify', order: 10 }
  ];

  // Only add categories that don't exist
  for (const cat of defaultCategories) {
    const exists = await Category.findOne({ name: cat.name });
    if (!exists) {
      await Category.create(cat);
    }
  }

  const categories = await Category.find({ isActive: true }).sort({ order: 1 });

  res.status(200).json({
    success: true,
    message: 'Default categories seeded successfully',
    categories
  });
});

export default {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories
};
