import express from 'express';

const createAuthenticationsRouter = (controller) => {
  const router = express.Router();

  router.post('/', controller.postAuthenticationController);
  router.put('/', controller.putAuthenticationController);
  router.delete('/', controller.deleteAuthenticationController);

  return router;
};

export default createAuthenticationsRouter;
