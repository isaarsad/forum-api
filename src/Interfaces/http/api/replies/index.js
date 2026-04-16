import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import RepliesController from './controller.js';
import createRepliesRouter from './routes.js';

export default (container) => {
  const repliesController = new RepliesController(container);

  const getTokenManager = () => container.getInstance(AuthenticationTokenManager.name);

  return createRepliesRouter(repliesController, getTokenManager);
};
