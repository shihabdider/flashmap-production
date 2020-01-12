export default ({ jbrequire }) => {
  const { parseLocString } = jbrequire('@gmod/jbrowse-core/util')

  function parseLocStringAndConvertToInterbase(locstring) {
    const parsed = parseLocString(locstring)
    if (typeof parsed.start === 'number') parsed.start -= 1
    return parsed
  }

  function makeAdHocFeature(
    columns,
    columnsAlreadyUsedInLocations,
    row,
    loc1,
    loc2,
    rowNumber,
  ) {
    // load all the other data in the row into an `otherData` object
    const otherData = {}
    columns.forEach((column, columnNumber) => {
      if (columnsAlreadyUsedInLocations.includes(columnNumber)) return
      let { text } = row.cells[columnNumber]
      if (column.dataType.type === 'Number') text = parseFloat(text)
      otherData[column.name] = text
    })

    // make the final feature data out of otherData + the parsed locations
    return {
      ...otherData,
      uniqueId: `sv-inspector-adhoc-${rowNumber}`,
      refName: loc1.refName,
      start: loc1.start,
      end: loc1.end,
      mate: {
        refName: loc2.refName,
        start: loc2.start,
        end: loc2.end,
      },
    }
  }

  function makeAdHocSvFeatureFromTwoLocations(
    columns,
    locationColumnNumbers,
    row,
    rowNumber,
  ) {
    // use the first two locations we found (first according to *displayed* order)
    const loc1 = parseLocStringAndConvertToInterbase(
      row.cells[locationColumnNumbers[0]].text,
    )
    const loc2 = parseLocStringAndConvertToInterbase(
      row.cells[locationColumnNumbers[1]].text,
    )

    const columnsAlreadyUsedInLocations = [
      locationColumnNumbers[0],
      locationColumnNumbers[1],
    ]

    return makeAdHocFeature(
      columns,
      columnsAlreadyUsedInLocations,
      row,
      loc1,
      loc2,
      rowNumber,
    )
  }

  function makeAdHocSvFeatureFromTwoRefStartEndSets(
    columns,
    locRefColumnNumbers,
    locStartColumnNumbers,
    locEndColumnNumbers,
    row,
    rowNumber,
  ) {
    const textOf = colno => row.cells[colno].text
    const loc1 = {
      refName: textOf(locRefColumnNumbers[0]),
      start: parseInt(textOf(locStartColumnNumbers[0]), 10) - 1,
      end: parseInt(textOf(locEndColumnNumbers[0]), 10),
    }
    const loc2 = {
      refName: textOf(locRefColumnNumbers[1]),
      start: parseInt(textOf(locStartColumnNumbers[1]), 10) - 1,
      end: parseInt(textOf(locEndColumnNumbers[1]), 10),
    }
    const columnsAlreadyUsedInLocations = [
      locRefColumnNumbers[0],
      locStartColumnNumbers[0],
      locEndColumnNumbers[0],
      locRefColumnNumbers[1],
      locStartColumnNumbers[1],
      locEndColumnNumbers[1],
    ]
    return makeAdHocFeature(
      columns,
      columnsAlreadyUsedInLocations,
      row,
      loc1,
      loc2,
      rowNumber,
    )
  }

  return {
    makeAdHocSvFeatureFromTwoLocations,
    makeAdHocSvFeatureFromTwoRefStartEndSets,
  }
}
