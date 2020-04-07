"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import * as TreeSitterParser from 'web-tree-sitter'
const TreeSitterParser = require("tree-sitter");
const morph = require('tree-sitter-morph');
class MorphParser {
    constructor() {
        this.error = "None errors";
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
    parse(sourceCode) {
        if (this.parser) {
            const tree = this.parser.parse(sourceCode);
            return tree.rootNode.toString();
        }
        return this.error;
    }
}
exports.Parser = new MorphParser();
//# sourceMappingURL=Parser.js.map