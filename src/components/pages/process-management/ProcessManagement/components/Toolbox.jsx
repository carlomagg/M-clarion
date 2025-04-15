import React from "react";

const Toolbox = ({ canvas }) => {
  const addRectangle = () => {
    if (canvas) {
      const rect = new fabric.Rect({
        left: 50,
        top: 50,
        fill: "blue",
        width: 100,
        height: 50,
      });
      canvas.add(rect);
    }
  };

  const addCircle = () => {
    if (canvas) {
      const circle = new fabric.Circle({
        left: 150,
        top: 100,
        fill: "green",
        radius: 50,
      });
      canvas.add(circle);
    }
  };

  const addArrow = () => {
    if (canvas) {
      const arrow = new fabric.Polyline(
        [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 90, y: 10 },
          { x: 100, y: 0 },
          { x: 90, y: -10 },
        ],
        {
          left: 200,
          top: 200,
          fill: "black",
          stroke: "black",
          strokeWidth: 2,
        }
      );
      canvas.add(arrow);
    }
  };

  const addText = () => {
    if (canvas) {
      const text = new fabric.Textbox("Editable Text", {
        left: 300,
        top: 150,
        fontSize: 20,
        width: 200,
      });
      canvas.add(text);
    }
  };

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Toolbox</h2>
      <button
        onClick={addRectangle}
        className="w-full mb-2 px-4 py-2 bg-blue-500 text-white rounded-md shadow hover:bg-blue-600"
      >
        Add Rectangle
      </button>
      <button
        onClick={addCircle}
        className="w-full mb-2 px-4 py-2 bg-green-500 text-white rounded-md shadow hover:bg-green-600"
      >
        Add Circle
      </button>
      <button
        onClick={addArrow}
        className="w-full mb-2 px-4 py-2 bg-gray-700 text-white rounded-md shadow hover:bg-gray-800"
      >
        Add Arrow
      </button>
      <button
        onClick={addText}
        className="w-full px-4 py-2 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600"
      >
        Add Text
      </button>
    </div>
  );
};

export default Toolbox;
