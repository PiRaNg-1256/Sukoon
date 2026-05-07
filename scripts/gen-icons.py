import struct
import zlib
import os

# Colors
INDIGO  = (26,  27,  58)   # #1A1B3A
SAFFRON = (244, 165, 53)   # #F4A535
WHITE   = (255, 255, 255)

def make_png(path, size):
    pixels = []
    cx = size // 2
    cy = size // 2
    r = size // 2

    for y in range(size):
        row = [0]  # filter byte
        for x in range(size):
            dx = x - cx
            dy = y - cy
            dist = (dx*dx + dy*dy) ** 0.5

            if dist > r:
                row += [0, 0, 0]  # transparent-ish — use bg color outside
                continue

            # Flame shape: teardrop, narrower top wider bottom, centered upper half
            # flame tip at cy*0.25, base at cy*0.75
            flame_cx = cx
            flame_tip_y  = int(cy * 0.20)
            flame_base_y = int(cy * 0.78)
            flame_h = flame_base_y - flame_tip_y
            flame_max_w = int(size * 0.22)

            in_flame = False
            if flame_tip_y <= y <= flame_base_y:
                t = (y - flame_tip_y) / flame_h  # 0 at tip, 1 at base
                # width follows sin curve: narrow at tip, wide in middle, narrow at base
                half_w = int(flame_max_w * (t ** 0.5) * (1 - t * 0.3))
                if abs(x - flame_cx) <= half_w:
                    in_flame = True

            # Inner highlight in flame
            in_highlight = False
            if in_flame:
                hi_h = int(flame_h * 0.45)
                hi_cy = flame_tip_y + int(flame_h * 0.35)
                hi_half_w = int(flame_max_w * 0.35)
                hy = y - hi_cy
                hx = x - flame_cx
                if hy*hy / (hi_h*hi_h + 1) + hx*hx / (hi_half_w*hi_half_w + 1) < 0.4:
                    in_highlight = True

            if in_highlight:
                # warm white highlight inside flame
                row += [min(255, SAFFRON[0]+30), min(255, SAFFRON[1]+60), min(255, SAFFRON[2]+100)]
            elif in_flame:
                row += list(SAFFRON)
            else:
                row += list(INDIGO)

        pixels.append(bytes(row))

    raw = b''.join(pixels)
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

make_png('public/icon-192.png', 192)
make_png('public/icon-512.png', 512)
