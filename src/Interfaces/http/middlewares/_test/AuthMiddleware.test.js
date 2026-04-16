import { vi } from 'vitest';
import AuthenticationError from '../../../../Commons/exceptions/AuthenticationError.js';
import AuthenticationTokenManager from '../../../../Applications/security/AuthenticationTokenManager.js';
import AuthMiddleware from '../AuthMiddleware.js';

describe('AuthMiddleware', () => {
  it('should throw AuthenticationError when authorization header is missing', async () => {
    // Arrange
    const req = {
      headers: {},
    };
    const res = {};
    const next = vi.fn();
    const getTokenManager = vi.fn();

    const middleware = AuthMiddleware(getTokenManager);

    // Action & Assert
    await expect(middleware(req, res, next)).rejects.toThrow(
      new AuthenticationError('Missing authentication'),
    );

    expect(next).not.toBeCalled();
  });

  it('should throw AuthenticationError when token is invalid or missing after Bearer', async () => {
    // Arrange
    const req = {
      headers: {
        authorization: 'Bearer',
      },
    };
    const res = {};
    const next = vi.fn();
    const getTokenManager = vi.fn();

    const middleware = AuthMiddleware(getTokenManager);

    // Action & Assert
    await expect(middleware(req, res, next)).rejects.toThrow(
      new AuthenticationError('Token Invalid'),
    );

    expect(next).not.toBeCalled();
  });

  it('should call next() and attach user to request when token is valid', async () => {
    // Arrange
    const req = {
      headers: {
        authorization: 'Bearer valid_token_123',
      },
    };
    const res = {};
    const next = vi.fn();

    const mockTokenManager = new AuthenticationTokenManager();

    mockTokenManager.verifyAccessToken = vi.fn().mockResolvedValue();
    mockTokenManager.decodePayload = vi.fn().mockResolvedValue({
      id: 'user-123',
      username: 'userauth',
    });

    const getTokenManager = vi.fn().mockReturnValue(mockTokenManager);

    const middleware = AuthMiddleware(getTokenManager);

    // Action
    await middleware(req, res, next);

    // Assert
    expect(mockTokenManager.verifyAccessToken).toBeCalledWith('valid_token_123');
    expect(mockTokenManager.decodePayload).toBeCalledWith('valid_token_123');

    expect(req.user).toEqual({
      id: 'user-123',
      username: 'userauth',
    });

    expect(next).toBeCalledTimes(1);
  });
});
