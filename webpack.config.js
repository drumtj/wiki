const path = require("path");
const webpack = require("webpack");
// const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// const HtmlWebpackPlugin = require("html-webpack-plugin");
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
// const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// const PreloadWebpackPlugin = require('preload-webpack-plugin');
const ConcatSource = require("webpack-sources").ConcatSource;
const ModuleFilenameHelpers = require("webpack/lib/ModuleFilenameHelpers");

class WrapperPlugin {

	/**
	 * @param {Object} args
	 * @param {string | Function} [args.header]  Text that will be prepended to an output file.
	 * @param {string | Function} [args.footer] Text that will be appended to an output file.
	 * @param {string | RegExp} [args.test] Tested against output file names to check if they should be affected by this
	 * plugin.
	 * @param {boolean} [args.afterOptimizations=false] Indicating whether this plugin should be activated before
	 * (`false`) or after (`true`) the optimization stage. Example use case: Set this to true if you want to avoid
	 * minification from affecting the text added by this plugin.
	 */
	constructor(args) {
		if (typeof args !== 'object') {
			throw new TypeError('Argument "args" must be an object.');
		}

		this.header = args.hasOwnProperty('header') ? args.header : '';
		this.footer = args.hasOwnProperty('footer') ? args.footer : '';
		this.afterOptimizations = args.hasOwnProperty('afterOptimizations') ? !!args.afterOptimizations : false;
		this.test = args.hasOwnProperty('test') ? args.test : '';
	}

	apply(compiler) {
		const header = this.header;
		const footer = this.footer;
		const tester = {test: this.test};

		compiler.hooks.compilation.tap('WrapperPlugin', (compilation) => {
			if (this.afterOptimizations) {
				compilation.hooks.afterOptimizeChunkAssets.tap('WrapperPlugin', (chunks) => {
					wrapChunks(compilation, chunks, footer, header);
				});
			} else {
				compilation.hooks.optimizeChunkAssets.tapAsync('WrapperPlugin', (chunks, done) => {
					wrapChunks(compilation, chunks, footer, header);
					done();
				})
			}
		});

		function wrapFile(compilation, fileName, chunkHash) {
			const headerContent = (typeof header === 'function') ? header(fileName, chunkHash) : header;
			const footerContent = (typeof footer === 'function') ? footer(fileName, chunkHash) : footer;

			compilation.assets[fileName] = new ConcatSource(
					String(headerContent),
					compilation.assets[fileName],
					String(footerContent));
		}

		function wrapChunks(compilation, chunks) {
			chunks.forEach(chunk => {
				const args = {
					hash: compilation.hash,
					chunkhash: chunk.hash
				};
				chunk.files.forEach(fileName => {
					if (ModuleFilenameHelpers.matchObject(tester, fileName)) {
						wrapFile(compilation, fileName, args);
					}
				});
			});
		}
	}
}

//
//
//
let babelOptionIndex = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "browsers": ["last 2 versions", "ie >= 11"]
        }
      }
    ]
  ]
	,"plugins": [
    "@babel/plugin-transform-classes",
    "@babel/plugin-transform-async-to-generator",
    "@babel/plugin-transform-arrow-functions"
  ]
}

const config = {
  mode: "production", //"devtool",//"production",// "none"
	//"@babel/polyfill",
  entry: [ "@babel/polyfill", "./src/scripts/index.ts" ],
  resolve: {
    extensions: [".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "babel-loader",
						options: babelOptionIndex
          },
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },
  cache: true,
  devtool: "source-map"
};

// module.exports = config;
//
let libraryName = "wiki";
let pfh = `(function webpackUniversalModuleDefinition(root, factory) {
  if(typeof exports === 'object' && typeof module === 'object')
    module.exports = factory().default;
  else if(typeof define === 'function' && define.amd)
    define([], factory);
  else if(typeof exports === 'object')
    exports['MyLibrary'] = factory().default;
  else{
    root['MyLibrary'] = factory().default;
  }
})(typeof self !== 'undefined' ? self : this, function() {
  return `.replace(/MyLibrary/g, libraryName);
let pff = `\n})`

// let umdCfg = Object.assign({}, config);
// umdCfg.output = {
//   path: path.join(__dirname, "dist"),
//   library: libraryName,
//   libraryTarget: "umd",
// 	// globalObject: 'this',
//   filename: "./wiki.umd.js"
// }


let globalCfg = Object.assign({}, config);
globalCfg.output = {
  path: path.join(__dirname, "dist"),
  library: libraryName,
  libraryTarget: "window",
  filename: "./wiki.js"
}
globalCfg.plugins = [
  new WrapperPlugin({
    test: /\.js$/,
    header: pfh,
    footer: pff
  }),
]

// module.exports = [ umdCfg, globalCfg ];
module.exports = [ globalCfg ];
