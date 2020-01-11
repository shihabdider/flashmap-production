export default ({ jbrequire }) => {
  const MakeSpreadsheetColumnType = jbrequire(
    require('./MakeSpreadsheetColumnType'),
  )

  const NumberColumn = MakeSpreadsheetColumnType('Number', {
    compare(cellA, cellB) {
      return parseFloat(cellA.text) - parseFloat(cellB.text)
    },
  })

  return NumberColumn
}
