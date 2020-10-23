const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/notFoundError');
const UnauthorizedError = require('../errors/UnauthorizedError');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const UserExistsError = require('../errors/UserExistsError');
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
    })
}

const addUser = (req, res, next) => {
  const { email, password } = req.body;
  bcrypt.hash(password, 10).then((hash) => {
    User.findOne({ email })
      .then((user) => {
        if (user) {
          throw new UserExistsError('Пользователь уже существует');
        }
        User.create({
          name: 'Владимир', about: 'На массе на сушках', avatar: 'https://i.ytimg.com/vi/mgx0q5mEuP8/maxresdefault.jpg', email, password: hash,
        })
          .then((data) => {
            res.status(201).send({ message: "Пользователь успешно создан!"});
          })
          .catch((err) => {
            next(new UnauthorizedError('Переданы некорректные данные'));
          });
      })
      .catch((err) => {
        next(err);

      });
  });
};

const updateUser = (req, res, next) => {
  const { _id } = req.user;

  if (req.body._id) {
    return res.status(400).send({ message: 'Нет прав для этой операции' });
  }

  return User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
    .then((data) => {
      if (!data) {
        throw new BadRequestError('Переданы некорректные данные');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);

    });
};

const updateUserAvatar = (req, res, next) => {
  const { _id } = req.user;
  const { avatar } = req.body;
  if (req.body._id) {
    throw new ForbiddenError('Нет прав для этой операции');

  }
  return User.findByIdAndUpdate(_id, { avatar }, { new: true, runValidators: true })
    .then((data) => {
      if (!data) {
        throw new BadRequestError('Переданы некорректные данные');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);

    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Проверьте почту или пароль');

  }

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {

        throw new NotFoundError('Пользователь не найден');
      }
      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new BadRequestError('Проверьте почту или пароль');

          }
          const token = jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '5d' });
          res.status(200).send({ payload: token });
        });
    })
    .catch((err) => {
      next(err);

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
