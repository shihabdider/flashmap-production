/* eslint-disable react/prop-types */
import React from 'react'
import { observer } from 'mobx-react'

function ServerSideRenderedContent(props) {
  const { model } = props
  const { data, renderProps, renderingComponent: RenderingComponent } = model

  return model.filled ? (
    <RenderingComponent {...data} {...renderProps} />
  ) : (
    <p>Loading</p>
  )
}

export default observer(ServerSideRenderedContent)
