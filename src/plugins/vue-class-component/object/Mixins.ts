import ts from "typescript";
import { ASTConverter, ASTResultKind, ReferenceKind } from "../../types"

export const convertMixins: ASTConverter<ts.HeritageClause> = (node, options) => {
  const tsModule = options.typescript

  const mixinExpression = node.types[0].expression.getFullText().trim();

  if (!mixinExpression.startsWith("Mixins"))
    return false

  const mixinArguments = mixinExpression
    .replace("Mixins(", "").replace(")", "")
    .split(",").map(arg => arg.trim())

  const mixinsNodes = [
    tsModule.createPropertyAssignment(
      tsModule.createIdentifier("mixins"),
      tsModule.createArrayLiteral(
        mixinArguments.map(mixin => tsModule.createIdentifier(mixin)),
        false
      )
    )
  ]

  return {
    tag: 'Mixins',
    kind: ASTResultKind.OBJECT,
    imports: [],
    reference: ReferenceKind.MIXINS,
    attributes: mixinArguments,
    nodes: mixinsNodes
  }
}