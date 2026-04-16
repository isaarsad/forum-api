import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import ThreadsController from './controller.js';
import createThreadsRouter from './routes.js';

export default (container) => {
  const threadsController = new ThreadsController(container);

  const getTokenManager = () => container.getInstance(AuthenticationTokenManager.name);

  return createThreadsRouter(threadsController, getTokenManager);
};
