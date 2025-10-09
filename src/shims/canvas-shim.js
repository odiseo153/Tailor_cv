// Minimal browser shim for the Node 'canvas' package used by pdfjs-dist's NodeCanvasFactory
module.exports = {
  createCanvas: function (width, height) {
    return {
      width: width || 0,
      height: height || 0,
      getContext: function () {
        return null;
      },
      toBuffer: function () {
        return Buffer.from('');
      },
    };
  },
};


