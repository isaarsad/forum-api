import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, owner, content } = useCasePayload;

    const newComment = new NewComment({ content, threadId, owner });

    await this._threadRepository.verifyThreadAvailability(threadId);

    const addedComment = await this._commentRepository.addComment(newComment);
    return new AddedComment({
      id: addedComment.id,
      content: addedComment.content,
      owner: addedComment.owner,
    });
  }
}

export default AddCommentUseCase;
