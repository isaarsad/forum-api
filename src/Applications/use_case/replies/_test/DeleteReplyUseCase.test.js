import { vi } from 'vitest';
import ReplyRepository from '../../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import DeleteReplyUseCase from '../DeleteReplyUseCase.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../../Commons/exceptions/AuthorizationError.js';

describe('DeleteReplyUseCase', () => {
  let mockThreadRepository;
  let mockCommentRepository;
  let mockReplyRepository;

  beforeEach(() => {
    /** creating dependency of use case */
    mockThreadRepository = new ThreadRepository();
    mockCommentRepository = new CommentRepository();
    mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadAvailability = vi.fn();
    mockCommentRepository.verifyCommentAvailability = vi.fn();
    mockReplyRepository.verifyReplyAvailability = vi.fn();
    mockReplyRepository.verifyReplyOwner = vi.fn();
    mockReplyRepository.deleteReply = vi.fn();
  });

  it('should orchestrating the delete reply action correctly', async () => {
    // Arrange
    const useCaseParams = {
      replyId: 'reply-123',
      commentId: 'comment-123',
      threadId: 'thread-123',
      owner: 'user-123',
    };

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockReplyRepository.verifyReplyAvailability.mockResolvedValue();
    mockReplyRepository.verifyReplyOwner.mockResolvedValue();
    mockReplyRepository.deleteReply.mockResolvedValue();

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCaseParams);

    // Assert
    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCaseParams.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCaseParams.commentId,
    );
    expect(mockReplyRepository.verifyReplyAvailability).toHaveBeenCalledWith(useCaseParams.replyId);
    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      useCaseParams.replyId,
      useCaseParams.owner,
    );
    expect(mockReplyRepository.deleteReply).toHaveBeenCalledWith(useCaseParams.replyId);
  });

  it('should throw error when payload not contain needed property', async () => {
    // Arrange
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute({
        replyId: 'reply-123',
        threadId: 'thread-123',
        commentId: 'comment-123',
      }),
    ).rejects.toThrow('DELETE_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');

    expect(mockThreadRepository.verifyThreadAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toBeCalled();
    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });

  it('should throw error when payload not meet data type specification', async () => {
    // Arrange
    const deleteReplyUseCase = new DeleteReplyUseCase({});

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute({
        replyId: 123,
        threadId: 'thread-123',
        commentId: 'comment-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow('DELETE_REPLY_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION');

    expect(mockThreadRepository.verifyThreadAvailability).not.toBeCalled();
    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toBeCalled();
    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });

  it('should throw AuthorizationError when user is not the reply owner', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockReplyRepository.verifyReplyAvailability.mockResolvedValue();
    mockReplyRepository.verifyReplyOwner.mockRejectedValue(
      new AuthorizationError('DELETE_REPLY_USE_CASE.NOT_REPLY_OWNER'),
    );

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute({
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new AuthorizationError('DELETE_REPLY_USE_CASE.NOT_REPLY_OWNER'));

    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockRejectedValue(
      new NotFoundError('DELETE_REPLY_USE_CASE.THREAD_NOT_FOUND'),
    );

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute({
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new NotFoundError('DELETE_REPLY_USE_CASE.THREAD_NOT_FOUND'));

    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toBeCalled();
    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });

  it('should throw NotFoundError when comment not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockRejectedValue(
      new NotFoundError('DELETE_REPLY_USE_CASE.COMMENT_NOT_FOUND'),
    );

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute({
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new NotFoundError('DELETE_REPLY_USE_CASE.COMMENT_NOT_FOUND'));

    expect(mockReplyRepository.verifyReplyAvailability).not.toBeCalled();
    expect(mockReplyRepository.verifyReplyOwner).not.toBeCalled();
    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });

  it('should throw NotFoundError when reply not found', async () => {
    // Arrange

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability.mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability.mockResolvedValue();
    mockReplyRepository.verifyReplyAvailability.mockRejectedValue(
      new NotFoundError('DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND'),
    );

    /** creating use case instance */
    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      deleteReplyUseCase.execute({
        replyId: 'reply-123',
        commentId: 'comment-123',
        threadId: 'thread-123',
        owner: 'user-123',
      }),
    ).rejects.toThrow(new NotFoundError('DELETE_REPLY_USE_CASE.REPLY_NOT_FOUND'));

    expect(mockReplyRepository.verifyReplyOwner).not.toBeCalled();
    expect(mockReplyRepository.deleteReply).not.toBeCalled();
  });
});
