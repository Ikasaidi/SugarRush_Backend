// ===========================================================
// SERVER 
// - Charge la config/env
// - Se connecte à Mongo
// - Démarre HTTP et/ou HTTPS (avec redirection possible)
// ===========================================================
import "dotenv/config";
import config from "config";
import app from "./app";
import fs from "fs";
import path from "path";
import http from "http";
import https from "https";
import {connectDB} from "./data/connectDB"

// Debug rapide : voir l'environnement courant
console.log("ENV:", process.env.NODE_ENV);
console.log("HTTPS ENABLED =", config.get("server.https.enabled"));
console.log("Redirect HTTP→HTTPS =", config.get("server.https.redirectAllHttpToHttps"));


// -----------------------------------------------------------
// CONFIG SERVEUR (lue depuis config/*)
// -----------------------------------------------------------
// Ports + options HTTPS
const httpPort = config.get<number>("server.http.port");
const httpsPort = config.get<number>("server.https.port");
const enableHttps = config.get<boolean>("server.https.enabled") === true || config.get("server.https.enabled") === "true";
const redirectAll = config.get<boolean>("server.https.redirectAllHttpToHttps") === true || config.get("server.https.redirectAllHttpToHttps") === "true";

// -----------------------------------------------------------
// CERTIFICATS SSL (si HTTPS activé)
// - On lit les chemins depuis la config et on charge key/cert
// -----------------------------------------------------------
let sslOptions: any = {};
if (enableHttps) {
  const keyPath = path.resolve(config.get<string>("ssl.keyPath"));
  const certPath = path.resolve(config.get<string>("ssl.certPath"));
  
  // Vérifier que les fichiers existent avant de les charger
  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    sslOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  } else {
    console.error(`⚠️  HTTPS activé mais certificats manquants:`);
    console.error(`   Key: ${keyPath}`);
    console.error(`   Cert: ${certPath}`);
    console.error(`   Exécutez: openssl req -x509 -newkey rsa:4096 -keyout cert/server.key -out cert/server.cert -days 365 -nodes`);
    process.exit(1);
  }
}

// -----------------------------------------------------------
// FONCTION DE DÉMARRAGE
// - 1) Connexion DB
// - 2) Lancer HTTPS si activé
// - 3) Soit rediriger tout le HTTP → HTTPS, soit démarrer un HTTP normal
// NOTE : redirection sur le production seulement
// -----------------------------------------------------------
const startServer = async () => {
  try {

    // 1) DB
    console.log("db import:", connectDB);
    await connectDB();

    // // 2) HTTPS (si activé dans la config)
    if (enableHttps) {
      https.createServer(sslOptions, app).listen(httpsPort, () => {
        console.log(
          `Serveur HTTPS lancé sur https://localhost:${httpsPort}`
        );
      });
    }

    // 3) HTTP
    if (redirectAll && enableHttps) {
      // -----------------------------------------------------
      // MODE REDIRECTION : tout le HTTP renvoie vers HTTPS
      // -----------------------------------------------------
      http
        .createServer((req, res) => {
          res.writeHead(301, {
            Location: `https://localhost:${httpsPort}${req.url}`,
          });
          res.end();
        })
        .listen(httpPort, () => {
          console.log(`Redirection HTTP → HTTPS sur le port ${httpPort}`);
        });
    } else {
      // -----------------------------------------------------
      // MODE HTTP NORMAL : on lance l’API en HTTP classique
      // -----------------------------------------------------
      // app.listen(httpPort, () => {
      //   console.log(`Serveur lancé sur http://localhost:${httpPort}`);
      // });
      app.listen(httpPort, "0.0.0.0", () => {
        console.log(`Serveur lancé sur http://0.0.0.0:${httpPort}`);
      });

      /// pour acces reseau local ///
      //  app.listen(httpPort, "0.0.0.0", () => {
      //   console.log(`Serveur lancé sur http://192.168.68.105:${httpPort}`);
      // });
    }
  } catch (err) {

    console.error("Impossible de démarrer le serveur :", err);
  }
};

// -----------------------------------------------------------
// LANCEMENT
// -----------------------------------------------------------
startServer();