const express = require('express');
const Post = require('../models/post');
const Comment = require('../models/comment');
const isLoggedIn = require('../middlewares');
const catchAsync = require('../utils/catchAsync');
// const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');
const validatePost = require('../schemas');

const router = express.Router();




router.get('/', catchAsync(async (req, res) => {
  const posts = await Post.find({}).populate('user');
  res.render('posts/index', { posts });
}))

router.get('/new', isLoggedIn, (req, res) => {
  res.render('posts/new');
})

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {
  const { title, textBody } = req.body.post;
  const post = new Post({ title, textBody });
  post.user = req.user;
  await post.save();
  req.flash('success', 'Successfully made a new post!')
  res.redirect(`/posts/${post._id}`);
}))

router.get('/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate('user').populate({
    path: 'comments',
    populate: {
      path: 'user'
    }
  });
  if (!post) {
    req.flash('error', 'Cannot find that post!');
    return res.redirect('/posts');
  }
  res.render('posts/show', { post });
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (res.locals.currentUser && post.user.equals(res.locals.currentUser._id)) {
    await Post.deleteOne({ _id: id });
    req.flash('success', 'Successfully deleted a post!');
    res.redirect('/posts');
  } else {
    res.redirect(`/posts/${id}`)
  }
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (!post) {
    req.flash('error', 'Cannot find that post!');
    return res.redirect('/posts');
  }
  if (req.user && post.user.equals(req.user._id)) {
    res.render('posts/edit', { post });
  } else {
    res.redirect(`/posts/${id}`);
  }
}))

router.put('/:id', isLoggedIn, validatePost, catchAsync(async (req, res) => {
  const { id } = req.params;
  const { title, textBody } = req.body.post;
  const post = await Post.findById(id);
  if (req.user && post.user.equals(req.user._id)) {
    await Post.updateOne({ _id: id }, { title, textBody });
    req.flash('success', 'Successfully edited a post!')
    res.redirect(`/posts/${id}`);
  } else {
    res.redirect(`/posts/${id}`)
  }
}))

router.post('/:id/comments', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  let comment = new Comment({ commentText: req.body.comment, user: req.user._id })
  comment = await comment.save();
  post.comments.push(comment._id);
  await post.save();
  req.flash('success', 'Successfully added a comment!');
  res.redirect(`/posts/${id}`);
}))

router.delete('/:id/comments/:comment_id', isLoggedIn, catchAsync(async (req, res) => {
  const { id, comment_id } = req.params;
  const post = await Post.findById(id);
  const comment = await Comment.findById(comment_id);
  if (res.locals.currentUser && (post.user.equals(res.locals.currentUser._id) || comment.user.equals(res.locals.currentUser._id))) {
    await Comment.deleteOne({ _id: comment_id });
    await Post.findByIdAndUpdate(id, { $pull: { comments: comment_id } });
    req.flash('success', 'Successfully deleted a comment!');
  }
  res.redirect(`/posts/${id}`);
}));

module.exports = router;