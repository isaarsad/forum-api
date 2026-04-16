import NewAuthentication from '../NewAuthentication.js';

describe('NewAuthentication entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      accessToken: 'accessToken',
    };

    // Action & Assert
    expect(() => new NewAuthentication(payload)).toThrow('NEW_AUTH.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      accessToken: 'accessToken',
      refreshToken: 1234,
    };

    // Action & Assert
    expect(() => new NewAuthentication(payload)).toThrow(
      'NEW_AUTH.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should create NewAuthentication entities correctly', () => {
    // Arrange
    const payload = {
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
    };

    // Action
    const newAuth = new NewAuthentication(payload);

    // Assert
    expect(newAuth).toBeInstanceOf(NewAuthentication);
    expect(newAuth.accessToken).toEqual(payload.accessToken);
    expect(newAuth.refreshToken).toEqual(payload.refreshToken);
  });
});
