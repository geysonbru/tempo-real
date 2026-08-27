/*========================================================
tabela.js

OBS: ?? 0 siginfica que ignora campos nulos
========================================================*/

function atualizarTabela(linhas){

    const tbody =
        document.querySelector("#tabelaAgencias tbody");
    tbody.innerHTML = "";

    /*Calculando totais*/
    const totais = {
        NM_AGENCIA: "TOTAL",
        QT_UC_SENERGIA_ACIDENTAL: linhas.reduce((t, linhas) => t + (linhas.QT_UC_SENERGIA_ACIDENTAL || 0),0),
        QT_UC_SENERGIA_PROGRAMADA: linhas.reduce((t, linhas) => t + (linhas.QT_UC_SENERGIA_PROGRAMADA || 0),0),
        QT_UC_SENERGIA_POSSIVEL: linhas.reduce((t, linhas) => t + (linhas.QT_UC_SENERGIA_POSSIVEL || 0),0),
        QT_TOTAL: linhas.reduce((t, linhas) => t + (linhas.QT_TOTAL || 0),0)
        };

    /*Solicitando para imprimir valores na tabela*/
    linhas.forEach(linha => inserirLinha(tbody, linha));
    inserirLinha(tbody, totais, "linha-total");
}

/*--------------------------------------------------------------------------------------------------------------------*/
function inserirLinha(tbody, linha, classe = ""){

    tbody.insertAdjacentHTML(
        "beforeend",
        `
        <tr class="${classe}">
            <td>${linha.NM_AGENCIA}</td>
            <td>${formatarNumero(linha.QT_UC_SENERGIA_ACIDENTAL)}</td>
            <td>${formatarNumero(linha.QT_UC_SENERGIA_PROGRAMADA)}</td>
            <td>${formatarNumero(linha.QT_UC_SENERGIA_POSSIVEL)}</td>
            <td>${formatarNumero(linha.QT_TOTAL)}</td>
        </tr>
        `
    );

}

/*--------------------------------------------------------------------------------------------------------------------*/
/*Atualiza o título da tabela*/
function atualizarTituloTabela(dataHora){

    const titulo = document.getElementById("tituloTabela");
    //console.log(dataHora)
    dataHora = formatarDataHora(dataHora)

    titulo.textContent =
        `Tabela - ${dataHora}`;

}