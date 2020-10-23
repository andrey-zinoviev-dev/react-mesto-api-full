const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ForbiddenError = require('../errors/forbiddenError');
const authentificate = (req, res, next) => {
  const { authorization } = req.headers;

  if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '');
      try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload;
        next();
      }
      catch (err) {
        throw new UnauthorizedError('Неверный токен');
      }
  } else {
      next(new ForbiddenError('Необходима авторизация'));
  }
    // return res.status(401).send({ message: 'Необходима авторизация' });
};

module.exports = {
  authentificate,
};
