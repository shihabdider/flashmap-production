import createModule from './mashmap_module.js'

function processMashmapResults(results){
    console.log(results.split(' '))
}

async function main(ref, query, percIdentity){
    const Module = await createModule()
    Module.FS.writeFile('ref.fa', ref)
    Module.FS.writeFile('query.fa', query)
    Module.callMain(['-r', 'ref.fa', '-q', 'query.fa', '-o', 'test.out', '-t', '1', '--pi', percIdentity, '-s', '1000'])
    const output = Module.FS.readFile('test.out', { encoding: 'utf8' })
    return output
}

export default main
