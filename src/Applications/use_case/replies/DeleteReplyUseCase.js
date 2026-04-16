class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    this._verifyPayload(useCaseParams);
    const { replyId, commentId, threadId, owner } = useCaseParams;

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._replyRepository.verifyReplyAvailability(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }

  _verifyPayload({ replyId, commentId, threadId, owner }) {
    if (!replyId || !commentId || !threadId || !owner) {
      throw new Error('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }
    if (
      typeof replyId !== 'string' ||
      typeof commentId !== 'string' ||
      typeof threadId !== 'string' ||
      typeof owner !== 'string'
    ) {
      throw new Error('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

export default DeleteReplyUseCase;
