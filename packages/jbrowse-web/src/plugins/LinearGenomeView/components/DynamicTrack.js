import React from 'react'
import { observer } from 'mobx-react'
import Track from './Track'
import TrackBlocks from './TrackBlocks'

function DynamicTrack(props) {
  const { model } = props
  return (
    <Track {...props}>
      <TrackBlocks {...props} blockState={model.blockState} />
    </Track>
  )
}

export default observer(DynamicTrack)