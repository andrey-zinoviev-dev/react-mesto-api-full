const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');
const ForbiddenError = require('../errors/forbiddenError');
const authentificate = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    try {
      const token = authorization.replace('Bearer ', '');
      try {
        const payload = jwt.verify(token, process.env.SECRET_KEY);
        req.user = payload;
      }
      catch (err) {
        throw new UnauthorizedError('Неверный токен');
      }
    }
    // return res.status(401).send({ message: 'Необходима авторизация' });
    catch(err) {
      throw new ForbiddenError('Необходима авторизация');
    }
  }


  next();
};

module.exports = {
  authentificate,
};
