// Agregación del analytics-engine, portada literal de
// ~/Code/analytics-engine/examples/workbench/cockpit_demo.html (líneas 998-1061).
// Es el espejo en JavaScript de `read_curve_point` y `aggregate_scenario` de
// Python: lookup sobre curvas precomputadas y suma comonótona. No se reescribe
// ni se simplifica, y no hay modelado en el navegador.
//
// Un solo lugar: el mismo módulo alimenta el render del servidor (valores
// iniciales del bloque) y el recálculo en el cliente, así no pueden divergir.

// interp: interpolación lineal con clamp en los bordes (== numpy.interp).
export function wbInterp(xs, ys, x) {
  var n = xs.length;
  if (x <= xs[0]) return ys[0];
  if (x >= xs[n - 1]) return ys[n - 1];
  for (var i = 1; i < n; i++) {
    if (x <= xs[i]) {
      var t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
      return ys[i - 1] + t * (ys[i] - ys[i - 1]);
    }
  }
  return ys[n - 1];
}

// readPoint: == read_curve_point (banda de volumen reordenada por min/max;
// revenue = precio x volumen; margen = (precio - costo) x volumen).
export function wbReadPoint(curve, price) {
  var lo = wbInterp(curve.prices, curve.vol_low, price);
  var mid = wbInterp(curve.prices, curve.vol_mid, price);
  var hi = wbInterp(curve.prices, curve.vol_high, price);
  var vlo = Math.min(lo, mid, hi), vhi = Math.max(lo, mid, hi);
  var volume = { low: vlo, mid: mid, high: vhi };
  var rc = [price * vlo, price * mid, price * vhi];
  var revenue = { low: Math.min(rc[0], rc[1], rc[2]), mid: price * mid,
                  high: Math.max(rc[0], rc[1], rc[2]) };
  var margin = null;
  if (curve.unit_cost !== null && curve.unit_cost !== undefined) {
    var m = price - curve.unit_cost;
    var mc = [m * vlo, m * mid, m * vhi];
    margin = { low: Math.min(mc[0], mc[1], mc[2]), mid: m * mid,
               high: Math.max(mc[0], mc[1], mc[2]) };
  }
  var extrap = (price < curve.price_min_obs) || (price > curve.price_max_obs);
  return { volume: volume, revenue: revenue, margin: margin, extrapolation: extrap };
}

// aggregate: == aggregate_scenario (suma COMONÓTONA Σ low/mid/high; ROI =
// margen_mid / costo_total, punto). Sin modelado: solo lookup + suma.
export function wbAggregate(curves, prices) {
  var v = { low: 0, mid: 0, high: 0 };
  var r = { low: 0, mid: 0, high: 0 };
  var m = { low: 0, mid: 0, high: 0 };
  var cost = 0, hasMargin = true, nSkus = 0, nExtrap = 0;
  var skus = Object.keys(prices).sort();
  for (var i = 0; i < skus.length; i++) {
    var s = skus[i];
    if (!curves[s]) continue;
    var k = wbReadPoint(curves[s], prices[s]);
    nSkus += 1;
    if (k.extrapolation) nExtrap += 1;
    v.low += k.volume.low; v.mid += k.volume.mid; v.high += k.volume.high;
    r.low += k.revenue.low; r.mid += k.revenue.mid; r.high += k.revenue.high;
    if (k.margin === null) { hasMargin = false; }
    else {
      m.low += k.margin.low; m.mid += k.margin.mid; m.high += k.margin.high;
      cost += k.revenue.mid - k.margin.mid;
    }
  }
  var out = { volume: v, revenue: r, margin: hasMargin ? m : null,
              roi: null, n_skus: nSkus, n_extrapolated: nExtrap };
  if (hasMargin && cost > 0) {
    var roi = m.mid / cost;
    out.roi = { low: roi, mid: roi, high: roi };
  }
  return out;
}
