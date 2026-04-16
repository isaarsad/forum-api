import { vi } from 'vitest';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import DeleteCommentUseCase from '../DeleteCommentUseCase.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';

describe('DeleteCommentUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;

  beforeEach(() => {
    /** creating dependency of use case */
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadAvailability = vi.fn();
    mockCommentRepository.verifyCommentAvailability = vi.fn();
    mockCommentRepository.verifyCommentOwner = vi.fn();
    mockCommentRepository.deleteComment = vi.fn();
  });

  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCaseParams = {
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

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

  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute({
        commentId: 'comment-123',
        threadId: 'thread-123',
      }),
    ).rejects.toThrow('DELETE_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');

    expect(mockThreadRepository.verifyThreadAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentOwner).not.toBeCalled();
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });

  it('should throw error when payload not meet data type specification', async () => {
    // Arrange
    const deleteCommentUseCase = new DeleteCommentUseCase({});

    // Action & Assert
    await expect(
      deleteCommentUseCase.execute({
        commentId: 123,
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow('DELETE_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');

    expect(mockThreadRepository.verifyThreadAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentOwner).not.toBeCalled();
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
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
    await expect(
      deleteCommentUseCase.execute({
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new AuthorizationError('DELETE_COMMENT_USE_CASE.NOT_COMMENT_OWNER'));

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
    await expect(
      deleteCommentUseCase.execute({
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new NotFoundError('DELETE_COMMENT_USE_CASE.THREAD_NOT_FOUND'));

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
    await expect(
      deleteCommentUseCase.execute({
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new NotFoundError('DELETE_COMMENT_USE_CASE.COMMENT_NOT_FOUND'));

    expect(mockCommentRepository.verifyCommentOwner).not.toBeCalled();
    expect(mockCommentRepository.deleteComment).not.toBeCalled();
  });
});
