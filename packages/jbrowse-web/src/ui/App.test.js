import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import JBrowse from '../JBrowse'
import RootModelFactory from '../RootModelFactory'
import snap1 from '../../test/root.snap.1.json'
import LinearGenomeView from '../plugins/LinearGenomeView/LinearGenomeView'
import LinearGenomeViewModel from '../plugins/LinearGenomeView/model'

const viewTypes = {
  linear: { ReactComponent: LinearGenomeView, mstModel: LinearGenomeViewModel },
}
function getViewType(name) {
  return viewTypes[name]
}
describe('jbrowse-web app', () => {
  it('renders an empty model without crashing', () => {
    const div = document.createElement('div')
    const model = RootModelFactory({ viewTypes }).create({})
    ReactDOM.render(<App getViewType={getViewType} rootModel={model} />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
  it('renders a couple of linear views without crashing', () => {
    const div = document.createElement('div')
    const model = RootModelFactory({ viewTypes }).create(snap1)
    ReactDOM.render(<App getViewType={getViewType} rootModel={model} />, div)
    ReactDOM.unmountComponentAtNode(div)
  })
})