/*========================================================
Projeto: Dados em Tempo Real
Arquivo: main.js

Responsável por:
- Inicialização do dashboard
========================================================*/

/*--------------------------------------------------------------------------------------------------------------------*/
/*Variáveis Globais*/
let dadosDashboard = null;
let graficoFiltrado = [];
let horasFiltro = 27; //abrir site com valor padrão para o gráfico
let horarioSelecionado = null;
let AMOSTRAS_POR_HORA = 30; //questão que o V_HIST_ATENDIMENTO_REGIONAL é um dado a cada dois minutos
let ignorarClique = false; //usado no grafico.js para o comportamento de duplo clique
let atualizando = false; //usado para verificar se o sql ainda está rodando

/*--------------------------------------------------------------------------------------------------------------------*/
iniciarRelogio(); //mostrar hora na página
document.addEventListener("DOMContentLoaded", iniciarDashboard);

async function iniciarDashboard() {
    try {
        dadosDashboard = await carregarDados();
        atualizarCabecalho(dadosDashboard);
        atualizarFiltros(dadosDashboard.filtros.agencias);
        configurarFiltroHoras();
        atualizarDashboard(); //atualiza a tela pela primeira vez
        setInterval(buscarNovosDados, 60000);
    }
    catch (erro) {
        console.error("Erro na inicialização do Dashboard:", erro);
    }
}

/*--------------------------------------------------------------------------------------------------------------------*/
/* Função para carregar e descompactar o arquivo .json.gz */
async function carregarDados() {
    // Adiciona timestamp para impedir que o navegador salve o JSON em cache
    const url = 'dados/dados.json.gz?t=' + new Date().getTime();

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Erro ao buscar dados do GitHub. Status: ${response.status}`);
    }

    // Descompacta o fluxo GZIP em memória
    const ds = new DecompressionStream('gzip');
    const decompressedStream = response.body.pipeThrough(ds);
    const jsonText = await new Response(decompressedStream).text();

    return JSON.parse(jsonText);
}

/*--------------------------------------------------------------------------------------------------------------------*/
/* Função exclusiva para chamar a API no background */
async function buscarNovosDados() {
    if (atualizando) return; // Trava de segurança
    atualizando = true;

    try {
        dadosDashboard = await carregarDados(); // Puxa dados frescos e descompacta
        atualizarCabecalho(dadosDashboard);

        // Após baixar os novos dados, manda atualizar os gráficos/tabelas
        atualizarDashboard();
    }
    catch (erro) {
        console.error("Erro ao buscar novos dados:", erro);
    }
    finally {
        atualizando = false;
    }
}

/*--------------------------------------------------------------------------------------------------------------------*/
/* Função exclusiva para redesenhar a tela (Rápida, não chama API) */
async function atualizarDashboard(){

    // Se não houver dados ainda, aborta
    if (!dadosDashboard) return;

    const agencias = obterAgenciasSelecionadas();
    graficoFiltrado = filtrarGrafico(dadosDashboard.grafico, agencias);
    const dadosPeriodo = filtrarUltimasHoras(graficoFiltrado, horasFiltro);
    const dadosTabela = montarTabela(graficoFiltrado, horarioSelecionado);

    // Atualizar data no cabeçalho da tabela
    const horarioTabela = horarioSelecionado ?? dadosTabela[0]?.DT_PROCESSAMENTO;
    atualizarTituloTabela(horarioTabela);

    // Chama as funções visuais
    atualizarTabela(dadosTabela);
    atualizarGrafico(dadosPeriodo, horasFiltro);
    atualizarKPIs(dadosPeriodo, dadosDashboard.kpis.celesc);
}

/*--------------------------------------------------------------------------------------------------------------------*/
function filtrarGrafico(
    linhas,
    agenciasSelecionadas){

        if(agenciasSelecionadas.length === 0)
            return [];

        return linhas.filter(linha =>
            agenciasSelecionadas.includes(
                linha.NM_AGENCIA
            )
        );
    }

/*--------------------------------------------------------------------------------------------------------------------*/
function montarTabela(linhas, horario = null){

    if(linhas.length === 0)
        return [];

    //----------------------------------------------------
    // Descobre o horário mais recente
    //----------------------------------------------------
    const horarioTabela = horario ??

    linhas.reduce((maior, linha)=>
            linha.DT_PROCESSAMENTO > maior
                ? linha.DT_PROCESSAMENTO
                : maior,
        linhas[0].DT_PROCESSAMENTO
    );

    //----------------------------------------------------
    // Mantém somente aquele horário
    //----------------------------------------------------
    const tabela =
        linhas.filter(linha =>
            linha.DT_PROCESSAMENTO === horarioTabela
        );

    //----------------------------------------------------
    // Ordena por quantidade total
    //----------------------------------------------------
    tabela.sort((a,b)=>

        b.QT_TOTAL - a.QT_TOTAL

    );

    return tabela;
}

/*--------------------------------------------------------------------------------------------------------------------*/
function configurarFiltroHoras(){

    const input =
        document.getElementById("inputHoras");

    function atualizar(){

        horasFiltro =
            Number(input.value) || 27;

        atualizarDashboard();

    }

    input.addEventListener("keydown", e=>{
        if(e.key==="Enter")
            atualizar();
    });

    input.addEventListener("change", atualizar);

}