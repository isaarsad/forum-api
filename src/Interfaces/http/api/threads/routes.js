import express from 'express';
import AuthMiddleware from '../../middlewares/AuthMiddleware.js';

const createThreadsRouter = (controller, getTokenManager) => {
  const router = express.Router();

  router.post('/', AuthMiddleware(getTokenManager), controller.postThreadController);
  router.get('/:threadId', controller.getThreadController);

  return router;
};

export default createThreadsRouter;
