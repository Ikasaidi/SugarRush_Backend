// ===========================================================
// JWT HELP
// - Générer et vérifier des tokens JWT
// ===========================================================
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import config from "config";
import { HttpException } from "../utils/http-exception";
import ms from "ms"; //pour typer correctement les durées

// Secret + durée depuis variables d'env (ou config)
// IMPORTANT: Toujours vérifier config.has avant config.get pour éviter une exception.
const resolveJwtSecret = (): Secret => {
  const envSecret = process.env.JWT_SECRET;
  if (envSecret && envSecret.length > 0) return envSecret;
  if (config.has("security.jwt.secret")) return config.get<string>("security.jwt.secret");
  throw new HttpException(500, "JWT secret manquant. Définissez JWT_SECRET dans .env ou security.jwt.secret dans la config.");
};

const resolveJwtExpiresIn = (): ms.StringValue => {
  const envExpires = process.env.JWT_EXPIRES_IN as ms.StringValue | undefined;
  if (envExpires) return envExpires;
  if (config.has("security.jwt.expiresIn")) return config.get<string>("security.jwt.expiresIn") as ms.StringValue;
  return "1h";
};

const JWT_SECRET: Secret = resolveJwtSecret();
const JWT_EXPIRES_IN: ms.StringValue = resolveJwtExpiresIn();


// -----------------------------------------------------------
// GÉNÉRER un token
// -----------------------------------------------------------
export const generateToken = (payload: object): string => {
  try {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
    return jwt.sign(payload, JWT_SECRET, options);
  } catch (err) {
    throw new HttpException(500, "Erreur lors de la génération du token JWT");
  }
};

// -----------------------------------------------------------
// VÉRIFIER / décoder un token
// -----------------------------------------------------------
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err: any) {
    console.error('JWT Verification Error:', {
      error: err.message,
      tokenPreview: token.substring(0, 20) + '...',
      secretPreview: typeof JWT_SECRET === 'string' ? JWT_SECRET.substring(0, 10) + '...' : 'not-string'
    });
    throw new HttpException(401, "Token invalide ou expiré");
  }
};
