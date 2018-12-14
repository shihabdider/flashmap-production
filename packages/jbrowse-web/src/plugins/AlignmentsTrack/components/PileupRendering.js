import React, { Component } from 'react'
import { observer } from 'mobx-react'
import ReactPropTypes from 'prop-types'

import './PileupRendering.scss'
import PrerenderedCanvas from './PrerenderedCanvas'

import { PropTypes as CommonPropTypes } from '../../../mst-types'
import { bpToPx } from '../../../util'

function distance(x1, y1, x2, y2) {
  const dx = x1 - x2
  const dy = y1 - y2
  return Math.sqrt(dx * dx + dy * dy)
}

const layoutPropType = ReactPropTypes.shape({
  getRectangles: ReactPropTypes.func.isRequired,
})

@observer
class PileupRendering extends Component {
  static propTypes = {
    layout: layoutPropType.isRequired,
    height: ReactPropTypes.number.isRequired,
    width: ReactPropTypes.number.isRequired,
    region: CommonPropTypes.Region.isRequired,
    bpPerPx: ReactPropTypes.number.isRequired,
    horizontallyFlipped: ReactPropTypes.bool,

    trackModel: ReactPropTypes.shape({
      /** id of the currently selected feature, if any */
      selectedFeatureId: ReactPropTypes.string,
    }),

    onFeatureMouseDown: ReactPropTypes.func,
    onFeatureMouseEnter: ReactPropTypes.func,
    onFeatureMouseOut: ReactPropTypes.func,
    onFeatureMouseOver: ReactPropTypes.func,
    onFeatureMouseUp: ReactPropTypes.func,
    onFeatureMouseLeave: ReactPropTypes.func,
    onFeatureMouseMove: ReactPropTypes.func,

    // synthesized from mouseup and mousedown
    onFeatureClick: ReactPropTypes.func,

    onMouseDown: ReactPropTypes.func,
    onMouseUp: ReactPropTypes.func,
    onMouseEnter: ReactPropTypes.func,
    onMouseLeave: ReactPropTypes.func,
    onMouseOver: ReactPropTypes.func,
    onMouseOut: ReactPropTypes.func,
  }

  static defaultProps = {
    horizontallyFlipped: false,

    trackModel: {},

    onFeatureMouseDown: undefined,
    onFeatureMouseEnter: undefined,
    onFeatureMouseOut: undefined,
    onFeatureMouseOver: undefined,
    onFeatureMouseUp: undefined,
    onFeatureMouseLeave: undefined,
    onFeatureMouseMove: undefined,

    onFeatureClick: undefined,

    onMouseDown: undefined,
    onMouseUp: undefined,
    onMouseEnter: undefined,
    onMouseLeave: undefined,
    onMouseOver: undefined,
    onMouseOut: undefined,
  }

  constructor(props) {
    super(props)
    this.highlightOverlayCanvas = React.createRef()
  }

  componentDidMount() {
    this.updateSelectionHighlight()
  }

  componentDidUpdate() {
    this.updateSelectionHighlight()
  }

  onMouseDown = event => {
    this.callMouseHandler('MouseDown', event)
    if (this.featureUnderMouse) {
      this.lastFeatureMouseDown = {
        featureId: this.featureUnderMouse,
        x: event.clientX,
        y: event.clientY,
      }
    } else {
      this.lastFeatureMouseDown = undefined
    }
  }

  onMouseEnter = event => {
    this.callMouseHandler('MouseEnter', event)
  }

  onMouseOut = event => {
    this.callMouseHandler('MouseOut', event)
    this.callMouseHandler('MouseLeave', event)
    this.featureUnderMouse = undefined
  }

  onMouseOver = event => {
    this.callMouseHandler('MouseOver', event)
  }

  onMouseUp = event => {
    this.callMouseHandler('MouseUp', event)

    // synthesize a featureClick event if we are on a feature
    // and it's close to the last mouse down
    if (this.featureUnderMouse && this.lastFeatureMouseDown) {
      const { featureId, x, y } = this.lastFeatureMouseDown
      const { clientX, clientY } = event
      if (
        this.featureUnderMouse === featureId &&
        distance(x, y, clientX, clientY) <= 2
      ) {
        this.callMouseHandler('Click', event)
        this.lastFeatureMouseDown = undefined
      }
    }
  }

