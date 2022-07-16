import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import "path-browserify";

export default defineConfig({
	server: {
		host: "localhost",
		open: true
	},
	root: resolve(__dirname, "debug"),
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "debug/index.html"),
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
