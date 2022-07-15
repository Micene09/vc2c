import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import "path-browserify";

export default defineConfig({
	root: resolve(__dirname, "demo"),
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "demo/index.html"),
			}
		}
	},
	plugins: [
		tsconfigPaths()
	],
	resolve: {
		alias: {
			path: "path-browserify",
		},
		extensions: [".mjs", ".js", ".ts", ".mts", ".json"]
	}
});
