const express = require('express');
const { celebrate, Joi } = require('celebrate');
const {
  showUsers, showUser, updateUser, updateUserAvatar, getCurrentUser,
} = require('../controllers/users');

const router = express.Router();

router.get('/users', showUsers);
router.get('/users/me', getCurrentUser);

router.get('/users/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), showUser);

router.patch('/users/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateUser);

router.patch('/users/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().regex(/^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+=]+$/),
  }),
}), updateUserAvatar);

module.exports = router;
