import { ASTConverter, ASTResultKind, ReferenceKind } from '../types'
import type ts from 'typescript'
import { isPrimitiveType, copySyntheticComments, removeComments } from '../../utils'
import { TypeNode } from 'typescript'

export const convertData: ASTConverter<ts.PropertyDeclaration> = (node, options, program) => {
  if (!node.initializer) {
    return false
  }
  const tsModule = options.typescript
  const dataName = node.name.getText()

  const checker = program.getTypeChecker()
  let isRef = false
  if (node.type) {
    const types: TypeNode[] = (node.type as any).types ? (node.type as any).types : [node.type]
    const primitivesFound = types.map(t => isPrimitiveType(tsModule, checker.getTypeAtLocation(t)))
    const areAllPrimitives = primitivesFound.filter(Boolean).length === types.length
    isRef = areAllPrimitives
  } else {
    isRef = isPrimitiveType(tsModule, checker.getTypeAtLocation(node.initializer))
  }

  const tag = isRef ? 'Data-ref' : 'Data-reactive'
  const named = isRef ? ['ref'] : ['reactive']
  const callExpr = isRef
    ? tsModule.createCall(
      tsModule.createIdentifier('ref'),
      node.type
        ? (
          (node.type as any).types?.length
            ? [tsModule.createUnionTypeNode((node.type as any).types)]
            : [tsModule.createKeywordTypeNode(node.type.kind as any)]
        )
        : undefined,
      [removeComments(tsModule, node.initializer)]
    )
    : tsModule.createCall(
      tsModule.createIdentifier('reactive'),
      node.type
        ? (
          (node.type as any).types?.length
            ? [tsModule.createUnionTypeNode((node.type as any).types)]
            : [tsModule.createUnionTypeNode([node.type])]
        )
        : undefined,
      [removeComments(tsModule, node.initializer)]
    )

  return {
    tag,
    kind: ASTResultKind.COMPOSITION,
    imports: [{
      named,
      external: 'vue'
    }],
    reference: (isRef) ? ReferenceKind.VARIABLE_VALUE : ReferenceKind.VARIABLE,
    attributes: [dataName],
    nodes: [
      copySyntheticComments(
        tsModule,
        tsModule.createVariableStatement(
          undefined,
          tsModule.createVariableDeclarationList([
            tsModule.createVariableDeclaration(
              tsModule.createIdentifier(dataName),
              undefined,
              callExpr
            )
          ],
          tsModule.NodeFlags.Const)
        ),
        node
      )
    ] as ts.Statement[]
  }
}
