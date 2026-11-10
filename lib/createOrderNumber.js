import crypto from "crypto";

// Unambiguous alphabet: no 0/O/1/I, so an order number can be read over the
// phone for a cash-on-delivery call without transcription mistakes.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;

// "ORD-8F3K2A". Uniqueness is enforced by the schema's unique index; the
// checkout controller retries the (very unlikely) collision.
const createOrderNumber = () => {
  const bytes = crypto.randomBytes(CODE_LENGTH);
  let code = "";

  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }

  return `ORD-${code}`;
};

export default createOrderNumber;
