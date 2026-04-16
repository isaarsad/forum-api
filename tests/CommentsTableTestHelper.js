/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-999',
    threadId = 'thread-999',
    owner = 'user-999',
    content = 'this is comment content',
    date = '2001-01-01T07:00:00.000Z',
    isDelete = false,
  }) {
    const query = {
      text: 'INSERT INTO comments(id, thread_id, owner, content, date, is_delete) VALUES($1, $2, $3, $4, $5, $6)',
      values: [id, threadId, owner, content, date, isDelete],
    };

    await pool.query(query);
  },

  async findCommentById(id) {
    const query = {
      text: 'SELECT * from comments WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE comments CASCADE');
  },
};

export default CommentsTableTestHelper;
