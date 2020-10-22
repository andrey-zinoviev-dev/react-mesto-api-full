const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/notFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');

const showUsers = (req, res, next) => {
  User.find({})
    .then((data) => {
      if (data.length === 0) {
        throw new NotFoundError('Карточки не найдены');
      }
      res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
};
//  пользователь показывается по :id
const showUser = (req, res, next) => {
  const { id } = req.params;
  User.findById(id)
    .then((data) => {
      if (!data) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
      // res.status(404).send({ message: 'Пользователь не найден' });
    });
};
const addUser = (req, res, next) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          throw new Error('Пользователь уже существует');
        }
        User.create({
          name: 'Владимир', about: 'На массе на сушках', avatar: 'https://i.ytimg.com/vi/mgx0q5mEuP8/maxresdefault.jpg', email, password: hash,
        })
          .then((data) => {
            if (!data) {
              throw new UnauthorizedError('Переданы некорректные данные');
            }
            res.status(201).send(data);
          })
          .catch((err) => {
            next(err);
          });
      })
      .catch((err) => {
        next(err);
      // res.status(400).send({ message: 'Переданы некорректные данные' });
      });
  });
};

const updateUser = (req, res, next) => {
  const { _id } = req.user;

  if (req.body._id) {
    return res.status(400).send({ message: 'Нет прав для этой операции' });
  }

  return User.findByIdAndUpdate(_id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        throw new BadRequestError('Переданы некорректные данные');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
      // res.status(400).send({ message: 'Переданы некорректные данные ' });
    });
};

const updateUserAvatar = (req, res, next) => {
  const { _id } = req.user;
  const { avatar } = req.body;
  if (req.body._id) {
    throw new ForbiddenError('Нет прав для этой операции');
    // return res.status(400).send({ message: "Нет прав для этой операции" });
  }
  return User.findByIdAndUpdate(_id, { avatar }, { new: true })
    .then((data) => {
      if (!data) {
        throw new BadRequestError('Переданыеы некорректные данные');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
      // res.status(400).send({ message: 'Переданы некорректные данные' });
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Проверьте почту или пароль');
    // return res.status(401).send({ message: "Проверьте почту или пароль"});
  }

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
      // return Promise.reject(new Error('Пользвоатель не найден'));
        throw new NotFoundError('Пользователь не найден');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new BadRequestError('Проверьте почту или пароль');
            // return Promise.reject(new Error('Проверьте почту или пароль'));
          }
          const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '5d' });
          res.status(200).send({ payload: token });
        });
    })
    .catch((err) => {
      next(err);
    // res.status(404).send({ message: 'Пользователь не найден' });
    });
};
const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  if (!_id) {
    throw new NotFoundError('Пользователь не найден');
  }
  User.findById(_id)
    .then((data) => {
      if (!data) {
        throw new Error('Ошибка сервера');
      }
      res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
  // return res.status(200).send({ message: _id });
};

module.exports = {
  showUsers,
  showUser,
  addUser,
  updateUser,
  updateUserAvatar,
  login,
  getCurrentUser,
};
