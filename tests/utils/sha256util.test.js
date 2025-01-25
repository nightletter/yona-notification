const Sha256Hash = require('../../src/utils/Sha256Hash');

describe('hashPassword', () => {
  test('should hash password correctly with given salt', () => {
    const plainPassword = 'Tlqkf18!';
    const salt = '/VKj6XEI561ASQre8WeMcA==';

    const hashedPassword2 = Sha256Hash.hashedPassword(plainPassword, salt);
    
    expect(hashedPassword2).toBe('KDnSUBh50iBbpr82wBE0zlpI8jL6hoA11yerSADdcx4=');
  });
}); 
