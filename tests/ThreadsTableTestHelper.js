/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-999',
    title = 'this is title',
    body = 'this is body',
    owner = 'user-999',
    date = '2001-01-01T07:00:00.000Z',
  }) {
    const query = {
      text: 'INSERT INTO threads(id, title, body, owner, date) VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, owner, date],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const query = {
      text: 'SELECT * from threads WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE threads CASCADE');
  },
};

export default ThreadsTableTestHelper;
