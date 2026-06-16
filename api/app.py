import json
import os
from datetime import datetime, date as date_cls
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

import mysql.connector

DB_CONFIG = {
    "host": os.environ.get("DB_HOST", "192.168.1.25"),
    "database": os.environ.get("DB_NAME", "veille"),
    "user": os.environ.get("DB_USER", "adminbb"),
    "password": os.environ.get("DB_PASSWORD", "veilletechno2026"),
    "port": os.environ.get("DB_PORT", "3306"),
    "connection_timeout": 5,
}

API_PORT = int(os.environ.get("API_PORT", "3000"))


def parse_tags(valeur):
    if not valeur:
        return []
    if isinstance(valeur, list):
        return valeur
    texte = str(valeur).strip()
    try:
        out = json.loads(texte)
        return out if isinstance(out, list) else [str(out)]
    except (ValueError, TypeError):
        return [t.strip() for t in texte.split(",") if t.strip()]


def to_iso(valeur):
    if isinstance(valeur, (datetime, date_cls)):
        return valeur.strftime("%Y-%m-%dT%H:%M:%SZ")
    return str(valeur) if valeur else None


def row_to_article(r):
    score = r.get("score")
    return {
        "id": r.get("id"),
        "titre": r.get("titre") or "",
        "source": r.get("source") or "Source inconnue",
        "date": to_iso(r.get("date_publication")),
        "lien": r.get("lien") or "#",
        "resume": r.get("resume") or "",
        "score": round(float(score), 3) if score is not None else 0.0,
        "is_top": bool(r.get("is_top")),
        "tags": parse_tags(r.get("tags")),
    }


def charger_articles():
    conn = mysql.connector.connect(**DB_CONFIG)
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM articles;")
        articles = [row_to_article(r) for r in cur.fetchall()]
        cur.close()
    finally:
        conn.close()
    articles.sort(key=lambda a: (a["score"], a["date"] or ""), reverse=True)
    return articles


class Handler(BaseHTTPRequestHandler):
    def _envoyer(self, code, payload):
        corps = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_OPTIONS(self):
        self._envoyer(204, {})

    def do_GET(self):
        chemin = self.path.split("?", 1)[0].rstrip("/")
        try:
            if chemin == "/articles":
                self._envoyer(200, charger_articles())
            elif chemin == "/articles/top":
                arts = charger_articles()
                top = [a for a in arts if a["is_top"]] or arts[:10]
                self._envoyer(200, top)
            elif chemin == "/health":
                self._envoyer(200, {"status": "ok", "count": len(charger_articles())})
            else:
                self._envoyer(404, {"error": "Not found", "path": self.path})
        except mysql.connector.Error as e:
            self._envoyer(503, {"error": "Base de données inaccessible", "detail": str(e)})
        except Exception as e:
            self._envoyer(500, {"error": "Erreur interne", "detail": str(e)})

    def log_message(self, fmt, *args):
        print(f"[api] {self.address_string()} {fmt % args}")


if __name__ == "__main__":
    serveur = ThreadingHTTPServer(("0.0.0.0", API_PORT), Handler)
    print(f"API veille technologique en écoute sur http://0.0.0.0:{API_PORT}")
    print(f"   GET /articles  ·  GET /articles/top  ·  GET /health")
    try:
        serveur.serve_forever()
    except KeyboardInterrupt:
        print("\nArrêt de l'API.")
        serveur.shutdown()
