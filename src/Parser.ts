import * as path from 'path';
import * as TreeSitterParser from 'web-tree-sitter'

const LIST_POSTFIX = "__list";

type parsedTree = {
	type: any,
	ERRORS: any[],
}

type parsedNode = {
	type: string;
	value: string | undefined;
	children: any | undefined;
	sourceFilePosition: {
		start: number;
		end: number;
	}

}

class MorphParser {
	parser: TreeSitterParser | undefined;
	error: string = "";
	sourceCode: string = '';
	sourceCodeErrors: parsedNode[] = [];

	constructor() {
		const wasmFilePath = path.join(__dirname, '../parser', '/tree-sitter-morph.wasm');
		const self = this;
		TreeSitterParser.init().then(
			() => {
				TreeSitterParser.Language.load(wasmFilePath).then(
					(morph) => {
						self.parser = new TreeSitterParser;
						self.parser.setLanguage(morph);
					},
					(reason) => {
						console.log(reason);
						self.error = reason;
					});
			},
			(reason) => {
				console.log(reason);
				self.error = reason;
			}
		);
	}

	private getContent(node: any) {
		return this.sourceCode.substring(node.startIndex, node.endIndex);
	}

	private traverse(node: any): any {
		const type = node.type;
		const NewNode: parsedNode = {
			type: type === "decorators__list" ? "Decorator" : type === "identifier" ? "Identifier" : type,
			value: undefined,
			children: {},
			sourceFilePosition: {
				start: node.startPosition,
				end: node.endPosition,
			}
		};

		const children = node.namedChildren;

		if (children.length === 0) {
			NewNode.value = this.getContent(node);
		}

		const NewChildren: any = {};
		for (const child of children) {
			let childType = child.type;
			if (childType === "ERROR") {
				const error = {
					type: "ERROR",
					value: this.sourceCode.substring(node.startIndex, node.endIndex),
					children: undefined,
					sourceFilePosition: {
						start: child.startIndex,
						end: child.endIndex,
					}
				};
				this.sourceCodeErrors.push(error);
			}
			const isList = childType.lastIndexOf(LIST_POSTFIX) > 0;
			if (isList) {
				childType = childType.substring(0, childType.lastIndexOf(LIST_POSTFIX));
			}
			const firstChar = childType.charAt(0);
			const isField = firstChar.toLowerCase() === firstChar;
			if (isField) {
				if (isList) {
					if (!(childType in NewChildren)) {
						NewChildren[childType] = [];
					}
					NewChildren[childType].push(this.traverse(child));
				} else {
					if (childType in NewChildren) {
						throw new Error(`There is more than one child "${child.type}" and it is not declared as a list. Postfix the rule name with "${LIST_POSTFIX}"`);
					}
					NewChildren[childType] = this.traverse(child);
				}
			}
		}

		if (Object.keys(NewChildren).length > 0) {
			NewNode['children'] = NewChildren;
		} else if (Object.keys(children).length === 1) {
			return this.traverse(children[0])
		}
		return NewNode
	}

	parse(sourceCode: string): parsedTree {
		if (this.parser) {
			this.sourceCode = sourceCode;
			this.sourceCodeErrors = [];
			const tree = this.parser.parse(sourceCode);
			const semanticTree = this.traverse(tree.rootNode);
			semanticTree.ERRORS = this.sourceCodeErrors; 
			return semanticTree;
		}
		return {type: "ERROR", ERRORS: [
			{
				type: "GENERAL ERROR",
				value: this.error,
				children: undefined,
				sourceFilePosition: {
					start: 0,
					end: 10,
				}
			}
		]};
	}
}

export const Parser = new MorphParser();