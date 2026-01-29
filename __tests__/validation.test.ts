import { validateRUT, validateEmail, formatRUT } from '../lib/validation';

describe('Validation Functions', () => {
  describe('validateRUT', () => {
    it('should validate correct RUTs', () => {
      expect(validateRUT('11111111-1')).toBe(true);
      expect(validateRUT('11.111.111-1')).toBe(true);
      expect(validateRUT('99999999-9')).toBe(true);
      expect(validateRUT('12345678-5')).toBe(true); // RUT válido conocido
      expect(validateRUT('88888888-5')).toBe(false); // RUT inválido
    });

    it('should reject invalid RUTs', () => {
      expect(validateRUT('')).toBe(false);
      expect(validateRUT('12345678-9')).toBe(false); // dígito verificador incorrecto
      expect(validateRUT('123456789')).toBe(false); // sin guion
      expect(validateRUT('12345678-X')).toBe(false); // dígito verificador inválido
      expect(validateRUT('abc12345-6')).toBe(false); // caracteres no numéricos
    });

    it('should handle edge cases', () => {
      expect(validateRUT('11111111-1')).toBe(true);
      expect(validateRUT('99999999-9')).toBe(true);
    });
  });

  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('test+tag@gmail.com')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
      expect(validateEmail('user@domain.')).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('formatRUT', () => {
    it('should format RUT correctly', () => {
      expect(formatRUT('123456789')).toBe('12.345.678-9');
      expect(formatRUT('12345678K')).toBe('12.345.678-K');
      expect(formatRUT('1')).toBe('1');
      expect(formatRUT('')).toBe('');
    });

    it('should handle already formatted RUTs', () => {
      expect(formatRUT('12.345.678-9')).toBe('12.345.678-9');
    });
  });
});