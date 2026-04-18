import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';

class AddReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, owner, content } = useCasePayload;

    const newReply = new NewReply({ content, commentId, owner });

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const addedReply = await this._replyRepository.addReply(newReply);
    return new AddedReply({
      id: addedReply.id,
      content: addedReply.content,
      owner: addedReply.owner,
    });
  }
}

export default AddReplyUseCase;
