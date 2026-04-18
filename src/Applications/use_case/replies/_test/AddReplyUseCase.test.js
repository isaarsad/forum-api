import { vi } from 'vitest';
import NewReply from '../../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import AddReplyUseCase from '../AddReplyUseCase.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    const mockAddedReply = {
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.owner,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    mockReplyRepository.addReply = vi.fn().mockResolvedValue(mockAddedReply);

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: 'content',
        owner: 'user-123',
      }),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );

    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply({
        content: useCasePayload.content,
        commentId: useCasePayload.commentId,
        owner: useCasePayload.owner,
      }),
    );
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockRejectedValue(new NotFoundError('THREAD_NOT_FOUND'));
    mockCommentRepository.verifyCommentAvailability = vi.fn().mockResolvedValue();
    mockReplyRepository.addReply = vi.fn();

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      new NotFoundError('THREAD_NOT_FOUND'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });

  it('should throw NotFoundError when comment not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
      threadId: 'thread-123',
      commentId: 'comment-123',
      owner: 'user-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi.fn().mockResolvedValue();
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockRejectedValue(new NotFoundError('COMMENT_NOT_FOUND'));
    mockReplyRepository.addReply = vi.fn();

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(addReplyUseCase.execute(useCasePayload)).rejects.toThrow(
      new NotFoundError('COMMENT_NOT_FOUND'),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.verifyCommentAvailability).toHaveBeenCalledWith(
      useCasePayload.commentId,
    );
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});
