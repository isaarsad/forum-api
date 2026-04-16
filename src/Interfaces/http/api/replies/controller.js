import AddReplyUseCase from '../../../../Applications/use_case/replies/AddReplyUseCase.js';
import DeleteReplyUseCase from '../../../../Applications/use_case/replies/DeleteReplyUseCase.js';

class RepliesController {
  constructor(container) {
    this._container = container;

    this.postReplyController = this.postReplyController.bind(this);
    this.deleteReplyController = this.deleteReplyController.bind(this);
  }

  async postReplyController(req, res) {
    const addReplyUseCase = this._container.getInstance(AddReplyUseCase.name);

    const addedReply = await addReplyUseCase.execute({
      ...req.body,
      threadId: req.params.threadId,
      commentId: req.params.commentId,
      owner: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        addedReply,
      },
    });
  }

  async deleteReplyController(req, res) {
    const deleteReplyUseCase = this._container.getInstance(DeleteReplyUseCase.name);

    await deleteReplyUseCase.execute({
      ...req.params,
      owner: req.user.id,
    });

    res.status(200).json({
      status: 'success',
    });
  }
}

export default RepliesController;
