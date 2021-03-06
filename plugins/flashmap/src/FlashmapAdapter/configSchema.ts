import { ConfigurationSchema } from '@jbrowse/core/configuration'

export const BigsiHitsSchema = ConfigurationSchema(
  'BigsiHitsAdapter',
  {
    rawHits: {
      type: 'frozen',
      defaultValue: [],
    },
    bigsiBucketMapPath: {
      type: 'string',
      description: 'file path to bigsi bucket map',
      defaultValue: '',
    },
    querySeq: {
      type: 'string',
      description: 'the query sequence',
      defaultValue: '',
    },
    viewWindow: {
      type: 'frozen',
      description:
        'an object containing ref name and start/end coords of current view window',
      defaultValue: {},
    },
    featureClass: {
      type: 'string',
      defaultValue: 'SimpleFeature',
    },
  },
  { explicitlyTyped: true },
)

export const MashmapHitsConfigSchema = ConfigurationSchema(
  'MashmapHitsConfigAdapter',
  {
    rawHits: {
      type: 'frozen',
      defaultValue: '',
    },
    assemblyNames: {
      type: 'stringArray',
      defaultValue: [],
    },
    featureClass: {
      type: 'string',
      defaultValue: 'SimpleFeature',
    },
  },
  { explicitlyTyped: true },
)

export const MashmapOutputSchema = ConfigurationSchema(
  'MashmapOutputAdapter',
  {
    assemblyNames: {
      type: 'stringArray',
      defaultValue: [],
    },
    outLocation: {
      type: 'fileLocation',
      defaultValue: { uri: '/path/to/file.out' },
    },
  },
  { explicitlyTyped: true },
)

export const regionsConfigSchema = ConfigurationSchema(
  'FromConfigRegionsAdapter',
  {
    features: {
      type: 'frozen',
      defaultValue: [],
    },
    featureClass: {
      type: 'string',
      defaultValue: 'SimpleFeature',
    },
  },
  { explicitlyTyped: true },
)

export const sequenceConfigSchema = ConfigurationSchema(
  'FromConfigSequenceAdapter',
  {
    features: {
      type: 'frozen',
      defaultValue: [],
    },
    featureClass: {
      type: 'string',
      defaultValue: 'SimpleFeature',
    },
  },
  { explicitlyTyped: true },
)