  onMouseLeave = event => {
    this.callMouseHandler('MouseOut', event)
    this.callMouseHandler('MouseLeave', event)
    this.featureUnderMouse = undefined
  }

  onMouseMove = event => {
    const featureIdCurrentlyUnderMouse = this.findFeatureIdUnderMouse(event)
    if (this.featureUnderMouse === featureIdCurrentlyUnderMouse) {
      this.callMouseHandler('MouseMove', event)
    } else {
      if (this.featureUnderMouse) {
        this.callMouseHandler('MouseOut', event)
        this.callMouseHandler('MouseLeave', event)
      }
      this.featureUnderMouse = featureIdCurrentlyUnderMouse
      this.callMouseHandler('MouseOver', event)
      this.callMouseHandler('MouseEnter', event)
    }
  }

  updateSelectionHighlight() {
    const {
      trackModel,
      region,
      bpPerPx,
      layout,
      horizontallyFlipped,
    } = this.props
    const { selectedFeatureId } = trackModel

    const canvas = this.highlightOverlayCanvas.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (selectedFeatureId) {
      for (const [
        id,
        [leftBp, topPx, rightBp, bottomPx],
      ] of layout.getRectangles()) {
        if (id === selectedFeatureId) {
          const leftPx = bpToPx(leftBp, region, bpPerPx, horizontallyFlipped)
          const rightPx = bpToPx(rightBp, region, bpPerPx, horizontallyFlipped)
          ctx.fillStyle = 'rgba(0,0,0,0.5)'
          ctx.fillRect(leftPx, topPx, rightPx - leftPx, bottomPx - topPx)
          return
        }
      }
    }
  }

  findFeatureIdUnderMouse(event) {
    const { offsetX, offsetY } = event.nativeEvent
    if (!(offsetX >= 0))
      throw new Error(
        'invalid offsetX, does this browser provide offsetX and offsetY on mouse events?',
      )

    const { layout, bpPerPx, region, horizontallyFlipped } = this.props
    for (const [
      id,
      [leftBp, topPx, rightBp, bottomPx],
    ] of layout.getRectangles()) {
      let leftPx = bpToPx(leftBp, region, bpPerPx, horizontallyFlipped)
      let rightPx = bpToPx(rightBp, region, bpPerPx, horizontallyFlipped)
      if (horizontallyFlipped) {
        ;[leftPx, rightPx] = [rightPx, leftPx]
      }
      if (
        offsetX >= leftPx &&
        offsetX <= rightPx &&
        offsetY >= topPx &&
        offsetY <= bottomPx
      ) {
        return id
      }
    }

    return undefined
  }

  /**
   * @param {string} handlerName
   * @param {*} event - the actual mouse event
   * @param {bool} always - call this handler even if there is no feature
   */
  callMouseHandler(handlerName, event, always = false) {
    // eslint-disable-next-line react/destructuring-assignment
    const featureHandler = this.props[`onFeature${handlerName}`]
    // eslint-disable-next-line react/destructuring-assignment
    const canvasHandler = this.props[`on${handlerName}`]
    if (featureHandler && (always || this.featureUnderMouse)) {
      featureHandler(event, this.featureUnderMouse)
    } else if (canvasHandler) {
      canvasHandler(event, this.featureUnderMouse)
    }
  }

  render() {
    const { width, height } = this.props

    // need to call this in render so we get the right observer behavior
    this.updateSelectionHighlight()
    return (
      <div className="PileupRendering" style={{ position: 'relative' }}>
        <PrerenderedCanvas {...this.props} />
        <canvas
          width={width}
          height={height}
          style={{ position: 'absolute', left: 0, top: 0 }}
          className="highlightOverlayCanvas"
          ref={this.highlightOverlayCanvas}
          onMouseDown={this.onMouseDown}
          onMouseEnter={this.onMouseEnter}
          onMouseOut={this.onMouseOut}
          onMouseOver={this.onMouseOver}
          onMouseUp={this.onMouseUp}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
          onFocus={() => {}}
          onBlur={() => {}}
        />
      </div>
    )
  }
}
export default PileupRendering