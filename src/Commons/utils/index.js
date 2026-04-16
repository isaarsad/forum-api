/* istanbul ignore file */
/* eslint-disable camelcase */

const mapCommentDBToModel = ({ id, username, date, content, is_delete }) => ({
  id,
  username,
  date,
  content,
  isDelete: is_delete,
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
