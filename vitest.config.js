import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['dotenv/config'],
    fileParallelism: false,
    coverage: {
      exclude: [
        'src/Commons/config.js',
        'src/Commons/utils/index.js',
        'src/Infrastructures/database/postgres/pool.js',
        'tests/AuthenticationsTableTestHelper.js',
        'tests/UsersTableTestHelper.js',
        'tests/UserCommentLikesTableTestHelper.js',
        'tests/ThreadsTableTestHelper.js',
        'tests/RepliesTableTestHelper.js',
        'tests/CommentsTableTestHelper.js',
        'src/Infrastructures/docs/swagger.js',
      ],
    },
  },
});
