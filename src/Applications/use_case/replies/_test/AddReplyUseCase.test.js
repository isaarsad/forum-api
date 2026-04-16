import { vi } from 'vitest';
import NewReply from '../../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../../../Domains/replies/ReplyRepository.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import AddReplyUseCase from '../AddReplyUseCase.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
    };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    const mockAddedReply = new AddedReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedReply));

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute({
      ...useCasePayload,
      threadId,
      commentId,
      owner,
    });

    // Assert
    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: useCasePayload.content,
        owner: owner,
      }),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);
    expect(mockCommentRepository.verifyCommentAvailability).toBeCalledWith(commentId);

    expect(mockReplyRepository.addReply).toBeCalledWith(
      new NewReply({
        content: useCasePayload.content,
        commentId: commentId,
        owner: owner,
      }),
    );
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
    };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('THREAD_NOT_FOUND')));
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReply = vi.fn();

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute({
        ...useCasePayload,
        threadId,
        commentId,
        owner,
      }),
    ).rejects.toThrow(new NotFoundError('THREAD_NOT_FOUND'));

    expect(mockCommentRepository.verifyCommentAvailability).not.toBeCalled();
    expect(mockReplyRepository.addReply).not.toBeCalled();
  });

  it('should throw NotFoundError when comment not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
    };
    const threadId = 'thread-123';
    const commentId = 'comment-123';
    const owner = 'user-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentAvailability = vi
      .fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('COMMENT_NOT_FOUND')));
    mockReplyRepository.addReply = vi.fn();

    /** creating use case instance */
    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(
      addReplyUseCase.execute({
        ...useCasePayload,
        threadId,
        commentId,
        owner,
      }),
    ).rejects.toThrow(new NotFoundError('COMMENT_NOT_FOUND'));

    expect(mockReplyRepository.addReply).not.toBeCalled();
  });
});
