# -*- coding: utf-8 -*-
"""Server minimo che risponde alle richieste Range.

Senza Range il browser non puo' spostarsi dentro un video: assegni
video.currentTime e resta a zero, senza un solo errore in console. E' la
trappola numero uno di questa tecnica, e va conosciuta prima, non dopo.
"""
import http.server, os, re, socketserver, sys

class Range(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        percorso = self.translate_path(self.path)
        if not os.path.isfile(percorso) or "Range" not in self.headers:
            return super().do_GET()
        dim = os.path.getsize(percorso)
        m = re.match(r"bytes=(\d+)-(\d*)", self.headers["Range"])
        da = int(m.group(1)); a = int(m.group(2)) if m.group(2) else dim - 1
        a = min(a, dim - 1)
        self.send_response(206)
        self.send_header("Content-Type", self.guess_type(percorso))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Range", f"bytes {da}-{a}/{dim}")
        self.send_header("Content-Length", str(a - da + 1))
        self.end_headers()
        with open(percorso, "rb") as f:
            f.seek(da); self.wfile.write(f.read(a - da + 1))
    def log_message(self, *a): pass

os.chdir(sys.argv[2] if len(sys.argv) > 2 else ".")
socketserver.TCPServer.allow_reuse_address = True
socketserver.TCPServer(("", int(sys.argv[1])), Range).serve_forever()
