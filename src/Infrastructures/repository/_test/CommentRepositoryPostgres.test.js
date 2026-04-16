import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-222',
      username: 'usercomment',
      password: 'secret',
      fullname: 'username comment',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-222',
      title: 'this is title',
      body: 'this is body',
      owner: 'user-222',
      date: '2026-04-16T07:00:00.000Z',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should persist new comment and return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'content',
        threadId: 'thread-222',
        owner: 'user-222',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addComment(newComment);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById('comment-123');
      expect(comment).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      // Arrange
      const newComment = new NewComment({
        content: 'content',
        threadId: 'thread-222',
        owner: 'user-222',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(newComment);

      // Assert
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'content',
          owner: 'user-222',
        }),
      );
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('comment-xxx'),
      ).rejects.toThrow(new NotFoundError('comment not found'));
    });

    it('should not throw NotFoundError when comment available', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('comment-123'),
      ).resolves.not.toThrow(new NotFoundError('comment not found'));
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-xxx', 'user-123'),
      ).rejects.toThrow(new NotFoundError('comment not found'));
    });

    it('should throw AuthorizationError when user is not the comment owner', async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
      };
      await CommentsTableTestHelper.addComment(comment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(comment.id, 'user-xxx'),
      ).rejects.toThrow(new AuthorizationError('you are not allowed to access this resource'));
    });

    it('should not throw AuthorizationError when user is the comment owner', async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
      };
      await CommentsTableTestHelper.addComment(comment);
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner(comment.id, comment.owner),
      ).resolves.not.toThrow(new AuthorizationError('you are not allowed to access this resource'));
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(commentRepositoryPostgres.deleteComment('comment-xxx')).rejects.toThrow(
        new NotFoundError('comment not found'),
      );
    });

    it('should delete comment correctly', async () => {
      // Arrange
      const params = {
        commentId: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
      };

      await CommentsTableTestHelper.addComment({
        id: params.commentId,
        threadId: params.threadId,
        owner: params.owner,
        isDelete: false,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteComment(params.commentId);

      // Assert
      const comment = await CommentsTableTestHelper.findCommentById(params.commentId);
      expect(comment).toHaveLength(1);
      expect(comment[0].is_delete).toStrictEqual(true);
    });
  });

  describe('getCommentsByThreadId', () => {
    it('should return comments correctly', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-08T07:00:00.000Z',
        content: 'first comment',
        isDelete: false,
      });
      await CommentsTableTestHelper.addComment({
        id: 'comment-456',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-09T10:00:00.000Z',
        content: 'second comment',
        isDelete: true,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-222');

      // Assert
      expect(comments).toHaveLength(2);
      expect(Array.isArray(comments)).toBe(true);

      expect(comments[0]).toStrictEqual({
        id: 'comment-123',
        username: 'usercomment',
        date: '2026-04-08T07:00:00.000Z',
        content: 'first comment',
        isDelete: false,
      });

      expect(comments[1]).toStrictEqual({
        id: 'comment-456',
        username: 'usercomment',
        date: '2026-04-09T10:00:00.000Z',
        content: 'second comment',
        isDelete: true,
      });
    });

    it('should return empty array when thread has no comments', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-222');

      // Assert
      expect(comments).toStrictEqual([]);
      expect(comments).toHaveLength(0);
      expect(Array.isArray(comments)).toBe(true);
    });
  });
});
