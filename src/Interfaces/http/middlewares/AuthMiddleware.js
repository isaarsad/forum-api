import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const AuthMiddleware = (getTokenManager) => async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AuthenticationError('Missing authentication');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new AuthenticationError('Token Invalid');
  }

  const authenticationTokenManager = getTokenManager();

  await authenticationTokenManager.verifyAccessToken(token);

  const { id, username } = await authenticationTokenManager.decodePayload(token);

  req.user = { id, username };

  next();
};

export default AuthMiddleware;
