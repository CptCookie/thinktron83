abstract class BlockType {
  abstract element: keyof HTMLElementTagNameMap
  abstract match(line: string): [boolean, string]
  closes(_line: string): boolean {
    return false
  }
}

class Document extends BlockType {
  element: keyof HTMLElementTagNameMap = "div"
  match(line: string): [boolean, string] {
    return [true, line]
  }
}

class HeaderBlock extends BlockType {
  element: keyof HTMLElementTagNameMap = "h1"
  prefix: string

  constructor(n: 1 | 2 | 3 | 4 | 5 | 6) {
    super()
    switch (n) {
      case 1:
        this.element = "h1"
        this.prefix = "#"
        break

      case 2:
        this.element = "h2"
        this.prefix = "##"

        break

      case 3:
        this.element = "h3"
        this.prefix = "###"
        break

      case 4:
        this.element = "h4"
        this.prefix = "####"
        break

      case 5:
        this.element = "h5"
        this.prefix = "#####"
        break

      default:
        this.element = "h6"
        this.prefix = "######"
        break
    }
  }

  match(line: string): [boolean, string] {
    if (line.startsWith(this.prefix + " ")) {
      return [true, line.substring(this.prefix.length + 1)]
    }
    return [false, line]
  }
}

class Paragraph extends BlockType {
  element: keyof HTMLElementTagNameMap = "p"
  match(line: string): [boolean, string] {
    return [true, line]
  }

  instantClosedByLine(line: string): boolean {
    return line == "\n"
  }
}

// class List extends BlockType {
//
//   match(line: string): [boolean, string] {
//     return [true, line]
//   }
// }
//
// class Item extends BlockType {
//   match(line: string): [boolean, string] {
//     if (line.startsWith("- ")) {
//       return [true, line.slice(2)]
//     }
//
//     return [false, line]
//   }
// }

const NEW_BLOCK_MATCH_ORDER: ReadonlyArray<BlockType> = [
  // new Item(),
  new HeaderBlock(1),
  new HeaderBlock(2),
  new HeaderBlock(3),
  new HeaderBlock(4),
  new HeaderBlock(5),
  new HeaderBlock(6),
]

class Block {
  type: BlockType
  open: boolean
  text: string
  childs: Block[]

  constructor(type: BlockType, text?: string, open?: boolean) {
    this.type = type
    this.open = true
    this.text = text || ""
    this.childs = []
  }

  add(block: Block) {
    this.childs.push(block)
  }

  render(): HTMLElement {
    let element = document.createElement(this.type.element)
    element.textContent = this.text
    for (let c of this.childs) {
      element.appendChild(c.render())
    }
    return element
  }

  tip(): Block {
    let l = this.childs.at(-1)
    if (l) {
      return l.tip()
    }
    return this
  }

  getOpenChild() {
    let l = this.childs.at(-1)
    if (l && l.open) {
      return l
    }
  }

  closeChilds() {
    let open = this.getOpenChild()
    if (open) {
      open.close()
    }
  }

  close() {
    this.getOpenChild()?.close()
    this.open = false
  }

  match(line: string): [boolean, string] {
    return this.type.match(line)
  }
}

/**
 * shorthand function to render simple markdown strin gs
 * @param content
 * @returns rendered HTML tree
 */
export const renderMarkdown = (content: string): HTMLElement => {
  console.log("render markdown")
  return parseBlocks(content).render()
}

/**
 * parse the content into a Markdown AST structure that we can start to render in the next step
 *
 * Algo:
 * - match line along a stack of open Blocks (potententially taking away markers from the line)
 * - keep ref to the last matched open block
 * - determine for the remainder of the line
 *   - on a new block start close the other blocks (empty line after Paragraph all in a block comment)
 *   - if the tip is open Paragraph or item add a SoftBreak and continue ('> text\n> more text' )
 * -
 *
 * Edge cases:
 * - matching a fenced blocks closes it directly
 * @param content
 * @returns
 */
const parseBlocks = (content: string): Block => {
  console.log("parseBlock")
  const root = new Block(new Document())

  for (let line of content.split("\n")) {
    let openBlock: Block = root
    console.log("new Line: ", line)

    if (line == "") {
      console.log("close after root")
      root.closeChilds()
    }

    while (line) {
      console.log(line)
      line = line.trimStart()

      let [matches, nextLine] = openBlock.match(line)
      console.log(matches, nextLine)
      let nextBlock = openBlock.getOpenChild()
      console.log(nextBlock)
      if (matches) {
        line = nextLine
        if (nextBlock) {
          // not the end of the stack
          openBlock = nextBlock
          continue
        }
      }

      if (line == "") {
        console.log("close childs")
        openBlock.closeChilds()
        break
      }

      let nextType: BlockType | undefined = undefined
      for (let t of NEW_BLOCK_MATCH_ORDER) {
        let [match, newLine] = t.match(line)
        if (match) {
          nextType = t
          line = newLine
          break
        }
      }

      if (nextType) {
        console.log("add at ", openBlock)
        openBlock.closeChilds()
        openBlock.add(new Block(nextType, line))
        break
      }

      if (!nextType && line !== "") {
        let tip = root.tip()
        console.log("tip is ", tip.open ? "open" : "close")
        if (tip.type instanceof Paragraph && tip.open) {
          console.log("add at the tip: ", line)
          tip.text = tip.text + "\n" + line
        } else {
          console.log("add at the root", line)
          root.add(new Block(new Paragraph(), line))
        }
        break
      }
    }
  }
  console.log(root)
  return root
}
