// Need node >= v16
const fs = require('fs')
function getAllFilesOfAllDir(req, res, next) {
    const salveOut = [] // variável que armazenará todos os arquivos de fora

    function getAllFilesOfDir(_path) {
        const readDirectories = fs.readdirSync(_path) // ler diretórios atuais

        readDirectories.forEach(nameOfThis => { // para cada item contido dentro desse diretório, faça...
            stat = fs.statSync(`${_path}/${nameOfThis}`) // pegar as info dele
            if (stat.isDirectory()) getAllFilesOfDir(`${_path}/${nameOfThis}`) // se for um diretório, a função chama ela mesmo passando o caminho atual
            else salveOut.push(`${_path}/${nameOfThis}`) // se for arquivo envia para a variável fora da função
        })
    }

    getAllFilesOfDir(req)
    return salveOut
}

function treatFiles({ files, keepHowMany, executeDelete, except }) {
    // files: array com arquivos
    // keepHowMany: quantidade mínima de arquivos que deve ser deixados
    // executeDelete: executa a exclusão dos dados
    // retorno da função: Todos arquivos encontrados na busca.

    const [salveThis, result] = [[], []]
    let dateComplete = []

    files.forEach(file => {
        const date = new Date(fs.statSync(file).birthtimeMs)
        dateComplete.push(date)
        result.push({ file, date })
    })

    result.forEach((e, i) => { 
        if (except.includes(e.file)) {
            console.log("This file is except and d'not exclued: ", e.file)
            result.splice(i, 1) 
            dateComplete.splice(i, 1)
        }
    })

    dateComplete = dateComplete.reverse()
    if (keepHowMany > 0) { let i = 0; while (i < keepHowMany) salveThis.push(dateComplete[i]) && i++ }

    result.forEach(result => {
        const keep = salveThis.includes(result.date)
        if (keep) console.log("is keep this: ", result.file)

        if (!keep && executeDelete) fs.rmSync(result.file)
        else if (!keep) console.log('This file will be deleted: ', result.file)
    })

    return result // do mais atual ao mais antigo
}

treatFiles({
    files: getAllFilesOfAllDir(__dirname),
    executeDelete: true,
    keepHowMany: 1,
    except: [__dirname+'/index.js']
})
