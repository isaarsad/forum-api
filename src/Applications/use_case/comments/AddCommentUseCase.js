import NewComment from '../../../Domains/comments/entities/NewComment.js';

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const addComment = new NewComment(useCasePayload);
    await this._threadRepository.verifyThreadAvailability(addComment.threadId);
    return this._commentRepository.addComment(addComment);
  }
}

export default AddCommentUseCase;
