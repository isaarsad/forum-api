import express from 'express';

const createUsersRouter = (controller) => {
  const router = express.Router();

  router.post('/', controller.postUserController);

  return router;
};

export default createUsersRouter;
