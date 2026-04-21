import AddCommentUseCase from '../../../../Applications/use_case/comments/AddCommentUseCase.js';
import DeleteCommentUseCase from '../../../../Applications/use_case/comments/DeleteCommentUseCase.js';

class CommentsController {
  constructor(container) {
    this._container = container;

    this.postCommentController = this.postCommentController.bind(this);
    this.deleteCommentController = this.deleteCommentController.bind(this);
    this.putLikeCommentController = this.putLikeCommentController.bind(this);
  }

  async postCommentController(req, res) {
    const addCommentUseCase = this._container.getInstance(AddCommentUseCase.name);

    const addedComment = await addCommentUseCase.execute({
      ...req.body,
      threadId: req.params.threadId,
      owner: req.user.id,
    });

    res.status(201).json({
      status: 'success',
      data: {
        addedComment,
      },
    });
  }

  async deleteCommentController(req, res) {
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentUseCase.name);

    await deleteCommentUseCase.execute({
      ...req.params,
      owner: req.user.id,
    });

    res.status(200).json({
      status: 'success',
    });
  }
}

export default CommentsController;
