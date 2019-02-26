// from: http://www.flong.com/texts/code/shapers_bez/
export function CubicBezier(ax, ay, bx, by) {
  const y0 = 0.00; // initial y
  const x0 = 0.00; // initial x 
  const c1y = ay;    // 1st influence y   
  const c1x = ax;    // 1st influence x 
  const c2y = by;    // 2nd influence y
  const c2x = bx;    // 2nd influence x
  const y1 = 1.00; // final y 
  const x1 = 1.00; // final x 

  const A =   x1 - 3*c2x + 3*c1x - x0;
  const B = 3*c2x - 6*c1x + 3*x0;
  const C = 3*c1x - 3*x0;   
  const D =   x0;

  const E =   y1 - 3*c2y + 3*c1y - y0;    
  const F = 3*c2y - 6*c1y + 3*y0;             
  const G = 3*c1y - 3*y0;             
  const H =   y0;

  function slopeFromT (t, A, B, C){
    const dtdx = 1.0/(3.0*A*t*t + 2.0*B*t + C); 
    return dtdx;
  }
  
  function xFromT (t, A, B, C, D){
    const x = A*(t*t*t) + B*(t*t) + C*t + D;
    return x;
  }
  
  function yFromT (t, E, F, G, H){
    const y = E*(t*t*t) + F*(t*t) + G*t + H;
    return y;
  }

  return function(x) {
    let currentt = x
    const nRefinementIterations = 5
    for (let i=0; i< nRefinementIterations; i++) {
      const currentx = xFromT(currentt, A, B, C, D)
      const currentSlope = slopeFromT(currentt, A, B, C)
      currentt -= (currentx - x) * currentSlope
      if (currentt < 0) currentt = 0
      if (currentt > 1) currentt = 1
    }
    return yFromT(currentt, E, F, G, H)
  }
}


