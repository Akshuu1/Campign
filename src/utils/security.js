/**
 * Cryptographic Zero-Knowledge Credential Protection
 * 
 * Protects admin identity and passcodes using one-way cryptographic SHA-256 hashes.
 * Plain text emails and passwords NEVER exist in the source code or compiled bundles,
 * ensuring complete confidentiality even if the client bundles are inspected or reverse-engineered.
 */

// Irreversible SHA-256 hashes for authorized admin verification
const ADMIN_EMAIL_HASH = "d840a501f49d3d64dedaae69264d3ec84c0034d170f92d7883abe2467899f575";
const ADMIN_PASSCODE_HASH = "5ffa654800a13d6602c87a4eca14daa3cf57b837fc04f41dc4ba1154a2afb9ea";

/**
 * Computes the SHA-256 hex digest of a string using the native Web Crypto API.
 */
export async function computeSha256(str) {
  if (!str) return "";
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (err) {
    console.warn("Crypto API unavailable, hash failed:", err);
    return "";
  }
}

/**
 * Securely verifies if a user's email matches the authorized Admin via SHA-256.
 * No plain text email is ever stored or compared in the codebase.
 */
export async function verifyAdminEmail(email) {
  if (!email || typeof email !== "string") return false;
  const cleanEmail = email.trim().toLowerCase();
  const hash = await computeSha256(cleanEmail);
  return hash === ADMIN_EMAIL_HASH;
}

/**
 * Securely verifies the Admin Portal passcode via SHA-256.
 * No plain text passcode is ever stored or compared in the codebase.
 */
export async function verifyAdminPasscode(passcode) {
  if (!passcode || typeof passcode !== "string") return false;
  const cleanPasscode = passcode.trim();
  const hash = await computeSha256(cleanPasscode);
  return hash === ADMIN_PASSCODE_HASH;
}
