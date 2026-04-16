import AuthenticationsController from './controller.js';
import createAuthenticationsRouter from './routes.js';

export default (container) => {
  const authenticationsController = new AuthenticationsController(container);
  return createAuthenticationsRouter(authenticationsController);
};
