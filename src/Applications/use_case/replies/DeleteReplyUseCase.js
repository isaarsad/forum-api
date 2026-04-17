import DeleteReply from '../../../Domains/replies/entities/DeleteReply.js';

class DeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCaseParams) {
    const { replyId, commentId, threadId, owner } = new DeleteReply(useCaseParams);

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);
    await this._replyRepository.verifyReplyAvailability(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, owner);
    await this._replyRepository.deleteReply(replyId);
  }
}

export default DeleteReplyUseCase;
