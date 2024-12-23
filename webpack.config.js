import path from 'path';
import autoprefixer from 'autoprefixer';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export const module = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(dirname, 'dist'),
  },
  devServer: {
    static: path.resolve(dirname, 'dist'),
    port: 8080,
    hot: true,
    open: true,
    host: 'localhost',
  },
  plugins: [
    new HtmlWebpackPlugin({ template: './index.html' }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: () => [
                  autoprefixer,
                ],
              },
            },
          },
        ],
      },
    ],
  },
};

export default module;
