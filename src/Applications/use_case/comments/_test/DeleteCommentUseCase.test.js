import { vi } from 'vitest';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';

describe('DeleteCommentUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;

  const useCaseParams = {
    commentId: 'comment-123',
    threadId: 'thread-123',
    owner: 'user-123',
  };

  beforeEach(() => {
    /** creating dependency of use case */
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = vi.fn();
    mockCommentRepository.verifyCommentAvailability = vi.fn();
    mockCommentRepository.verifyCommentOwner = vi.fn();
    mockCommentRepository.deleteComment = vi.fn();
  });

  it('should orchestrate the delete comment action correctly', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentOwner.mockResolvedValue();
    mockCommentRepository.deleteComment.mockResolvedValue();

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    await deleteCommentUseCase.execute(useCaseParams);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
    );
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.owner,
    );
    expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(useCaseParams.commentId);
  });

  it('should throw AuthorizationError when user is not the comment owner', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentOwner.mockRejectedValue(
      new AuthorizationError('DELETE_COMMENT_USE_CASE.NOT_COMMENT_OWNER'),
    );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams)).rejects.toThrow(
      new AuthorizationError('DELETE_COMMENT_USE_CASE.NOT_COMMENT_OWNER'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
    );
    expect(mockCommentRepository.verifyCommentOwner).toHaveBeenCalledWith(
      useCaseParams.commentId,
      useCaseParams.owner,
    );

    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockRejectedValue(
      new NotFoundError('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND'),
    );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams)).rejects.toThrow(
      new NotFoundError('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );

    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentOwner).not.toBeCalled();
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });

  it('should throw NotFoundError when comment not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockRejectedValue(
      new NotFoundError('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND'),
    );

    /** creating use case instance */
    const deleteCommentUseCase = new DeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action & Assert
    await expect(deleteCommentUseCase.execute(useCaseParams)).rejects.toThrow(
      new NotFoundError('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
    );

    expect(mockCommentRepository.verifyCommentOwner).not.toBeCalled();
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });
});
