/* istanbul ignore file */
/* eslint-disable camelcase */

const mapCommentDBToModel = ({ id, username, date, content, is_delete, like_count }) => ({
  id,
  username,
  date,
  content,
  isDelete: is_delete,
  likeCount: Number(like_count),
});

const mapReplyDBToModel = ({ id, comment_id, username, date, content, is_delete }) => ({
  id,
  commentId: comment_id,
  username,
  date,
  content,
  isDelete: is_delete,
});

export { mapCommentDBToModel, mapReplyDBToModel };
