/*========================================================
api.js

Comunicação com o JSON do dashboard.
========================================================*/

async function carregarDados() {

    const resposta = await fetch(
        `dados/dados.json?t=${Date.now()}`
    );

    return await resposta.json();
}