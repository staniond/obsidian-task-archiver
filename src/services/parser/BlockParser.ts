import { TreeBuilder } from "./TreeBuilder";

import { CODE_FENCE_PATTERN, LIST_MARKER_PATTERN } from "../../Patterns";
import { IndentationSettings } from "../../Settings";
import { Block } from "../../model/Block";
import { ListBlock } from "../../model/ListBlock";
import { RootBlock } from "../../model/RootBlock";
import { TextBlock } from "../../model/TextBlock";
import { splitOnIndentation } from "../../util/Util";

function removeIndentationFromListItems(rootBlock: Block) {
    function recursive(block: Block, parentIndentation: string) {
        for (const child of block.children) {
            if (child instanceof ListBlock) {
                const [indentation, withoutIndentation] = splitOnIndentation(
                    child.text
                );

                child.text = withoutIndentation;
                recursive(child, indentation);
            } else {
                child.text = child.text.substring(parentIndentation.length);
            }
        }
    }

    recursive(rootBlock, "");
}

export class BlockParser {
    constructor(private readonly settings: IndentationSettings) {}

    parse(lines: string[]): Block {
        let inCodeFence = false;
        const flatBlocks = lines.map((line) => {
            const fenceMatch = line.match(CODE_FENCE_PATTERN);
            if (fenceMatch && !inCodeFence) {
                inCodeFence = true;
                return this.parseFlatBlock(line);
            }
            if (fenceMatch && inCodeFence) {
                const afterMarker = line.substring(fenceMatch[0].length).trim();
                if (afterMarker === "") {
                    inCodeFence = false;
                    return this.parseFlatBlock(line);
                }
            }
            if (inCodeFence) {
                return {
                    level: this.getIndentationLevel(line),
                    markdownNode: new TextBlock(line),
                };
            }
            return this.parseFlatBlock(line);
        });

        const rootBlock = new RootBlock();
        const rootFlatBlock = {
            markdownNode: rootBlock,
            level: 0,
        };

        new TreeBuilder().buildTree(rootFlatBlock, flatBlocks);
        removeIndentationFromListItems(rootBlock);

        return rootBlock;
    }

    getIndentationLevel(line: string) {
        // TODO: this needs to be 1 only because the root block is 0, but this way this knowledge is implicit
        const [indentation] = splitOnIndentation(line);
        const levelsOfIndentation = 1;
        if (this.settings.useTab) {
            return levelsOfIndentation + indentation.length;
        }
        return (
            levelsOfIndentation + Math.ceil(indentation.length / this.settings.tabSize)
        );
    }

    private parseFlatBlock(line: string) {
        const [, text] = splitOnIndentation(line);
        const level = this.getIndentationLevel(line);
        const markdownNode = text.match(LIST_MARKER_PATTERN)
            ? new ListBlock(line)
            : new TextBlock(line);
        return {
            level,
            markdownNode,
        };
    }
}
