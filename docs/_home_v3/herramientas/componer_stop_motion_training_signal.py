"""Stop motion de Training Signal: tiras de conversación salen de la grabadora, se
ordenan en tres charolas (apertura, objeción, cierre), tres tiras forman la tarjeta del
argumento junto a la caja y sale el ticket de venta. Sprites dibujados aquí; luz de
ventana desde la izquierda."""
import random, math, os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np
random.seed(20261010)
S = 3
placa = Image.open('placa.png').convert('RGB'); W, H = placa.size
PAPEL = (244, 245, 246); PETRO = (28, 95, 107); TINTA = (128, 132, 138)

def base(w, h, semilla, color=PAPEL):
    rng = np.random.default_rng(semilla)
    a = np.zeros((h * S, w * S, 4)); a[..., :3] = color; a[..., 3] = 255
    a[..., :3] *= np.linspace(1.025, 0.965, w * S)[None, :, None]
    a[..., :3] += rng.normal(0, 1.6, (h * S, w * S, 1))
    e = 2 * S
    a[-e:, :, :3] *= 0.9; a[:, -e:, :3] *= 0.9
    im = Image.fromarray(a.clip(0, 255).astype('uint8'), 'RGBA')
    return im, rng

def renglones(im, rng, x0, y0, x1, y1, paso, grosor=3):
    d = ImageDraw.Draw(im); y = y0
    while y < y1:
        x, fin = x0, int(rng.integers(int(x0 + (x1 - x0) * .55), x1))
        while x < fin:
            pw = int(rng.integers(5, 22))
            d.rectangle((x * S, y * S, min(x + pw, fin) * S, (y + grosor) * S), fill=TINTA + (255,))
            x += pw + int(rng.integers(3, 6))
        y += paso

def tira(semilla):
    im, rng = base(170, 30, semilla)
    renglones(im, rng, 12, 8, 160, 26, 10, 2)
    return im.filter(ImageFilter.GaussianBlur(0.6 * S))

def tarjeta(petro):
    im, rng = base(250, 150, 77)
    d = ImageDraw.Draw(im)
    if petro: d.rectangle((0, 0, 10 * S, 150 * S), fill=PETRO + (255,))
    renglones(im, rng, 26, 22, 232, 34, 12, 4)
    renglones(im, rng, 26, 52, 232, 136, 13, 2)
    return im.filter(ImageFilter.GaussianBlur(0.6 * S))

def ticket():
    im, rng = base(96, 220, 91, (247, 247, 245))
    d = ImageDraw.Draw(im)
    # borde dentado arriba
    for x in range(0, 96, 8): d.polygon([(x * S, 0), ((x + 4) * S, 5 * S), ((x + 8) * S, 0)], fill=(0, 0, 0, 0))
    renglones(im, rng, 12, 20, 84, 150, 11, 2)
    d.rectangle((12 * S, 170 * S, 84 * S, 176 * S), fill=PETRO + (255,))
    renglones(im, rng, 12, 188, 70, 205, 10, 2)
    return im.filter(ImageFilter.GaussianBlur(0.6 * S))

TIRAS = [tira(100 + i) for i in range(9)]
CARTA, CARTA_P, TICKET = tarjeta(False), tarjeta(True), ticket()

def pegar(lienzo, spr, x, y, ang, alza=0.0):
    r = spr.rotate(ang, resample=Image.BICUBIC, expand=True)
    r = r.resize((r.width // S, r.height // S), Image.LANCZOS)
    if alza:
        k = 1 + alza * 0.04; r = r.resize((int(r.width * k), int(r.height * k)), Image.LANCZOS)
    alpha = r.split()[3]
    def capa(op, blur, off):
        sh = Image.new('RGBA', r.size, (4, 8, 14, 0)); sh.putalpha(alpha.point(lambda v: int(v * op)))
        pad = int(blur * 3)
        big = Image.new('RGBA', (r.width + 2 * pad, r.height + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(sh, (pad, pad))
        big = big.filter(ImageFilter.GaussianBlur(blur))
        lienzo.alpha_composite(big, (int(x - r.width / 2 + off - pad), int(y - r.height / 2 + off * 0.8 - pad)))
    capa(0.50 - alza * 0.2, 1.4 + alza * 2, 1.4 + alza * 4)
    capa(0.26 + alza * 0.1, 5 + alza * 6, 4 + alza * 9)
    lienzo.alpha_composite(r, (int(x - r.width / 2), int(y - r.height / 2)))

def ease(t): return t * t * (3 - 2 * t)
def interp(p0, p1, t, arco=30):
    t = ease(t); return (p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t - math.sin(math.pi * t) * arco, p0[2] + (p1[2] - p0[2]) * t)

GRAB = (300, 330, -4)                      # salida junto a la grabadora
CHAROLAS = [484, 748, 1006]                # centros x de las charolas
def en_charola(c, k): return (CHAROLAS[c] + random.Random(c * 10 + k).uniform(-6, 6), 262 + k * 92, random.Random(k + c).uniform(-3, 3))
ARMADO = (1010, 700, 0)                    # donde se juntan las tres tiras
CARTA_FIN = (1290, 690, -1.5)              # tarjeta junto a la caja
TICKET_FIN = (1500, 700, 4)
N = 44

def cuadro(n):
    objs = []
    # tiras 0..8: tira i nace en 7+2i junto a la grabadora y llega a su charola en 2 cuadros
    for i in range(9):
        c, k = i % 3, i // 3
        a0 = 7 + 2 * i
        if n < a0: continue
        destino = en_charola(c, k)
        # la tira de arriba de cada charola (k == 2) sale hacia el armado en 25..30
        if k == 2 and n >= 25 + 2 * c:
            t = min(1, (n - (25 + 2 * c)) / 2)
            if n >= 31: continue
            x, y, r = interp(destino, (ARMADO[0] + (c - 1) * 8, ARMADO[1] - 30 + c * 30, 0), t, 40)
            objs.append((TIRAS[i], x, y, r, 0.6 if t < 1 else 0.0)); continue
        t = min(1, (n - a0) / 2)
        x, y, r = interp(GRAB, destino, t, 40)
        objs.append((TIRAS[i], x, y, r, 0.6 if t < 1 else 0.0))
    # tarjeta: aparece armada en 31, viaja junto a la caja en 33..37
    if n >= 31:
        t = 0 if n < 33 else min(1, (n - 33) / 4)
        x, y, r = interp(ARMADO, CARTA_FIN, t, 25)
        objs.append((CARTA, x, y, r, 0.5 if 0 < t < 1 or n == 31 else 0.0))
    # ticket: sale de debajo de la caja en 39..42
    if n >= 39:
        t = min(1, (n - 39) / 3)
        x, y, r = interp((1500, 620, 0), TICKET_FIN, t, 0)
        objs.append((TICKET, x, y, r, 0.4 if t < 1 else 0.0))
    return objs

os.makedirs('cuadros', exist_ok=True)
for n in range(1, N + 1):
    lienzo = placa.convert('RGBA')
    if n > 1: lienzo = ImageEnhance.Brightness(lienzo.convert('RGB')).enhance(1 + random.uniform(-0.008, 0.008)).convert('RGBA')
    for spr, x, y, r, alza in cuadro(n):
        if not alza and n > 1: x += random.uniform(-0.6, 0.6); y += random.uniform(-0.6, 0.6); r += random.uniform(-0.2, 0.2)
        pegar(lienzo, spr, x, y, r, alza)
    lienzo.convert('RGB').save(f'cuadros/cuadro_{n:03d}.png')
print('ok')
