import AuthorizationError from '../../Commons/exceptions/AuthorizationError.js';
import NotFoundError from '../../Commons/exceptions/NotFoundError.js';
import AddedReply from '../../Domains/replies/entities/AddedReply.js';
import ReplyRepository from '../../Domains/replies/ReplyRepository.js';

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(newReply) {
    const { content, commentId, owner } = newReply;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const query = {
      text: 'INSERT INTO replies(id, content, comment_id, owner, date) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner',
      values: [id, content, commentId, owner, date],
    };

    const result = await this._pool.query(query);

    return new AddedReply({ ...result.rows[0] });
  }

  async verifyReplyAvailability(replyId) {
    const query = {
      text: 'SELECT id FROM replies WHERE id = $1 AND is_delete = false',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('reply not found');
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    const { owner: replyOwner } = result.rows[0];
    if (replyOwner !== owner) {
      throw new AuthorizationError('you are not allowed to access this resource');
    }
  }

  async deleteReply(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = true WHERE id = $1',
      values: [replyId],
    };

    await this._pool.query(query);
  }

  async getRepliesByThreadId(threadId) {
    const query = {
      text: `SELECT r.id, r.comment_id, u.username, r.date, r.content, r.is_delete
                    FROM replies r
                    JOIN comments c ON r.comment_id = c.id
                    JOIN users u ON r.owner = u.id
                    WHERE c.thread_id = $1
                    ORDER BY r.date ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }
}

export default ReplyRepositoryPostgres;
