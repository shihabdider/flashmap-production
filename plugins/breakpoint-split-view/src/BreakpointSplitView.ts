import { Feature } from '@jbrowse/core/util/simpleFeature'
import { getSession } from '@jbrowse/core/util'
import PluginManager from '@jbrowse/core/PluginManager'
import ViewType from '@jbrowse/core/pluggableElementTypes/ViewType'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import { Assembly } from '@jbrowse/core/assemblyManager/assembly'
import BreakpointSplitViewComponent from './components/BreakpointSplitView'
import BreakpointSplitViewModel from './model'

class BreakpointSplitViewType extends ViewType {
  snapshotFromBreakendFeature(feature: Feature, view: LinearGenomeViewModel) {
    const breakendSpecification = (feature.get('ALT') || [])[0]
    const startPos = feature.get('start')
    let endPos
    const bpPerPx = 10

    // TODO: Figure this out for multiple assembly names
    const { assemblyName } = view.displayedRegions[0]
    const { assemblyManager } = getSession(view)
    const assembly = assemblyManager.get(assemblyName)

    if (!assembly) {
      throw new Error(`assembly ${assemblyName} not found`)
    }
    if (!assembly.regions) {
      throw new Error(`assembly ${assemblyName} regions not loaded`)
    }
    const { getCanonicalRefName } = assembly as Assembly
    const featureRefName = getCanonicalRefName(feature.get('refName'))
    const topRegion = assembly.regions.find(
      f => f.refName === String(featureRefName),
    )

    let mateRefName: string | undefined
    let startMod = 0
    let endMod = 0

    if (breakendSpecification) {
      // a VCF breakend feature
      if (breakendSpecification === '<TRA>') {
        const INFO = feature.get('INFO') || []
        endPos = INFO.END[0] - 1
        mateRefName = getCanonicalRefName(INFO.CHR2[0])
      } else {
        const matePosition = breakendSpecification.MatePosition.split(':')
        endPos = parseInt(matePosition[1], 10) - 1
        mateRefName = getCanonicalRefName(matePosition[0])
        if (breakendSpecification.Join === 'left') startMod = -1
        if (breakendSpecification.MateDirection === 'left') endMod = -1
      }

      // if (breakendSpecification.Join === 'left') {
      // marker -1, else 0

      // if (breakendSpecification.MateDirection === 'left') {
      // marker -1, else 0
    } else if (feature.get('mate')) {
      // a generic 'mate' feature
      const mate = feature.get('mate')
      mateRefName = getCanonicalRefName(mate.refName)
      endPos = mate.start
    }

    if (!mateRefName) {
      console.warn(
        `unable to resolve mate refName ${mateRefName} in reference genome`,
      )
      return {}
    }

    const bottomRegion = assembly.regions.find(
      f => f.refName === String(mateRefName),
    )

    if (!topRegion || !bottomRegion) {
      console.warn(
        `unable to find the refName for the top or bottom of the breakpoint view`,
      )
      return {}
    }

    const topMarkedRegion = [{ ...topRegion }, { ...topRegion }]
    const bottomMarkedRegion = [{ ...bottomRegion }, { ...bottomRegion }]
    topMarkedRegion[0].end = startPos + startMod
    topMarkedRegion[1].start = startPos + startMod
    bottomMarkedRegion[0].end = endPos + endMod
    bottomMarkedRegion[1].start = endPos + endMod
    const snapshot = {
      type: 'BreakpointSplitView',
      views: [
        {
          type: 'LinearGenomeView',
          displayedRegions: topMarkedRegion,
          hideHeader: true,
          bpPerPx,
          offsetPx: (topRegion.start + feature.get('start')) / bpPerPx,
        },
        {
          type: 'LinearGenomeView',
          displayedRegions: bottomMarkedRegion,
          hideHeader: true,
          bpPerPx,
          offsetPx: (bottomRegion.start + endPos) / bpPerPx,
        },
      ],
      displayName: `${
        feature.get('name') || feature.get('id') || 'breakend'
      } split detail`,
    }
    return snapshot
  }
}

export default (pluginManager: PluginManager) => {
  const { load } = pluginManager

  const ReactComponent = load(BreakpointSplitViewComponent)
  const { stateModel } = load(BreakpointSplitViewModel)

  return new BreakpointSplitViewType({
    name: 'BreakpointSplitView',
    stateModel,
    ReactComponent,
  })
}
