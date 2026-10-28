// Reads a JWT payload WITHOUT verifying the signature. Fine for reading `exp`;
// it is not an authentication check.
export function decodeJwt(token: string): { exp: number; [k: string]: any } {
  return JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf-8'))
}
