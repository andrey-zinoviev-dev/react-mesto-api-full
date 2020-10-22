const jwt = require('jsonwebtoken');
const UnauthorizedError = require('../errors/UnauthorizedError');

const authentificate = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).send({ message: 'Необходима авторизация' });
  }
  const token = authorization.replace('Bearer ', '');
  try {
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.user = payload;
  } catch (err) {
    throw new UnauthorizedError('Неверный токен');
  }

  next();
};

module.exports = {
  authentificate,
};
