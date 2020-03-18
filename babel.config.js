module.exports = {
  ignore: ["./src/lib/template.js"],
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { node: 10 }
      }
    ]
  ]
};
