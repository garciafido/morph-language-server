import * as path from 'path';
// import * as TreeSitterParser from 'web-tree-sitter'
import * as TreeSitterParser from 'tree-sitter';
const morph = require('tree-sitter-morph');


class MorphParser {
	parser: TreeSitterParser | undefined;
	error: string = "None errors";
	constructor() {
		this.parser = new TreeSitterParser();
		this.parser.setLanguage(morph);

		// const wasmFilePath = path.join(__dirname, '../parser', '/tree-sitter-morph.wasm');
		// const self = this;
		// TreeSitterParser.init().then(
		// 	() => {
		// 		TreeSitterParser.Language.load(wasmFilePath).then(
		// 			(morph) => {
		// 				self.parser = new TreeSitterParser;
		// 				self.parser.setLanguage(morph);
		// 			},
		// 			(reason) => {
		// 				console.log(reason);
		// 				self.error = reason;
		// 			});
		// 	},
		// 	(reason) => {
		// 		console.log(reason);
		// 		self.error = reason;
		// 	}
		// );
	}

	parse(sourceCode: string) {
		if (this.parser) {
			const tree = this.parser.parse(sourceCode);
			return tree.rootNode.toString();
		}
		return this.error;
	}
}

export const Parser = new MorphParser();