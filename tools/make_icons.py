"""Generate FocusTube icon PNGs (rounded red square, white play triangle, dark slash) without PIL."""
import math, struct, sys, zlib, os

def png(w, h, rows):
    def chunk(t, d):
        c = struct.pack('>I', len(d)) + t + d
        return c + struct.pack('>I', zlib.crc32(t + d) & 0xffffffff)
    raw = b''.join(b'\x00' + bytes(r) for r in rows)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(raw, 9)) + chunk(b'IEND', b'')

def sdf_round_rect(x, y, cx, cy, hw, hh, r):
    dx = abs(x - cx) - hw + r; dy = abs(y - cy) - hh + r
    return math.hypot(max(dx, 0), max(dy, 0)) + min(max(dx, dy), 0) - r

def point_in_tri(px, py, a, b, c):
    def s(p1, p2, p3): return (p1[0]-p3[0])*(p2[1]-p3[1]) - (p2[0]-p3[0])*(p1[1]-p3[1])
    d1, d2, d3 = s((px,py), a, b), s((px,py), b, c), s((px,py), c, a)
    return not ((d1 < 0 or d2 < 0 or d3 < 0) and (d1 > 0 or d2 > 0 or d3 > 0))

def render(size, transparent_corners=True):
    ss = 3  # supersample
    rows = []
    N = size * ss
    bg = (255, 59, 48); fg = (255, 255, 255); ring = (17, 17, 17)
    for y in range(size):
        row = []
        for x in range(size):
            acc = [0, 0, 0, 0]
            for sy in range(ss):
                for sx in range(ss):
                    px = (x * ss + sx + 0.5) / N; py = (y * ss + sy + 0.5) / N
                    d = sdf_round_rect(px, py, 0.5, 0.5, 0.5, 0.5, 0.22)
                    if d > 0 and transparent_corners:
                        continue
                    col = bg
                    # play triangle
                    tri = ((0.38, 0.30), (0.38, 0.70), (0.72, 0.50))
                    if point_in_tri(px, py, *tri): col = fg
                    # focus ring
                    rr = math.hypot(px - 0.5, py - 0.5)
                    if 0.335 < rr < 0.375: col = fg
                    # gap in ring at top right to suggest "cut"
                    ang = math.atan2(py - 0.5, px - 0.5)
                    if 0.335 < rr < 0.375 and -1.15 < ang < -0.45: col = bg
                    acc[0] += col[0]; acc[1] += col[1]; acc[2] += col[2]; acc[3] += 255
            n = ss * ss
            row += [acc[0] // n, acc[1] // n, acc[2] // n, acc[3] // n]
        rows.append(row)
    return png(size, size, rows)

out = sys.argv[1]
os.makedirs(out, exist_ok=True)
for s in (48, 64, 96, 128, 256, 512):
    with open(os.path.join(out, f'icon-{s}.png'), 'wb') as f: f.write(render(s))
# Opaque 1024 app icon for the container app (App Store requires no alpha).
with open(os.path.join(out, 'appicon-1024.png'), 'wb') as f: f.write(render(1024, transparent_corners=False))
print('icons written to', out)
