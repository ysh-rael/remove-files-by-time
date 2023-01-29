// Need node >= v16
const fs = require('fs')
function getAllFilesOfAllDir(req, res, next) {
    const salveOut = [] // variável que armazenará todos os arquivos de fora

    function getAllFilesOfDir(_path) {
        const readDirectories = fs.readdirSync(_path) // ler diretórios atuais

        readDirectories.forEach(nameOfThis => { // para cada item contido dentro desse diretório, faça...
            stat = fs.statSync(`${_path}/${nameOfThis}`) // pegar as info dele.
            if (stat.isDirectory()) getAllFilesOfDir(`${_path}/${nameOfThis}`) // se for um diretório, a função chama ela mesmo passando o caminho atual.
            else salveOut.push(`${_path}/${nameOfThis}`) // se for arquivo envia para a variável fora da função.
        })
    }

    getAllFilesOfDir(req)
    return salveOut
}

function deleteFiles({ files, keepHowMany, executeDelete, except }) {
    // files: Array com caminho dos arquivos.
    // keepHowMany: Quantidade mínima de arquivos que deve ser deixados.
    // executeDelete: Executa a exclusão dos dados.
    // except: auto explicativo. arquivos que serão desconsiderados.
    // retorno da função: Todos arquivos encontrados na busca ou 'false' em caso de erro.

    if (!files) return false //função fica sem sentido sem arquivos para ler, não é mesmo?

    if (typeof except != 'object') except = [except] // tendencioso a erro dependendo do tipo recebido(erro será tratado com 'catch').

    const [salveThis, removeTheseIndex, result] = [[], [], []]
    let dateComplete = []

    { // alimenta as variáveis
        files.forEach(file => {
            const date = new Date(fs.statSync(file).birthtimeMs)
            dateComplete.push(date) // alimenta array com datas usadas para controlar o 'keepHowMany' 
            result.push({ file, date }) // criar array com objeto final com arquivo e data.
        })
    }

    try {   // "remove as excessões da contagem"
        result.forEach((e, i) => except.forEach(_except => { if (_except == e.file) removeTheseIndex.push(i) && console.log("This file is except and d'not exclued: ", e.file) }))
        removeTheseIndex.forEach(e => result.splice(e, 1) && dateComplete.splice(e, 1))
    } catch (err) { console.log('Err - except invalid: ', err); return false }

    {       // keepHowMany
        if (typeof keepHowMany !== 'number' || keepHowMany < 0) keepHowMany = -1
        keepHowMany = parseInt(keepHowMany)
        dateComplete = dateComplete.reverse() //Ordena do mais atual ao mais antigo
        if (keepHowMany > 0) { let i = 0; while (i < keepHowMany) salveThis.push(dateComplete[i]) && i++ }
    }

    {      // executa a exclusão dos arquivos
        result.forEach(result => { 
            const keep = salveThis.includes(result.date)
            if (keep) console.log("is keep this: ", result.file)

            if (!keep && executeDelete) fs.rmSync(result.file)
            else if (!keep) console.log('This file will be deleted: ', result.file)
        })
    }

    return result
}

deleteFiles({
    files: getAllFilesOfAllDir(__dirname),
    executeDelete: true,
    keepHowMany: 1,
    except: [__dirname + '/index.js']
})
