// Wire routing helpers
const DV = { top:[0,-1], bottom:[0,1], left:[-1,0], right:[1,0] };

export const bezier = (ax, ay, aDirName, bx, by, bDirName) => {
  const t = Math.max(50, Math.hypot(bx-ax, by-ay) * 0.44);
  const [adx, ady] = DV[aDirName] || [1,0];
  const [bdx, bdy] = DV[bDirName] || [-1,0];
  return `M ${ax} ${ay} C ${ax+adx*t} ${ay+ady*t}, ${bx+bdx*t} ${by+bdy*t}, ${bx} ${by}`;
};

export const rubber = (ax, ay, aDir, mx, my) => {
  const t = Math.max(50, Math.hypot(mx-ax, my-ay) * 0.44);
  const [adx, ady] = DV[aDir] || [1,0];
  return `M ${ax} ${ay} C ${ax+adx*t} ${ay+ady*t}, ${mx} ${my}, ${mx} ${my}`;
};