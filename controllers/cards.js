// const card = require('../models/card');
const Card = require('../models/card');
const BadRequestError = require('../errors/badRequestError');
const ForbiddenError = require('../errors/forbiddenError');
const NotFountError = require('../errors/notFoundError');

const showCards = (req, res, next) => {
  Card.find({})
    .populate('likes')
    .then((data) => {
      if (!data) {
        throw new NotFountError('Карточки не найдены');
      }
      return res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const { _id } = req.user;
  Card.create({ name, link, owner: _id })
    .then((data) => {
      if (!data) {
        throw new BadRequestError('Переданы некорректные данные');
      }
      res.status(201).send(data);
    })
    .catch((err) => {
      next(err);
    });
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const { _id } = req.user;
  Card.findById(cardId)
    .populate('owner')
    .then((data) => {
      if (!data) {
        throw new NotFountError('Карточка не найдена');
      }
      const ownerId = data.owner._id.toString();
      if (ownerId === _id) {
        return Card.findByIdAndDelete(cardId)
          .then((card) => {
            if (!card) {
              throw new NotFountError('Карточка не найдена');
            }
            res.status(200).send(card);
          })
          .catch((err) => {
            next(err);
            // res.status(404).send({ message: 'Карточка не найдена' });
          });
      }
      throw new ForbiddenError('У Вас нет прав для удаления');
    // return res.status(400).send({ message: 'У Вас нет прав для удаления' });
    })
    .catch((err) => {
      next(err);
    // res.status(404).send({ message: 'Карточка не найдена' });
    });
};

const likeCard = (req, res, next) => {
  const { _id } = req.user;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $addToSet: { likes: _id } }, { new: true })
    .populate('likes')
    .then((data) => {
      if (!data) {
        throw new NotFountError('Карточка не найдена');
      }
      res.status(200).send(data.populate('likes'));
    })
    .catch((err) => {
      next(err);
      // res.status(404).send({ message: 'Карточка не найдена' });
    });
};

const dislikeCard = (req, res, next) => {
  const { _id } = req.user;
  const { cardId } = req.params;
  Card.findByIdAndUpdate(cardId, { $pull: { likes: _id } }, { new: true })
    .then((data) => {
      if (!data) {
        throw new NotFountError('Карточка не надйдена');
      }
      res.status(200).send(data);
    })
    .catch((err) => {
      next(err);
    });
};
module.exports = {
  showCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
