import React, { useEffect, useRef } from "react";
import * as fabric from "fabric"; // v6

const Canvas = React.forwardRef((props, ref) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas("fabric-canvas", {
      backgroundColor: "#f9f9f9",
      selection: true,
    });

    canvasRef.current = canvas;

    if (ref) {
      ref.current = canvas;
    }

    return () => {
      canvas.dispose();
    };
  }, [ref]);

  return (
    <div className="border border-gray-300 shadow-lg rounded-md p-4 bg-white">
      <canvas
        id="fabric-canvas"
        width={800}
        height={600}
        className="border border-gray-200"
      ></canvas>
    </div>
  );
});

export default Canvas;
