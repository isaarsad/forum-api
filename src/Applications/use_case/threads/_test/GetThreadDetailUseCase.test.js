import NotFoundError from '../../../../Commons/exceptions/NotFoundError.js';
import CommentRepository from '../../../../Domains/comments/CommentRepository.js';
import ReplyRepository from '../../../../Domains/replies/ReplyRepository.js';
import DetailThread from '../../../../Domains/threads/entities/DetailThread.js';
import ThreadRepository from '../../../../Domains/threads/ThreadRepository.js';
import GetThreadDetailUseCase from '../GetThreadDetailUseCase.js';

describe('GetThreadDetailUseCase', () => {
  it('should orchestrate the get thread detail action correctly', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    const detailThread = {
      id: useCaseParams.threadId,
      title: 'title',
      body: 'body',
      date: 'date',
      username: 'username',
    };

    /* eslint-disable camelcase */
    const detailComments = [
      {
        id: 'comment-123',
        username: 'username',
        date: 'date',
        content: 'comment content',
        is_delete: false,
      },
      {
        id: 'comment-456',
        username: 'username',
        date: 'date',
        content: 'comment content',
        is_delete: true,
      },
    ];

    const detailReplies = [
      {
        id: 'reply-123',
        comment_id: 'comment-123',
        username: 'username',
        content: 'reply content',
        date: 'date',
        is_delete: false,
      },
      {
        id: 'reply-456',
        comment_id: 'comment-123',
        username: 'username',
        content: 'reply content',
        date: 'date',
        is_delete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi.fn().mockResolvedValue(detailThread);
    mockCommentRepository.getCommentsByThreadId = vi.fn().mockResolvedValue(detailComments);
    mockReplyRepository.getRepliesByThreadId = vi.fn().mockResolvedValue(detailReplies);

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadById = await getThreadDetailUseCase.execute(useCaseParams.threadId);

    // Assert
    expect(getThreadById).toStrictEqual(
      new DetailThread({
        id: 'thread-123',
        title: 'title',
        body: 'body',
        date: 'date',
        username: 'username',
        comments: [
          {
            id: 'comment-123',
            username: 'username',
            date: 'date',
            content: 'comment content',
            isDelete: false,
            replies: [
              {
                id: 'reply-123',
                username: 'username',
                date: 'date',
                content: 'reply content',
                isDelete: false,
              },
              {
                id: 'reply-456',
                username: 'username',
                date: 'date',
                content: 'reply content',
                isDelete: true,
              },
            ],
          },
          {
            id: 'comment-456',
            username: 'username',
            date: 'date',
            content: 'comment content',
            isDelete: true,
            replies: [],
          },
        ],
      }),
    );

    // ensure internal property (isDelete) is not exposed in final output
    expect(getThreadById.comments[0]).not.toHaveProperty('isDelete');
    expect(getThreadById.comments[0].replies[0]).not.toHaveProperty('isDelete');

    expect(getThreadById.comments[0].content).toEqual('comment content');
    expect(getThreadById.comments[1].content).toEqual('**komentar telah dihapus**');

    expect(getThreadById.comments[0].replies[0].content).toEqual('reply content');
    expect(getThreadById.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).toBeCalledWith(useCaseParams.threadId);
    expect(mockReplyRepository.getRepliesByThreadId).toBeCalledWith(useCaseParams.threadId);
  });

  it('should throw NotFoundError when thread is not found', async () => {
    // Arrange
    const useCaseParams = {
      threadId: 'thread-123',
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi
      .fn()
      .mockImplementation(() => Promise.reject(new NotFoundError('THREAD_NOT_FOUND')));
    mockCommentRepository.getCommentsByThreadId = vi.fn();
    mockReplyRepository.getRepliesByThreadId = vi.fn();

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action & Assert
    await expect(getThreadDetailUseCase.execute(useCaseParams.threadId)).rejects.toThrow(
      new NotFoundError('THREAD_NOT_FOUND'),
    );

    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCaseParams.threadId);
    expect(mockCommentRepository.getCommentsByThreadId).not.toBeCalled();
    expect(mockReplyRepository.getRepliesByThreadId).not.toBeCalled();
  });
});
