/*========================================================
grafico.js

Responsável por:
- Montar gráfico histórico de UCs sem energia
- Exibir:
    - Programada
    - Acidental
    - Possível
========================================================*/


/*========================================================
Função principal

Responsável por:
- Receber os dados do JSON
- Preparar os dados
- Desenhar o gráfico
========================================================*/
const DEBUG_GRAFICO = false; //Trocando para true ele apresentará as mensagens de console.log

function atualizarGrafico(linhas, horas = 27) {

    if(DEBUG_GRAFICO) console.log("1 - atualizarGrafico");

    if (!linhas || linhas.length === 0) {
        console.warn("Sem dados para gráfico");
        return;
    }

    // Mantém apenas o período desejado
    linhas = filtrarUltimasHoras(linhas, horas);
    if(DEBUG_GRAFICO) console.log("2 - linhas filtradas:", linhas.length);

    // Soma os valores de todas as agências para cada instante
    const serie = agruparPorHorario(linhas);
    if(DEBUG_GRAFICO) console.log("3 - série:", serie.length);
    if(DEBUG_GRAFICO) console.log(serie[0]);

    // Desenha o gráfico
    desenharGrafico(serie)
}


/*========================================================
Agrupa os registros por horário

Objetivo:
- Cada horário possuirá apenas um registro.
- Soma todas as agências daquele horário.

Exemplo

08:00
Florianópolis = 120
Joinville     = 80
Blumenau      = 50

Resultado

08:00 = 250
========================================================*/
function agruparPorHorario(linhas){
    const mapa = new Map();
    linhas.forEach(linha => {
        const chave = linha.DT_PROCESSAMENTO;
        if(!mapa.has(chave)){
            mapa.set(chave,{
                DT_PROCESSAMENTO: chave,
                ACIDENTAL: 0,
                PROGRAMADA: 0,
                POSSIVEL: 0,
                TOTAL: 0,
                MAIOR_AGENCIA: "",
                MAIOR_VALOR: 0
            });
        }
        const registro = mapa.get(chave);
        registro.ACIDENTAL += linha.QT_UC_SENERGIA_ACIDENTAL || 0;
        registro.PROGRAMADA += linha.QT_UC_SENERGIA_PROGRAMADA || 0;
        registro.POSSIVEL += linha.QT_UC_SENERGIA_POSSIVEL || 0;

        const totalAgencia =
                (linha.QT_UC_SENERGIA_ACIDENTAL || 0) +
                (linha.QT_UC_SENERGIA_PROGRAMADA || 0) +
                (linha.QT_UC_SENERGIA_POSSIVEL || 0)

        if(totalAgencia > registro.MAIOR_VALOR){
            registro.MAIOR_VALOR = totalAgencia;
            registro.MAIOR_AGENCIA = linha.NM_AGENCIA;
            }
    });

    mapa.forEach(registro => {
        registro.TOTAL =
            registro.ACIDENTAL +
            registro.PROGRAMADA +
            registro.POSSIVEL;
        });

    return [...mapa.values()];

}


