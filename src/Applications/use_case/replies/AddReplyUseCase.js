import NewReply from '../../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner, content } = useCasePayload;

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const addReply = new NewReply({
      content,
      commentId,
      owner,
    });

    return this._replyRepository.addReply(addReply);
  }
}

export default AddReplyUseCase;
