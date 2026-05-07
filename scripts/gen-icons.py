import struct
import zlib
import os

def make_png(path, size, r, g, b):
    row = b'\x00' + bytes([r, g, b] * size)
    raw = row * size
    compressed = zlib.compress(raw, 9)
    def chunk(tag, data):
        n = struct.pack('>I', len(data))
        c = tag + data
        return n + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)
    ihdr = struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0)
    data = b'\x89PNG\r\n\x1a\n'
    data += chunk(b'IHDR', ihdr)
    data += chunk(b'IDAT', compressed)
    data += chunk(b'IEND', b'')
    os.makedirs(os.path.dirname(path) or '.', exist_ok=True)
    with open(path, 'wb') as f:
        f.write(data)
    print(f'Created {path} ({size}x{size})')

make_png('public/icon-192.png', 192, 27, 108, 168)
make_png('public/icon-512.png', 512, 27, 108, 168)
