import React from 'react'
import type PluginManager from '@jbrowse/core/PluginManager'
import type DataManagementPluginType from '@jbrowse/plugin-data-management'
import { AppRootModel } from '@jbrowse/core/util/types'
import { observer } from 'mobx-react'

interface JBrowse {
  defaultSession: {
    name: string
  }
}

function AdminComponent({ pluginManager }: { pluginManager: PluginManager }) {
  const { rootModel } = pluginManager
  const DataManagementPlugin = pluginManager.getPlugin('DataManagementPlugin')

  if (!DataManagementPlugin) {
    throw new Error('Data Management plugin must be installed')
  }

  const {
    AssemblyManager,
    SetDefaultSession,
    PluginGUI,
  } = (DataManagementPlugin as DataManagementPluginType).exports

  const {
    isAssemblyEditing,
    isDefaultSessionEditing,
    isPluginGuiEditing,
    setDefaultSessionEditing,
    setPluginGuiEditing,
    setAssemblyEditing,
    jbrowse,
  } = rootModel as AppRootModel

  return (
    <>
      <AssemblyManager
        rootModel={rootModel}
        open={isAssemblyEditing}
        onClose={() => {
          setAssemblyEditing(false)
        }}
      />
      <SetDefaultSession
        rootModel={rootModel}
        open={isDefaultSessionEditing}
        onClose={() => {
          setDefaultSessionEditing(false)
        }}
        currentDefault={(jbrowse as JBrowse).defaultSession.name}
      />
      <PluginGUI
        rootModel={rootModel}
        open={isPluginGuiEditing}
        onClose={() => {
          setPluginGuiEditing(false)
        }}
      />
    </>
  )
}

export default observer(AdminComponent)
