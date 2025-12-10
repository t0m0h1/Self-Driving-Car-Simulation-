// Utility functions for various mathematical operations
function lerp(a, b, t) {
    return a + (b - a) * t;
  }
  
  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  function mutate(value, amount = 0.1) {
    if (Math.random() < 0.1) {
      return value + (Math.random() * 2 - 1) * amount;
    }
    return value;
  }
  

  // Distance between two points
function distance(A, B) {
    return Math.hypot(A.x - B.x, A.y - B.y);
  }
  
  // Get intersection point of two line segments
  function getIntersection(A, B, C, D) {
    const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
    const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
    const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);
  
    if (bottom === 0) return null; // Parallel lines
    const t = tTop / bottom;
    const u = uTop / bottom;
  
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: A.x + t * (B.x - A.x),
        y: A.y + t * (B.y - A.y)
      };
    }
    return null;
  }
  
  // Check if two polygons intersect
  function polysIntersect(poly1, poly2) {
    for (let i = 0; i < poly1.length; i++) {
      for (let j = 0; j < poly2.length; j++) {
        const touch = getIntersection(
          poly1[i],
          poly1[(i+1)%poly1.length],
          poly2[j],
          poly2[(j+1)%poly2.length]
        );
        if (touch) return true;
      }
    }
    return false;
  }
  