/*========================================================
Desenha o gráfico utilizando Plotly
========================================================*/
function desenharGrafico(serie){

    if(DEBUG_GRAFICO) console.log("4 - desenhando");

    const x = serie.map(item =>
        new Date(item.DT_PROCESSAMENTO.replace(" ","T"))
    );

    if(DEBUG_GRAFICO) console.log("Primeira data:", x[0]);
    if(DEBUG_GRAFICO) console.log("Última data:", x[x.length - 1]);

    const traces = [
        {
            x: x,
            y: serie.map(item => item.PROGRAMADA),
            name: "Programada",
            mode: "lines",
            stackgroup: "energia",
            line:{color: "rgb(136,144,206)", width: 3},
            customdata: serie.map(item => [
                item.TOTAL,
                item.MAIOR_AGENCIA,
                item.MAIOR_VALOR,
                formatarNumero(item.PROGRAMADA)
            ]),
            hovertemplate: "<b>%{fullData.name}</b>: %{customdata[3]}<extra></extra>"
        },

        {
            x: x,
            y: serie.map(item => item.ACIDENTAL),
            name: "Acidental",
            mode: "lines",
            stackgroup: "energia",
            line:{color: "rgb(135,197,254)", width: 3},
            customdata: serie.map(item => [
                item.TOTAL,
                item.MAIOR_AGENCIA,
                item.MAIOR_VALOR,
                formatarNumero(item.ACIDENTAL)
            ]),
            hovertemplate: "<b>%{fullData.name}</b>: %{customdata[3]}<extra></extra>"
        },

        {
            x: x,
            y: serie.map(item => item.POSSIVEL),
            name: "Possível",
            mode: "lines",
            stackgroup: "energia",
            line:{color: "rgb(242,180,155)", width: 3},
            customdata: serie.map(item => [
                item.TOTAL,
                item.MAIOR_AGENCIA,
                item.MAIOR_VALOR,
                formatarNumero(item.POSSIVEL)
            ]),
            hovertemplate: "<b>%{fullData.name}</b>: %{customdata[3]}<extra></extra>"
        },

        //Linha invisível, será usado para colocar dados no tooltip
        {
            x: x,

            // pode ser zero ou null
            //y: serie.map(() => 0),
            //colocarei total para poder colocar valor no gráfico
            y: serie.map(item => item.TOTAL),

            name: "",
            mode: "text",
            //text: serie.map(item => formatarNumero(item.TOTAL)), //mostra TODOS os dados
            text: serie.map(item => {
                const d = new Date(item.DT_PROCESSAMENTO.replace(" ", "T"));

                return d.getMinutes() %40 === 0
                    ? formatarNumero(item.TOTAL)
                    : "";
            }),

            /*line: {
                width: 0
                },
            opacity: 0,
            showlegend: false,*/

            textposition: "top center",
            textfont: {
                size: 12,
                color: "rgb(40,40,40)"
            },

            hovertemplate:
                "<b>Total:</b> %{customdata[0]:,}<br>" +
                "<b>Maior Regional:</b> %{customdata[1]} (%{customdata[2]:,})" +
                "<br><extra></extra>",
            customdata: serie.map(item => [
                formatarNumero(item.TOTAL),
                item.MAIOR_AGENCIA,
                formatarNumero(item.MAIOR_VALOR)
                ])

        }

    ];

    const linhasVerticais = criarLinhasVerticais(serie);

    const layout = {
        locale: "pt-BR", //para que seja colocado ponto como separador de milhar

        margin:{
            l:50,
            r:20,
            t:20,
            b:40
        },

        hovermode: "x unified", //todos os dados no mesmo ponto em x

        unifiedhovertitle: {
            text: "%{x|%d/%m/%Y %H:%M}"
        },

        legend:{
            orientation:"h"
        },

        xaxis:{
            type:"date",
            tickformat:"%H:%M", //mostrar somente hora
            dtick:2 * 60 * 60 * 1000, //de duas em duas horas

            //Caso queira linhas verticais de forma automática
            showgrid:true,
            gridcolor:"#d0d0d0",
            griddash:"dot",
            gridwidth:1,

            // título do hover unificado
            unifiedhovertitle:{
                text:"<b>%{x|%d/%m/%Y %H:%M}</b><br>"
            }

        },

        yaxis:{
            title:"UCs sem energia"
        },

        shapes: linhasVerticais

    };

    if(DEBUG_GRAFICO) console.log("Quantidade de pontos:", x.length);
    if(DEBUG_GRAFICO) console.log(traces);
    if(DEBUG_GRAFICO) console.log(linhasVerticais);

    Plotly.react(
        "grafico",
        traces,
        layout,
        {
            responsive:true,
            displaylogo:false,
        }
        );

    const grafico = document.getElementById("grafico");

    //Clique no gráfico
    grafico.removeAllListeners("plotly_click"); //senão o console estoura o limite
    grafico.on("plotly_click", function(event){
        if (ignorarClique)
            return;
        horarioSelecionado = event.points[0].x + ":00";
        atualizarDashboard();
        //console.log(horarioSelecionado);
    });

    //Duplo clique para voltar ao último dado
    grafico.removeAllListeners("plotly_doubleclick"); //senão o console estoura o limite
        grafico.on("plotly_doubleclick", function () {
          ignorarClique = true; //necessário para evitar que também dispare clique simples
          horarioSelecionado = null;
        atualizarDashboard();
        //console.log("Duplo clique");
        setTimeout(() => {ignorarClique = false;}, 250);
        return false;
    });
}

/*========================================================
Pegar dados somente das últimas xx horas
========================================================*/
function filtrarUltimasHoras(linhas, horas){
    const limite = new Date();
    limite.setHours(
        limite.getHours() - horas
    );

    return linhas.filter(linha =>
        new Date(linha.DT_PROCESSAMENTO.replace(" ","T")) >= limite
    );
}

/*========================================================
Cria linhas verticais especiais

Responsável por:
- Destacar a mudança de dia (00:00).
- As demais linhas são desenhadas pelo grid do Plotly.
========================================================*/
function criarLinhasVerticais(serie){

    const linhas = [];

    if(serie.length === 0)
        return linhas;

    serie.forEach(item => {

        const data = new Date(
            item.DT_PROCESSAMENTO.replace(" ","T")
        );

        // Desenha apenas quando for meia-noite
        if(
            data.getHours() !== 0 ||
            data.getMinutes() !== 0
        ){
            return;
        }

        linhas.push({

            type:"line",

            xref:"x",
            yref:"paper",

            x0:data,
            x1:data,

            y0:0,
            y1:1,

            line:{
                color:"#C0C0C0",
                width:1
            }

        });

    });

    return linhas;
}

/*========================================================
Redimensiona o gráfico quando a janela muda de tamanho
========================================================*/
window.addEventListener("resize", () => {
    Plotly.Plots.resize(document.getElementById("grafico"));
});