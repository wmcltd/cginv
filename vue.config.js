module.exports = {
  transpileDependencies: ["vuetify"],
  devServer: {
    // proxy: {
    //   "/": {
    //     target: 'https://2glymihrdd.execute-api.us-east-1.amazonaws.com',
    //     logLevel: "debug",
    //     changeOrigin: true,
    //     secure: true,
    //   },
    // },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  }
}