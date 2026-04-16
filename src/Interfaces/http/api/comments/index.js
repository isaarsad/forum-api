import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import CommentsController from './controller.js';
import createCommentsRouter from './routes.js';

export default (container) => {
  const commentsController = new CommentsController(container);

  const getTokenManager = () => container.getInstance(AuthenticationTokenManager.name);

  return createCommentsRouter(commentsController, getTokenManager);
};
