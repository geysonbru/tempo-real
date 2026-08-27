/*========================================================
utils.js
Funções reutilizáveis
========================================================*/

function formatarNumero(valor) {
    if (valor == null) return "-";
    return Number(valor).toLocaleString("pt-BR");
}

function formatarDecimal(valor, casas = 2) {
    if (valor == null) return "-";
    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas
    });
}

function formatarDataHora(data){
    return new Date(data).toLocaleString("pt-BR").replace(",", ""); //replace para tirar a vígula chata que aparece sozinha
}

function formatarHora(data){
    return data.toLocaleTimeString("pt-BR",
        {
            hour:"2-digit",
            minute:"2-digit",
            second:"2-digit"
        }
    );
}


//----------------------------------------------------
// Descobre o horário mais recente
//----------------------------------------------------
function calcularUltimoHorario(linhas){

    if (!linhas || linhas.leghtn === 0){
        return null;
    }

    const ultimo = linhas.reduce((maior, linha) =>
            linha?.DT_PROCESSAMENTO > maior
                ? linha.DT_PROCESSAMENTO
                : maior,
        linhas[0]?.DT_PROCESSAMENTO
    );
    //console.log(ultimo)
    return ultimo
}