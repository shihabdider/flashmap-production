import { FatalErrorDialog } from '@jbrowse/core/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import { ErrorBoundary } from 'react-error-boundary'
import 'fontsource-roboto'
import factoryReset from './factoryReset'
import Loader from './Loader'

const initialTimestamp = Date.now()

console.log('here')
if (window && window.name.startsWith('JBrowseAuthWindow')) {
  const parent = window.opener
  if (parent) {
    parent.postMessage({
      name: window.name,
      redirectUri: window.location.href,
    })
  }
  window.close()
}

const PlatformSpecificFatalErrorDialog = props => {
  return <FatalErrorDialog onFactoryReset={factoryReset} {...props} />
}

ReactDOM.render(
  <ErrorBoundary FallbackComponent={PlatformSpecificFatalErrorDialog}>
    <Loader initialTimestamp={initialTimestamp} />
  </ErrorBoundary>,
  document.getElementById('root'),
)
