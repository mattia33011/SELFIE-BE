import bcrypt from 'bcrypt';

class PasswordManager {
  private readonly _salt = "$2b$10$mUicp4MD8h3h5HUnjQ.tWO"

  crypt(password: string): string {
    return bcrypt.hashSync(password, this._salt);
  }

  compare = (password: string, hashedPassword: string) => bcrypt.compareSync(password, hashedPassword);
  
}

const passwordManager = new PasswordManager();

export default passwordManager;
