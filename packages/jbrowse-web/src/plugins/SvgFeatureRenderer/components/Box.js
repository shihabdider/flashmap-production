import React, { Component } from 'react'
import ReactPropTypes from 'prop-types'

import './SvgFeatureRendering.scss'

import { PropTypes as CommonPropTypes } from '../../../mst-types'
import { readConfObject } from '../../../configuration'
import { bpToPx } from '../../../util'
// import { bpToPx } from '../../../util'

// const layoutPropType = ReactPropTypes.shape({
//   getRectangles: ReactPropTypes.func.isRequired,
// })

export default class Box extends Component {
  static propTypes = {
    feature: ReactPropTypes.shape({ get: ReactPropTypes.func.isRequired })
      .isRequired,
    horizontallyFlipped: ReactPropTypes.bool,
    // bpPerPx: ReactPropTypes.number.isRequired,
    // region: CommonPropTypes.Region.isRequired,
    // config: CommonPropTypes.ConfigSchema.isRequired,
    layoutRecord: ReactPropTypes.shape({
      startPx: ReactPropTypes.number.isRequired,
      endPx: ReactPropTypes.number.isRequired,
      heightPx: ReactPropTypes.number.isRequired,
      topPx: ReactPropTypes.number.isRequired,
    }).isRequired,

    selectedFeatureId: ReactPropTypes.string,

    config: CommonPropTypes.ConfigSchema.isRequired,

    onFeatureMouseDown: ReactPropTypes.func,
    onFeatureMouseEnter: ReactPropTypes.func,
    onFeatureMouseOut: ReactPropTypes.func,
    onFeatureMouseOver: ReactPropTypes.func,
    onFeatureMouseUp: ReactPropTypes.func,
    onFeatureMouseLeave: ReactPropTypes.func,
    onFeatureMouseMove: ReactPropTypes.func,

    // synthesized from mouseup and mousedown
    onFeatureClick: ReactPropTypes.func,
  }

  static defaultProps = {
    horizontallyFlipped: false,

    selectedFeatureId: undefined,

    onFeatureMouseDown: undefined,
    onFeatureMouseEnter: undefined,
    onFeatureMouseOut: undefined,
    onFeatureMouseOver: undefined,
    onFeatureMouseUp: undefined,
    onFeatureMouseLeave: undefined,
    onFeatureMouseMove: undefined,

    onFeatureClick: undefined,
  }

  static layout(args) {
    const { feature, horizontallyFlipped, bpPerPx, region, layout } = args

    // ctx.fillRect(startPx, topPx, endPx - startPx, heightPx)
    if (horizontallyFlipped)
      throw new Error('horizontal flipping not yet implemented')

    let startPx = bpToPx(
      feature.get('start'),
      region,
      bpPerPx,
      horizontallyFlipped,
    )
    let endPx = bpToPx(feature.get('end'), region, bpPerPx, horizontallyFlipped)
    if (horizontallyFlipped) [startPx, endPx] = [endPx, startPx]
    const heightPx = readConfObject(args.config, 'height', [feature])
    if (!heightPx) debugger

    const topPx = layout.addRect(
      feature.id(),
      feature.get('start'),
      feature.get('end'),
      heightPx, // height
      feature,
    )

    return { startPx, endPx, heightPx, topPx }
  }

  onFeatureMouseDown = event => {
    const { onFeatureMouseDown: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureMouseEnter = event => {
    const { onFeatureMouseEnter: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureMouseOut = event => {
    const { onFeatureMouseOut: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureMouseOver = event => {
    const { onFeatureMouseOver: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureMouseUp = event => {
    const { onFeatureMouseUp: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureMouseLeave = event => {
    const { onFeatureMouseLeave: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureMouseMove = event => {
    const { onFeatureMouseMove: handler, feature } = this.props
    if (!handler) return undefined
    return handler(event, feature.id())
  }

  onFeatureClick = event => {
    const { onFeatureClick: handler, feature } = this.props
    if (!handler) return undefined
    event.stopPropagation()
    return handler(event, feature.id())
  }

  render() {
    const {
      feature,
      horizontallyFlipped,
      config,
      layoutRecord: { startPx, endPx, heightPx, topPx },
      selectedFeatureId,
    } = this.props

    if (horizontallyFlipped)
      throw new Error('horizontal flipping not yet implemented')

    const style = { fill: readConfObject(config, 'color1') }
    if (String(selectedFeatureId) === String(feature.id())) {
      style.fill = 'red'
    }

    return (
      <rect
        title={feature.id()}
        x={startPx}
        y={topPx}
        width={endPx - startPx}
        height={heightPx}
        style={style}
        onMouseDown={this.onFeatureMouseDown}
        onMouseEnter={this.onFeatureMouseEnter}
        onMouseOut={this.onFeatureMouseOut}
        onMouseOver={this.onFeatureMouseOver}
        onMouseUp={this.onFeatureMouseUp}
        onMouseLeave={this.onFeatureMouseLeave}
        onMouseMove={this.onFeatureMouseMove}
        onClick={this.onFeatureClick}
        onFocus={this.onFeatureMouseOver}
        onBlur={this.onFeatureMouseOut}
      />
    )
  }
}