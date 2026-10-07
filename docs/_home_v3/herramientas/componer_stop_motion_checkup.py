"""Compone los cuadros del stop motion del Checkup sobre la placa limpia.
Las tarjetas son sprites dibujados aquí (no generados): mismo tamaño y forma en
todos los cuadros. Luz de ventana desde la izquierda: sombra hacia la derecha."""
import random, math
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np

random.seed(20261006)
S = 3  # supersampling para bordes limpios al rotar
placa = Image.open('placa.png').convert('RGB')
W, H = placa.size
XS = [803.5, 944, 1084, 1225]; YS = [147.5, 292, 436, 581]
cx = [(XS[i] + XS[i+1]) / 2 for i in range(3)]
cy = [(YS[i] + YS[i+1]) / 2 for i in range(3)]
CW, CH = 112, 78
BLANCO = (238, 239, 241); PETROLEO = (28, 95, 107)

def tarjeta(color):
    w, h = CW * S, CH * S
    rng = np.random.default_rng(7 if color == BLANCO else 9)
    a = np.zeros((h, w, 4)); a[..., :3] = color; a[..., 3] = 255
    # luz de ventana: más clara del lado izquierdo y hacia arriba
    gx = np.linspace(1.035, 0.955, w)[None, :]; gy = np.linspace(1.01, 0.985, h)[:, None]
    a[..., :3] *= (gx * gy)[..., None]
    # fibra de cartulina: grano fino más una nube suave
    nube = Image.fromarray((rng.normal(128, 40, (h // 12, w // 12))).clip(0, 255).astype('uint8')).resize((w, h), Image.BICUBIC)
    a[..., :3] += (np.asarray(nube).astype(float)[..., None] - 128) * 0.035
    a[..., :3] += rng.normal(0, 2.2, (h, w, 1))
    # borde: canto más oscuro y una línea de luz del lado de la ventana
    e = 2 * S
    a[:e, :, :3] *= 0.93; a[-e:, :, :3] *= 0.86; a[:, -e:, :3] *= 0.86; a[:, :e, :3] *= 1.02
    im = Image.fromarray(a.clip(0, 255).astype('uint8'), 'RGBA')
    # esquinas apenas redondeadas
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=3 * S, fill=255)
    im.putalpha(m)
    return im

T_BLANCA, T_PETRO = tarjeta(BLANCO), tarjeta(PETROLEO)

def hoja(semilla):
    w, h = 400 * S, 510 * S
    rng = np.random.default_rng(semilla)
    a = np.zeros((h, w, 4)); a[..., :3] = (244, 245, 246); a[..., 3] = 255
    a[..., :3] *= np.linspace(1.02, 0.97, w)[None, :, None]
    a[..., :3] += rng.normal(0, 1.5, (h, w, 1))
    im = Image.fromarray(a.clip(0, 255).astype('uint8'), 'RGBA')
    d = ImageDraw.Draw(im)
    # encabezado: dos renglones cortos
    for yy, ln in ((34, 150), (46, 90)):
        x = 40
        while x < 40 + ln:
            pw = int(rng.integers(6, 22)); d.rectangle((x * S, yy * S, (x + pw) * S, (yy + 3) * S), fill=(120, 124, 130, 255)); x += pw + 4
    y = 72
    while y < 480:
        # casilla
        d.rectangle((40 * S, y * S, 48 * S, (y + 8) * S), outline=(150, 154, 160, 255), width=S)
        # pregunta impresa: palabras como bloques finos de texto
        x, fin = 58, int(rng.integers(170, 250))
        while x < fin:
            pw = int(rng.integers(5, 24))
            d.rectangle((x * S, (y + 2) * S, (x + pw) * S, (y + 5) * S), fill=(135, 139, 145, 255))
            x += pw + int(rng.integers(3, 6))
        # respuesta a lápiz: trazo continuo con lazos pequeños
        if rng.random() < .85:
            x0 = int(rng.integers(fin + 14, fin + 40)); largo = int(rng.integers(40, 95))
            pts = []
            for i in range(largo // 2):
                xx = x0 + i * 2 + rng.normal(0, .6)
                yy = y + 4 + 3.2 * math.sin(i * rng.uniform(.7, 1.4)) + rng.normal(0, .5)
                pts.append((xx * S, yy * S))
            d.line(pts, fill=(78, 82, 90, 235), width=int(1.3 * S), joint='curve')
        # algunas casillas palomeadas
        if rng.random() < .35:
            d.line([(41 * S, (y + 4) * S), (44 * S, (y + 7) * S), (50 * S, (y - 1) * S)], fill=(78, 82, 90, 235), width=int(1.3 * S))
        y += int(rng.integers(24, 30))
    return im.filter(ImageFilter.GaussianBlur(0.7 * S))

HOJAS = [hoja(11), hoja(12), hoja(13)]

def pegar(lienzo, spr, x, y, ang, alza=0.0):
    r = spr.rotate(ang, resample=Image.BICUBIC, expand=True)
    r = r.resize((r.width // S, r.height // S), Image.LANCZOS)
    if alza:
        k = 1 + alza * 0.04
        r = r.resize((int(r.width * k), int(r.height * k)), Image.LANCZOS)
    alpha = r.split()[3]
    def capa(op, blur, off):
        sh = Image.new('RGBA', r.size, (4, 8, 14, 0)); sh.putalpha(alpha.point(lambda v: int(v * op)))
        pad = int(blur * 3)
        big = Image.new('RGBA', (r.width + 2 * pad, r.height + 2 * pad), (0, 0, 0, 0)); big.alpha_composite(sh, (pad, pad))
        big = big.filter(ImageFilter.GaussianBlur(blur))
        lienzo.alpha_composite(big, (int(x - r.width / 2 + off - pad), int(y - r.height / 2 + off * 0.8 - pad)))
    # sombra de contacto, corta y oscura, más una sombra amplia y suave
    capa(0.55 - alza * 0.25, 1.5 + alza * 2, 1.5 + alza * 4)
    capa(0.30 + alza * 0.10, 6 + alza * 6, 5 + alza * 9)
    lienzo.alpha_composite(r, (int(x - r.width / 2), int(y - r.height / 2)))

PILA = (465, 368)  # centro de la pila de cuestionarios en la placa
destino = [(0, 0), (0, 1), (1, 0), (1, 2), (2, 1), (2, 2)]  # (fila impacto, columna esfuerzo)
fin = [(cx[c], cy[r], random.uniform(-1.2, 1.2)) for r, c in destino]
hojas_fin = [(PILA[0] - 4, PILA[1] + 3, -1.4), (PILA[0] + 3, PILA[1] - 2, 0.9), (PILA[0], PILA[1], -0.4)]
N = 40

def ease(t): return t * t * (3 - 2 * t)

def hojas_en(n):
    """Hojas 1-3 llegan desde la izquierda en los cuadros 2-7, dos cuadros cada una."""
    out = []
    for j in range(3):
        a0 = 2 + 2 * j
        if n < a0: continue
        t = 1 if n >= a0 + 2 else ease((n - a0 + 1) / 2)
        x1, y1, r1 = hojas_fin[j]
        x0, y0, r0 = x1 - 520, y1 + 40, r1 - 6
        out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, r0 + (r1 - r0) * t, t < 1))
    return out

def estado(n):
    """Tarjeta k: aparece sobre la pila en el cuadro 8+5k y viaja a su celda en los 4 siguientes."""
    pos = []
    for k in range(6):
        a0 = 8 + 5 * k
        if n < a0: pos.append(None); continue
        t = 1 if n >= a0 + 4 else (n - a0) / 4
        t = ease(t)
        x0, y0 = PILA[0] + 10, PILA[1] - 20
        x1, y1, r1 = fin[k]
        x = x0 + (x1 - x0) * t; y = y0 + (y1 - y0) * t - math.sin(math.pi * t) * 34
        pos.append((x, y, -2 + (r1 + 2) * t, 0 < t < 1, n == a0))
    return pos

import os
os.makedirs('cuadros', exist_ok=True)
for n in range(1, N + 1):
    lienzo = placa.convert('RGBA')
    if n > 1:
        lienzo = ImageEnhance.Brightness(lienzo.convert('RGB')).enhance(1 + random.uniform(-0.008, 0.008)).convert('RGBA')
    for j, (x, y, r, moviendo) in enumerate(hojas_en(n)):
        if not moviendo and n > 1:
            x += random.uniform(-0.6, 0.6); y += random.uniform(-0.6, 0.6)
        pegar(lienzo, HOJAS[j], x, y, r, 0.5 if moviendo else 0.0)
    for k, e in enumerate(estado(n)):
        if e is None: continue
        x, y, r, moviendo, naciendo = e
        if not moviendo and not naciendo:
            x += random.uniform(-0.8, 0.8); y += random.uniform(-0.8, 0.8); r += random.uniform(-0.25, 0.25)
        spr, alza = T_BLANCA, (0.6 if (moviendo or naciendo) else 0.0)
        if k == 0:
            if n == 38: alza = 1.0
            elif n == 39: spr, alza = T_PETRO, 1.0
            elif n == 40: spr, alza = T_PETRO, 0.3
        pegar(lienzo, spr, x, y, r, alza)
    lienzo.convert('RGB').save(f'cuadros/cuadro_{n:03d}.png')
print('ok')
