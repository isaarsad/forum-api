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

    const detailComments = [
      {
        id: 'comment-123',
        username: 'username',
        date: 'date',
        content: 'comment content',
        isDelete: false,
      },
      {
        id: 'comment-456',
        username: 'username',
        date: 'date',
        content: 'comment content',
        isDelete: true,
      },
    ];

    const detailReplies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        username: 'username',
        content: 'reply content',
        date: 'date',
        isDelete: false,
      },
      {
        id: 'reply-456',
        commentId: 'comment-123',
        username: 'username',
        content: 'reply content',
        date: 'date',
        isDelete: true,
      },
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    /** mocking needed function */
    mockThreadRepository.getThreadById = vi
      .fn()
      .mockImplementation(() => Promise.resolve(detailThread));
    mockCommentRepository.getCommentsByThreadId = vi
      .fn()
      .mockImplementation(() => Promise.resolve(detailComments));
    mockReplyRepository.getRepliesByThreadId = vi
      .fn()
      .mockImplementation(() => Promise.resolve(detailReplies));

    /** creating use case instance */
    const getThreadDetailUseCase = new GetThreadDetailUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const getThreadById = await getThreadDetailUseCase.execute(useCaseParams.threadId);

    // Assert
    expect(getThreadById).toBeInstanceOf(DetailThread);
    expect(getThreadById.id).toEqual(detailThread.id);
    expect(getThreadById.title).toEqual(detailThread.title);
    expect(getThreadById.body).toEqual(detailThread.body);

    // Comments
    expect(getThreadById.comments).toHaveLength(2);
    expect(getThreadById.comments[0].content).toEqual('comment content');
    expect(getThreadById.comments[1].content).toEqual('**komentar telah dihapus**');

    // Replis at first comment
    expect(getThreadById.comments[0].replies).toHaveLength(2);
    expect(getThreadById.comments[0].replies[0].content).toEqual('reply content');
    expect(getThreadById.comments[0].replies[1].content).toEqual('**balasan telah dihapus**');

    // Replies at second comment
    expect(getThreadById.comments[1].replies).toHaveLength(0);

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
