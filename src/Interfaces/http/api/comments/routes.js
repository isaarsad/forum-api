import express from 'express';
import AuthMiddleware from '../../middlewares/AuthMiddleware.js';

const createCommentsRouter = (controller, getTokenManager) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', AuthMiddleware(getTokenManager), controller.postCommentController);
  router.delete('/:commentId', AuthMiddleware(getTokenManager), controller.deleteCommentController);
  router.put(
    '/:commentId/likes',
    AuthMiddleware(getTokenManager),
    controller.putLikeCommentController,
  );

  return router;
};

export default createCommentsRouter;
