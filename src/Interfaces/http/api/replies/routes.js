import express from 'express';
import AuthMiddleware from '../../middlewares/AuthMiddleware.js';

const createRepliesRouter = (controller, getTokenManager) => {
  const router = express.Router({ mergeParams: true });

  router.post('/', AuthMiddleware(getTokenManager), controller.postReplyController);
  router.delete('/:replyId', AuthMiddleware(getTokenManager), controller.deleteReplyController);

  return router;
};

export default createRepliesRouter;
