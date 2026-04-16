/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-999',
    commentId = 'comment-999',
    owner = 'user-999',
    content = 'this is reply content',
    date = '2001-01-01T07:00:00.000Z',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO replies(id, comment_id, owner, content, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, commentId, owner, content, date, isDelete],
    };

    await pool.query(query);
  },

  async findReplyById(id) {
    const query = {
      text: 'SELECT * from replies WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE replies CASCADE');
  },
};

export default RepliesTableTestHelper;
