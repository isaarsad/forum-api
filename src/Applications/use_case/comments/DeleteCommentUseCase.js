class DeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCaseParams) {
    this._verifyPayload(useCaseParams);
    const { commentId, threadId, owner } = useCaseParams;

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, owner);
    await this._commentRepository.deleteComment(commentId);
  }

  _verifyPayload({ commentId, threadId, owner }) {
    if (!commentId || !threadId || !owner) {
      throw new Error('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof commentId !== 'string' ||
      typeof threadId !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error('DELETE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default DeleteCommentUseCase;
