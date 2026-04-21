/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool.js';

const UserCommentLikesTableTestHelper = {
  async addLike({ id = 'like-999', userId = 'user-999', commentId = 'comment-999' }) {
    const query = {
      text: 'INSERT INTO user_comment_likes(id, user_id, comment_id) VALUES($1, $2, $3)',
      values: [id, userId, commentId],
    };

    await pool.query(query);
  },

  async findUserCommentLikeById(id) {
    const query = {
      text: 'SELECT * from user_comment_likes WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async findByUserIdAndCommentId(userId, commentId) {
    const query = {
      text: 'SELECT * from user_comment_likes WHERE user_id = $1 AND comment_id = $2',
      values: [userId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE user_comment_likes CASCADE');
  },
};

export default UserCommentLikesTableTestHelper;
