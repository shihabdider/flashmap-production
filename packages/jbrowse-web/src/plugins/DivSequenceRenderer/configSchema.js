import { ConfigurationSchema } from '../../configuration'

export default ConfigurationSchema('DivSequenceRenderer', {
  height: {
    type: 'number',
    description: 'height in pixels of each line of sequence',
    defaultValue: 10,
  },
})
