import { vi } from 'vitest';
import NewComment from '../../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../../Domains/comments/entities/AddedComment.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import AddCommentUseCase from '../AddCommentUseCase.js';
import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';

describe('AddCommentUseCase', () => {
  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
    };
    const threadId = 'thread-123';
    const owner = 'user-123';

    const mockAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner,
    });

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = vi
      .fn()
      .mockImplementation(() => Promise.resolve(mockAddedComment));

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action
    const addedComment = await addCommentUseCase.execute({ ...useCasePayload, threadId, owner });

    // Assert
    expect(addedComment).toStrictEqual(
      new AddedComment({
        id: 'comment-123',
        content: useCasePayload.content,
        owner,
      }),
    );

    expect(mockThreadRepository.verifyThreadAvailability).toBeCalledWith(threadId);

    expect(mockCommentRepository.addComment).toBeCalledWith(
      new NewComment({
        content: useCasePayload.content,
        threadId,
        owner,
      }),
    );
  });

  it('should throw NotFoundError when thread not found', async () => {
    // Arrange
    const useCasePayload = {
      content: 'content',
    };
    const threadId = 'thread-123';
    const owner = 'user-123';

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    /** mocking needed function */
    mockThreadRepository.verifyThreadAvailability = vi
      .fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('THREAD_NOT_FOUND')));
    mockCommentRepository.addComment = vi.fn();

    /** creating use case instance */
    const addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });

    // Action & Assert
    await expect(
      addCommentUseCase.execute({
        ...useCasePayload,
        threadId,
        owner,
      }),
    ).rejects.toThrow(new NotFoundError('THREAD_NOT_FOUND'));

    expect(mockThreadRepository.verifyThreadAvailability).toHaveBeenCalledWith(threadId);
    expect(mockCommentRepository.addComment).not.toBeCalled();
  });
});
