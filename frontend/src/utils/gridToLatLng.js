export const gridToLatLng = (grid, bounds = null) => {
  if (!grid || !Array.isArray(grid)) return [];
  const latMin = bounds?.lat_min ?? 8.4;
  const latMax = bounds?.lat_max ?? 37.6;
  const lonMin = bounds?.lon_min ?? 68.7;
  const lonMax = bounds?.lon_max ?? 97.2;
  const points = [];
  const rows = grid.length;
  if(rows === 0) return points;
  const cols = grid[0].length || rows;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const intensity = grid[i][j];
      if (intensity > 0.05) {
        const lat = latMin + (i / (rows - 1)) * (latMax - latMin);
        const lon = lonMin + (j / (cols - 1)) * (lonMax - lonMin);
        points.push([lat, lon, intensity * 1.5]);
      }
    }
  }
  return points;
};
