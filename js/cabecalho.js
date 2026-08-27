/*========================================================
cabecalho.js

Atualização das informações do cabeçalho.
========================================================*/
function atualizarCabecalho(dados) {

    //----------------------------------------
    // Último dado disponível (Vem do JSON)
    //----------------------------------------
    const elProcessamento = document.getElementById("dtProcessamento");
    if (elProcessamento) {
        elProcessamento.textContent = dados?.ultimaAtualizacao ?? "--";
    }

    //----------------------------------------
    // Atualização da página (Horário local do navegador)
    //----------------------------------------
    const elAtualizacao = document.getElementById("dtAtualizacaoPagina");
    if (elAtualizacao) {
        elAtualizacao.textContent = formatarDataHora(new Date()) ?? "--";
    }
}


function iniciarRelogio(){
    atualizarRelogio();
    setInterval(atualizarRelogio,1000);

}

function atualizarRelogio(){
    document.getElementById("relogioAtual").textContent = formatarDataHora(new Date());
}