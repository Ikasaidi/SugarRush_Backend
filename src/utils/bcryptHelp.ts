// ===========================================================
// BCRYPT HELP
// - Hash et comparaison de mots de passe
// ===========================================================

import bcrypt from "bcrypt";

// -----------------------------------------------------------
// HASHER un mot de passe en Bcrypt
// - Entrée : mot de passe en clair
// - Sortie : hash Bcrypt
// -----------------------------------------------------------

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {

  // On génère un sel + on hash
  const salt = await bcrypt.genSalt(SALT_ROUNDS);

  return bcrypt.hash(password, salt);
};

// -----------------------------------------------------------
// COMPARER un mot de passe avec un hash
// - true si ça matche, false sinon
// -----------------------------------------------------------
export const comparePassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {

  return bcrypt.compare(plainPassword, hashedPassword);
};
