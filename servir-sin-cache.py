#!/usr/bin/env python3
"""
Servidor local para desarrollo que NUNCA deja que el navegador guarde en
caché los archivos. Server estándar de Python (python -m http.server) no
manda encabezados de caché, y Chrome igual guarda una versión "por las
dudas" durante un rato — eso hizo que viéramos varias veces una versión
vieja de la página aunque el archivo ya estuviera corregido.

Uso: python3 servir-sin-cache.py [puerto]  (por defecto 8080)
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

class SinCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    HTTPServer(("", puerto), SinCacheHandler).serve_forever()
