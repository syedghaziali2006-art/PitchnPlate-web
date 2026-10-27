import os
import gzip
import mimetypes
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = 8080
DIRECTORY = os.path.abspath(os.path.dirname(__file__))

mimetypes.add_type('font/woff2', '.woff2')
mimetypes.add_type('font/woff', '.woff')

COMPRESSIBLE_TYPES = {
    'text/html',
    'text/css',
    'application/javascript',
    'text/javascript',
    'application/json',
    'image/svg+xml',
    'text/plain',
}

class OptimizedHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Cache control headers
        path = self.translate_path(self.path)
        if any(self.path.startswith(prefix) for prefix in ['/assets/', '/css/', '/js/']):
            self.send_header('Cache-Control', 'public, max-age=31536000, immutable')
        else:
            self.send_header('Cache-Control', 'no-cache, must-revalidate')
            
        super().end_headers()

    def do_GET(self):
        # Check if gzip compression should be applied
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            index_path = os.path.join(path, 'index.html')
            if os.path.isfile(index_path):
                path = index_path

        if os.path.isfile(path):
            ctype, _ = mimetypes.guess_type(path)
            accept_encoding = self.headers.get('Accept-Encoding', '')
            
            if ctype in COMPRESSIBLE_TYPES and 'gzip' in accept_encoding:
                try:
                    with open(path, 'rb') as f:
                        data = f.read()
                    
                    compressed = gzip.compress(data, compresslevel=6)
                    
                    self.send_response(200)
                    self.send_header('Content-Type', ctype)
                    self.send_header('Content-Encoding', 'gzip')
                    self.send_header('Content-Length', str(len(compressed)))
                    self.end_headers()
                    self.wfile.write(compressed)
                    return
                except Exception as e:
                    pass

        super().do_GET()

if __name__ == '__main__':
    server = ThreadingHTTPServer(('0.0.0.0', PORT), OptimizedHandler)
    print(f"Optimized HTTP Server with Gzip & Caching running on http://localhost:{PORT}")
    server.serve_forever()
