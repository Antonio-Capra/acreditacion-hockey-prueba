// Utilidades de validación para formularios
export function validateRUT(rut: string): boolean {
  if (!rut) return false;

  // Limpiar el RUT (quitar puntos y espacios)
  const cleanRUT = rut.replace(/\./g, '').replace(/\s/g, '').toUpperCase();

  // Verificar formato básico: números + guion + dígito verificador
  const rutRegex = /^[0-9]{7,8}-[0-9K]$/;
  if (!rutRegex.test(cleanRUT)) return false;

  // Separar el número del dígito verificador
  const [numero, digitoVerificador] = cleanRUT.split('-');
  const rutArray = numero.split('').reverse();

  // Calcular el dígito verificador esperado
  let suma = 0;
  let multiplicador = 2;

  for (const digito of rutArray) {
    suma += parseInt(digito) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }

  const modulo = suma % 11;
  const digitoEsperado = modulo === 0 ? '0' : modulo === 1 ? 'K' : (11 - modulo).toString();

  return digitoVerificador === digitoEsperado;
}

export function validateEmail(email: string): boolean {
  if (!email) return false;

  // Regex más estricta para email que requiere TLD válido
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})+$/;

  return emailRegex.test(email) && email.length <= 254;
}

export function formatRUT(rut: string): string {
  // Limpiar el RUT
  const cleanRUT = rut.replace(/\./g, '').replace(/\s/g, '').replace(/[^0-9kK]/g, '').toUpperCase();

  if (cleanRUT.length < 2) return cleanRUT;

  // Separar número y dígito verificador
  const numero = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);

  // Formatear el número con puntos
  const formattedNumero = numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return `${formattedNumero}-${dv}`;
}