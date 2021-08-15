const express = require('express');
const Post = require('../models/post');
const isLoggedIn = require('../middlewares');
const catchAsync = require('../utils/catchAsync');
// const Joi = require('joi');
const ExpressError = require('../utils/ExpressError');
const validatePost = require('../schemas');

const router = express.Router();




router.get('/', async (req, res) => {
  const posts = await Post.find({});
  res.render('posts/index', { posts });
})

router.get('/new', isLoggedIn, (req, res) => {
  res.render('posts/new');
})

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {

  const { title, textBody } = req.body.post;
  const post = new Post({ title, textBody });
  await post.save();
  res.redirect('/posts');
}))

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.render('posts/show', { post });
})

router.delete('/:id', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  await Post.deleteOne({ _id: id });
  res.redirect('/posts')
})

router.get('/:id/edit', isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  res.render('posts/edit', { post });
})

router.put('/:id', isLoggedIn, validatePost, async (req, res) => {
  const { id } = req.params;
  const { title, textBody } = req.body.post;
  await Post.updateOne({ _id: id }, { title, textBody });
  res.redirect(`/posts/${id}`);
})

module.exports = router;