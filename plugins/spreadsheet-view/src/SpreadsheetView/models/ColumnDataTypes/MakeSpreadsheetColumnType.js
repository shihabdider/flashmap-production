import { types } from 'mobx-state-tree'

/** utility function for assembling the MST model of a column data type */
export default function MakeSpreadsheetColumnType(
  name,
  {
    DataCellReactComponent = null,
    FilterModelType = null,
    compare,
    displayName = undefined,
    categoryName = undefined,
  },
) {
  return types
    .model(`ColumnDataType${name}`, {
      type: types.literal(name),
    })
    .volatile(() => ({
      DataCellReactComponent,
      FilterModelType,
      displayName: displayName || name,
      categoryName,
    }))
    .views(() => ({
      compare,
      get hasFilter() {
        return !!FilterModelType
      },
    }))
}
