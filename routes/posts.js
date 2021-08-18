const express = require('express');
const Post = require('../models/post');
const Comment = require('../models/comment');
const isLoggedIn = require('../middlewares');
const catchAsync = require('../utils/catchAsync');
// const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');
const validatePost = require('../schemas');

const router = express.Router();




router.get('/', async (req, res) => {
  const posts = await Post.find({}).populate('user');
  res.render('posts/index', { posts });
})

router.get('/new', isLoggedIn, (req, res) => {
  res.render('posts/new');
})

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {

  const { title, textBody } = req.body.post;
  const post = new Post({ title, textBody });
  post.user = req.user;
  await post.save();
  res.redirect('/posts');
}))

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id).populate('user').populate({
    path: 'comments',
    populate: {
      path: 'user'
    }
  });
  res.render('posts/show', { post });
})

router.delete('/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (res.locals.currentUser && post.user.equals(res.locals.currentUser._id)) {
    await Post.deleteOne({ _id: id });
    res.redirect('/posts')
  } else {
    res.redirect(`/posts/${id}`)
  }

})

router.get('/:id/edit', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  if (req.user && post.user.equals(req.user._id)) {
    res.render('posts/edit', { post });
  } else {
    res.redirect(`/posts/${id}`);
  }
})

router.put('/:id', isLoggedIn, validatePost, async (req, res) => {
  const { id } = req.params;
  const { title, textBody } = req.body.post;
  const post = await Post.findById(id);
  if (req.user && post.user.equals(req.user._id)) {
    await Post.updateOne({ _id: id }, { title, textBody });
    res.redirect(`/posts/${id}`);
  } else {
    res.redirect(`/posts/${id}`)
  }
})

router.post('/:id/comments', isLoggedIn, catchAsync(async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  let comment = new Comment({ commentText: req.body.comment, user: req.user._id })
  comment = await comment.save();
  post.comments.push(comment._id);
  await post.save();
  res.redirect(`/posts/${id}`);
}))

router.delete('/:id/comments/:comment_id', isLoggedIn, catchAsync(async (req, res) => {
  const { id, comment_id } = req.params;
  const post = await Post.findById(id);
  if (res.locals.currentUser && post.user.equals(res.locals.currentUser._id)) {
    await Comment.deleteOne({ _id: comment_id });
    await Post.findByIdAndUpdate(id, { $pull: { comments: comment_id } });
  }
  res.redirect(`/posts/${id}`);
}));

module.exports = router;