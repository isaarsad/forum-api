import RepliesTableTestHelper from '../../../../tests/RepliesTableTestHelper.js';
import NewReply from '../../../Domains/replies/entities/NewReply.js';
import AddedReply from '../../../Domains/replies/entities/AddedReply.js';
import pool from '../../database/postgres/pool.js';
import ReplyRepositoryPostgres from '../ReplyRepositoryPostgres.js';
import UsersTableTestHelper from '../../../../tests/UsersTableTestHelper.js';
import ThreadsTableTestHelper from '../../../../tests/ThreadsTableTestHelper.js';
import CommentsTableTestHelper from '../../../../tests/CommentsTableTestHelper.js';
import NotFoundError from '../../../Commons/exceptions/NotFoundError.js';
import AuthorizationError from '../../../Commons/exceptions/AuthorizationError.js';

describe('ReplyRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-333',
      username: 'userreply',
      password: 'secret',
      fullname: 'username reply',
    });
    await ThreadsTableTestHelper.addThread({
      id: 'thread-333',
      title: 'this is title',
      body: 'this is body',
      owner: 'user-333',
      date: '2026-04-16T07:00:00.000Z',
    });
    await CommentsTableTestHelper.addComment({
      id: 'comment-333',
      threadId: 'thread-333',
      owner: 'user-333',
      date: '2026-04-16T07:00:00.000Z',
    });
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist new reply and return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'content',
        commentId: 'comment-333',
        owner: 'user-333',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      await replyRepositoryPostgres.addReply(newReply);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById('reply-123');
      expect(reply).toHaveLength(1);
    });

    it('should return added reply correctly', async () => {
      // Arrange
      const newReply = new NewReply({
        content: 'content',
        commentId: 'comment-333',
        owner: 'user-333',
      });
      const fakeIdGenerator = () => '123';
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

      // Action
      const addedReply = await replyRepositoryPostgres.addReply(newReply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'content',
          owner: 'user-333',
        }),
      );
    });
  });

  describe('verifyReplyAvailability function', () => {
    it('should throw NotFoundError when reply not found', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-333',
        owner: 'user-333',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyAvailability('reply-xxx')).rejects.toThrow(
        new NotFoundError('reply not found'),
      );
    });

    it('should not throw NotFoundError when reply available', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-333',
        owner: 'user-333',
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyAvailability('reply-123'),
      ).resolves.not.toThrow(new NotFoundError('reply not found'));
    });
  });

  describe('verifyReplyOwner function', () => {
    it('should throw AuthorizationError when user is not the reply owner', async () => {
      // Arrange
      const reply = {
        id: 'reply-123',
        commentId: 'comment-333',
        owner: 'user-333',
      };
      await RepliesTableTestHelper.addReply(reply);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(replyRepositoryPostgres.verifyReplyOwner(reply.id, 'user-xxx')).rejects.toThrow(
        new AuthorizationError('you are not allowed to access this resource'),
      );
    });

    it('should not throw AuthorizationError when user is the reply owner', async () => {
      // Arrange
      const reply = {
        id: 'reply-123',
        commentId: 'comment-333',
        owner: 'user-333',
      };
      await RepliesTableTestHelper.addReply(reply);
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action & Assert
      await expect(
        replyRepositoryPostgres.verifyReplyOwner(reply.id, reply.owner),
      ).resolves.not.toThrow(new AuthorizationError('you are not allowed to access this resource'));
    });
  });

  describe('deleteReply function', () => {
    it('should delete reply correctly', async () => {
      // Arrange
      const params = {
        replyId: 'reply-123',
        commentId: 'comment-333',
        owner: 'user-333',
      };

      await RepliesTableTestHelper.addReply({
        id: params.replyId,
        commentId: params.commentId,
        owner: params.owner,
        isDelete: false,
      });

      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      await replyRepositoryPostgres.deleteReply(params.replyId);

      // Assert
      const reply = await RepliesTableTestHelper.findReplyById(params.replyId);
      expect(reply).toHaveLength(1);
      expect(reply[0].is_delete).toStrictEqual(true);
    });
  });

  describe('getRepliesByThreadId', () => {
    const threadId = 'thread-333';
    it('should return replies correctly', async () => {
      // Arrange
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-333',
        owner: 'user-333',
        date: '2026-04-08T07:00:00.000Z',
        content: 'first reply',
        isDelete: false,
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-456',
        commentId: 'comment-333',
        owner: 'user-333',
        date: '2026-04-09T10:00:00.000Z',
        content: 'second reply',
        isDelete: true,
      });
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(replies).toHaveLength(2);
      expect(Array.isArray(replies)).toBe(true);

      /* eslint-disable camelcase */
      expect(replies[0]).toStrictEqual({
        id: 'reply-123',
        comment_id: 'comment-333',
        username: 'userreply',
        date: '2026-04-08T07:00:00.000Z',
        content: 'first reply',
        is_delete: false,
      });

      expect(replies[1]).toStrictEqual({
        id: 'reply-456',
        comment_id: 'comment-333',
        username: 'userreply',
        date: '2026-04-09T10:00:00.000Z',
        content: 'second reply',
        is_delete: true,
      });
    });

    it('should return empty array when comment has no replies', async () => {
      // Arrange
      const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

      // Action
      const replies = await replyRepositoryPostgres.getRepliesByThreadId(threadId);

      // Assert
      expect(replies).toStrictEqual([]);
      expect(replies).toHaveLength(0);
      expect(Array.isArray(replies)).toBe(true);
    });
  });
});
