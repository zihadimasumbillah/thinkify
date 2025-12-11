import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [2000, 'Comment cannot exceed 2000 characters']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required']
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: [true, 'Post reference is required']
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    dislikes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'deleted', 'flagged', 'hidden'],
      default: 'active'
    },
    replyCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for replies
commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parentComment'
});

// Indexes
commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

// Update post comment count on save
commentSchema.post('save', async function () {
  const Post = mongoose.model('Post');
  const count = await mongoose.model('Comment').countDocuments({
    post: this.post,
    status: 'active',
    parentComment: null
  });
  await Post.findByIdAndUpdate(this.post, { commentCount: count, lastActivity: new Date() });
});

// Update parent comment reply count
commentSchema.post('save', async function () {
  if (this.parentComment) {
    const replyCount = await mongoose.model('Comment').countDocuments({
      parentComment: this.parentComment,
      status: 'active'
    });
    await mongoose.model('Comment').findByIdAndUpdate(this.parentComment, { replyCount });
  }
});

// Mark as edited when content changes
commentSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = new Date();
  }
  next();
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
