import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import NewComment from '../../../Domains/comments/entities/NewComment.js';
import AddedComment from '../../../Domains/comments/entities/AddedComment.js';
import pool from '../../database/postgres/pool.js';
import CommentRepositoryPostgres from '../CommentRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';
import UserCommentLikesTableTestHelper from '../../../../tests/UserCommentLikesTableTestHelper.js';
import NewLike from '../../../Domains/comments/entities/NewLike.js';

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-222',
      username: 'usercomment',
      password: 'secret',
      fullname: 'username comment',
    });
    await UsersTableTestHelper.addUser({
      id: 'user-333',
      username: 'usersecondcomment',
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
    await UserCommentLikesTableTestHelper.cleanTable();
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
      const comment1 = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-08T07:00:00.000Z',
        content: 'first comment',
        isDelete: false,
      };
      const comment2 = {
        id: 'comment-456',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-09T10:00:00.000Z',
        content: 'second comment',
        isDelete: true,
      };
      await CommentsTableTestHelper.addComment(comment1);
      await CommentsTableTestHelper.addComment(comment2);

      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-123',
        userId: 'user-222',
        commentId: 'comment-123',
      });
      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-456',
        userId: 'user-333',
        commentId: 'comment-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const comments = await commentRepositoryPostgres.getCommentsByThreadId('thread-222');

      // Assert
      expect(comments).toHaveLength(2);
      expect(Array.isArray(comments)).toBe(true);

      /* eslint-disable camelcase */
      expect(comments[0]).toStrictEqual({
        id: 'comment-123',
        username: 'usercomment',
        date: '2026-04-08T07:00:00.000Z',
        content: 'first comment',
        is_delete: false,
        like_count: 2,
      });

      expect(comments[1]).toStrictEqual({
        id: 'comment-456',
        username: 'usercomment',
        date: '2026-04-09T10:00:00.000Z',
        content: 'second comment',
        is_delete: true,
        like_count: 0,
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

  describe('checkIsLiked', () => {
    it('should return true if the comment is already liked by the user', async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-08T07:00:00.000Z',
        content: 'comment content',
        isDelete: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      await UserCommentLikesTableTestHelper.addLike({
        id: 'like-123',
        userId: 'user-222',
        commentId: 'comment-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isLiked = await commentRepositoryPostgres.checkIsLiked('user-222', comment.id);

      // Assert
      expect(isLiked).toEqual(true);
    });

    it('should return false if the comment is NOT liked by the user', async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-08T07:00:00.000Z',
        content: 'comment content',
        isDelete: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const isLiked = await commentRepositoryPostgres.checkIsLiked('user-222', comment.id);

      // Assert
      expect(isLiked).toEqual(false);
    });
  });

  describe('addLike', () => {
    it('should persist like comment correctly', async () => {
      // Arrange
      const comment = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-08T07:00:00.000Z',
        content: 'comment content',
        isDelete: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      const newlike = new NewLike({
        threadId: 'thread-222',
        userId: 'user-222',
        commentId: 'comment-123',
      });

      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await commentRepositoryPostgres.addLike(newlike);

      // Assert
      const likes = await UserCommentLikesTableTestHelper.findUserCommentLikeById('like-123');
      expect(likes).toHaveLength(1);
      expect(likes[0].user_id).toEqual('user-222');
      expect(likes[0].comment_id).toEqual('comment-123');
    });
  });

  describe('deleteLike', () => {
    it('should delete like comment correctly', async () => {
      const comment = {
        id: 'comment-123',
        threadId: 'thread-222',
        owner: 'user-222',
        date: '2026-04-08T07:00:00.000Z',
        content: 'comment content',
        isDelete: false,
      };
      await CommentsTableTestHelper.addComment(comment);

      const like = {
        id: 'like-123',
        userId: 'user-222',
        commentId: 'comment-123',
      };
      await UserCommentLikesTableTestHelper.addLike(like);

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      await commentRepositoryPostgres.deleteLike(like);

      // Assert
      const likes = await UserCommentLikesTableTestHelper.findUserCommentLikeById('like-123');
      expect(likes).toHaveLength(0);
    });
  });
});
