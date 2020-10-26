require('dotenv').config();

// if (!process.env.SECRET_KEY) {
//   throw new Error('Не установлена переменная SECRET_KEY');
// }

const express = require('express');

// const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const cardsRouter = require('./routes/cards');
const router = require('./routes/users');
const { login, addUser } = require('./controllers/users');
const { authentificate } = require('./middlewares/auth');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/notFoundError');

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const errorHandler = (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
};

app.use(bodyParser.json());

app.use(cors({
  origin: 'https://scp.students.nomoreparties.space',
}));

app.use(requestLogger);

app.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error('Сервер сейчас упадёт');
  }, 0);
});

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), addUser);

app.use(authentificate);

app.use('/', router);
app.use('/', cardsRouter);
app.use(errorLogger);
app.use(errorHandler);

app.use(errors());
//  eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).send({ message: res.status === 500 ? 'Ошибка сервера' : err.message });
});

const { PORT = 3000 } = process.env;
//  eslint-disable-next-line no-console
app.listen(PORT, () => {
  console.log('Listenning at the prot: ', PORT);
});
