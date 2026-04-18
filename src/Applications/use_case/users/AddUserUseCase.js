import RegisteredUser from '../../../Domains/users/entities/RegisteredUser.js';
import RegisterUser from '../../../Domains/users/entities/RegisterUser.js';

class AddUserUseCase {
  constructor({ userRepository, passwordHash }) {
    this._userRepository = userRepository;
    this._passwordHash = passwordHash;
  }

  async execute(useCasePayload) {
    const registerUser = new RegisterUser(useCasePayload);

    await this._userRepository.verifyAvailableUsername(registerUser.username);
    const hashedPassword = await this._passwordHash.hash(registerUser.password);

    const registeredUser = await this._userRepository.addUser(
      new RegisterUser({
        ...useCasePayload,
        password: hashedPassword,
      }),
    );

    return new RegisteredUser({
      id: registeredUser.id,
      username: registeredUser.username,
      fullname: registeredUser.fullname,
    });
  }
}

export default AddUserUseCase;
