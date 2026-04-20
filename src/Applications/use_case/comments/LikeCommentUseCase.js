import NewLike from '../../../Domains/comments/entities/NewLike.js';

class LikeCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId, commentId, userId } = useCasePayload;

    const newLike = new NewLike({ threadId, commentId, userId });

    await this._threadRepository.verifyThreadAvailability(threadId);
    await this._commentRepository.verifyCommentAvailability(commentId);

    const isLiked = await this._commentRepository.checkIsLiked(userId, commentId);

    if (!isLiked) {
      await this._commentRepository.addLike(newLike);
    } else {
      await this._commentRepository.deleteLike(newLike);
    }
  }
}

export default LikeCommentUseCase;
