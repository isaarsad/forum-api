import { vi } from 'vitest';
import NewLike from '../../../../Domains/comments/entities/NewLike.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import LikeCommentUseCase from '../LikeCommentUseCase.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';

describe('LikeCommentUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;

  const useCasePayload = {
    threadId: 'thread-123',
    commentId: 'comment-123',
    userId: 'user-123',
  };

  beforeEach(() => {
    /** creating dependency of use case */
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = vi.fn();
    mockCommentRepository.verifyCommentAvailability = vi.fn();
    mockCommentRepository.checkIsLiked = vi.fn();
    mockCommentRepository.addLike = vi.fn();
    mockCommentRepository.deleteLike = vi.fn();
  });

  it('should orchestrate like comment action correctly', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockCommentRepository.checkIsLiked.mockResolvedValue(false);
    mockCommentRepository.addLike.mockResolvedValue();

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.checkIsLiked).toHaveBeenCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId,
    );

    expect(mockCommentRepository.addLike).toHaveBeenCalledWith(
      new NewLike({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
        userId: useCasePayload.userId,
      }),
    );

    expect(mockCommentRepository.deleteLike).not.toHaveBeenCalled();
  });

  it('should orchestrate unlike comment action correctly', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockCommentRepository.checkIsLiked.mockResolvedValue(true);
    mockCommentRepository.deleteLike.mockResolvedValue();

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    await likeCommentUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockCommentRepository.checkIsLiked).toHaveBeenCalledWith(
      useCasePayload.userId,
      useCasePayload.commentId,
    );

    expect(mockCommentRepository.deleteLike).toHaveBeenCalledWith(
      new NewLike({
        threadId: useCasePayload.threadId,
        commentId: useCasePayload.commentId,
        userId: useCasePayload.userId,
      }),
    );

    expect(mockCommentRepository.addLike).not.toHaveBeenCalled();
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockRejectedValue(
      new NotFoundError('LIKE_COMMENT_USE_CASE.THREAD_NOT_FOUND'),
    );

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(likeCommentUseCase.execute(useCasePayload)).rejects.toThrow(
      new NotFoundError('LIKE_COMMENT_USE_CASE.THREAD_NOT_FOUND'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );

    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockCommentRepository.checkIsLiked).not.toBeCalled();
    expect(mockCommentRepository.addLike).not.toBeCalled();
    expect(mockCommentRepository.deleteLike).not.toBeCalled();
  });

  it('should throw NotFoundError when comment not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockRejectedValue(
      new NotFoundError('LIKE_COMMENT_USE_CASE.COMMENT_NOT_FOUND'),
    );

    /** creating use case instance */
    const likeCommentUseCase = new LikeCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(likeCommentUseCase.execute(useCasePayload)).rejects.toThrow(
      new NotFoundError('LIKE_COMMENT_USE_CASE.COMMENT_NOT_FOUND'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );

    expect(mockCommentRepository.checkIsLiked).not.toBeCalled();
    expect(mockCommentRepository.addLike).not.toBeCalled();
    expect(mockCommentRepository.deleteLike).not.toBeCalled();
  });
});
