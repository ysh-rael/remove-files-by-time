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

    if (typeof except != 'object') except = [except]

    const [salveThis, removeTheseIndex, result] = [[], [], []]
    let dateComplete = []

    { // alimenta as variáveis
        files.forEach(file => {
            const date = new Date(fs.statSync(file).birthtimeMs)
            dateComplete.push(date) // alimenta array com datas usadas para controlar o 'keepHowMany' 
            result.push({ file, date }) // criar array com objeto final com arquivo e data.
        })
    }

    {   // "remove as excessões da contagem"
        result.forEach((e, i) => except.forEach(_except => { if (_except == e.file) removeTheseIndex.push(i) && console.log("This file is except and d'not exclued: ", e.file) }))
        removeTheseIndex.forEach(e => result.splice(e, 1) && dateComplete.splice(e, 1))
    }

    {
        dateComplete = dateComplete.reverse() //Ordena do mais atual ao mais antigo
        if (keepHowMany > 0) { let i = 0; while (i < keepHowMany) salveThis.push(dateComplete[i]) && i++ } // keepHowMany
    }

    {
        result.forEach(result => { // executa a exclusão dos arquivos
            const keep = salveThis.includes(result.date)
            if (keep) console.log("is keep this: ", result.file)

            if (!keep && executeDelete) fs.rmSync(result.file)
            else if (!keep) console.log('This file will be deleted: ', result.file)
        })
    }

    return result
}

treatFiles({
    files: getAllFilesOfAllDir(__dirname),
    executeDelete: true,
    keepHowMany: 1,
    except: [__dirname + '/index.js']
})
