import UsersController from './controller.js';
import createUsersRouter from './routes.js';

export default (container) => {
  const usersController = new UsersController(container);
  return createUsersRouter(usersController);
};
