import { readConfObject } from '@gmod/jbrowse-core/configuration'
import { App, theme } from '@gmod/jbrowse-core/ui'
import { toUrlSafeB64 } from '@gmod/jbrowse-core/util'
import CssBaseline from '@material-ui/core/CssBaseline'
import { ThemeProvider } from '@material-ui/core/styles'
import { observer } from 'mobx-react'
import { getSnapshot, onSnapshot } from 'mobx-state-tree'
import { StringParam, useQueryParam } from 'use-query-params'
import React, { useEffect } from 'react'
import * as uuid from 'uuid'

const MAX_SESSION_SIZE_IN_URL = 100000

// adapted from https://github.com/jashkenas/underscore/blob/5d8ab5e37c9724f6f1181c5f95d0020815e4cb77/underscore.js#L894-L925
function debounce(func, wait) {
  let timeout
  let result
  const later = (...args) => {
    timeout = null
    result = func(...args)
  }
  const debounced = (...args) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      return later(...args)
    }, wait)
    return result
  }
  debounced.cancel = () => {
    clearTimeout(timeout)
    timeout = null
  }
  return debounced
}

const JBrowse = observer(({ pluginManager }) => {
  const [currSession, setSession] = useQueryParam('session', StringParam)

  const { rootModel } = pluginManager
  const { session, jbrowse, error } = rootModel || {}
  const useLocalStorage = jbrowse
    ? readConfObject(jbrowse.configuration, 'useLocalStorage')
    : false

  const useUpdateUrl = jbrowse
    ? readConfObject(jbrowse.configuration, 'useUrlSession')
    : false

  const sessString = currSession || `local:${uuid.v4()}`
  useEffect(() => {
    if (useUpdateUrl) {
      // const json = JSON.stringify(getSnapshot(session))
      // const sess =
      //   json.length < MAX_SESSION_SIZE_IN_URL ? toUrlSafeB64(json) : undefined
      setSession(sessString) // this is setting the URL
      // if you file->open session, then you switch the sessionId
    }
  }, [session, setSession, sessString, useUpdateUrl])

  useEffect(() => {
    function updateUrl(snapshot) {
      // const json = JSON.stringify(snapshot)
      // const sess =
      //   json.length < MAX_SESSION_SIZE_IN_URL ? toUrlSafeB64(json) : undefined

      setSession(sessString)
      if (rootModel && rootModel.session) {
        rootModel.jbrowse.updateSavedSession(snapshot)
      }
      // TODOSESSION will always be in localstorage
      console.log('updating-local-storage')
      localStorage.setItem(sessString, JSON.stringify(snapshot))
      if (useLocalStorage) {
        localStorage.setItem('jbrowse-web-session', JSON.stringify(snapshot))
      }
    }

    let disposer = () => {}
    if (session && useUpdateUrl) {
      const updater = debounce(updateUrl, 400)
      const snapshotDisposer = onSnapshot(session, updater)
      disposer = () => {
        snapshotDisposer()
        updater.cancel()
      }
    }
    return disposer
  }, [
    rootModel,
    setSession,
    useLocalStorage,
    useUpdateUrl,
    sessString,
    session,
  ])

  if (error) {
    throw new Error(error)
  }

  return <App session={rootModel.session} />
})

export default props => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <JBrowse {...props} />
    </ThemeProvider>
  )
}
