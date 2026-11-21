// Read the full content of a Hexo route into a Buffer.
export default function readRoute(route, routePath) {
  return new Promise((resolve, reject) => {
    const stream = route.get(routePath);
    if (!stream) {
      reject(new Error(`Route not found: ${routePath}`));
      return;
    }
    const chunks = [];
    stream.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}
