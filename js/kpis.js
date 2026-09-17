/*========================================================
Projeto: Dados em Tempo Real
Arquivo: kpis.js

Responsável por:
- Calcular os KPIs a partir dos dados filtrados
- Atualizar os cartões da página
========================================================*/


/*========================================================
Função principal
========================================================*/
function atualizarKPIs(linhas,dadosCelesc){

    const indicadores = calcularKPIs(linhas, dadosCelesc);
    renderizarKPIs(indicadores);
}


/*========================================================
Calcula todos os indicadores
========================================================*/
function calcularKPIs(linhas, dadosCelesc){

    ultimoHorario = calcularUltimoHorario(linhas);

    return {
        qtUc: calcularQtUc(linhas, ultimoHorario),
        qtUcCelesc: dadosCelesc?.qtUc ?? 0, //?? 0 significa que se for vazio retorna 0
        chiEmerg: calcularChiEmerg(linhas),
        chiTotal: calcularChiTotal(linhas),

        totalSemEnergia: calcularTotalSemEnergia(linhas, ultimoHorario),

        // Calcula o DEC acumulado desde 00:00 do dia atual
        decHoje: calcularDecHoje(linhas, dadosCelesc)
    };
}


/*========================================================
CHI Emerg
Calcula o CHI das UCs Sem energia
========================================================*/
function calcularChiEmerg(linhas){
    const ucSemEnergia = linhas.reduce(
        (total, linha) =>
            total + (linha.QT_UC_SENERGIA_ACIDENTAL || 0),
        0
    );

    return ucSemEnergia / AMOSTRAS_POR_HORA;
}


/*========================================================
CHI Total
Calcula a soma de CHI Emergencial + Possível
========================================================*/
function calcularChiTotal(linhas){
    const ucSemEnergia = linhas.reduce(
        (total, linha) =>
            total + (linha.QT_UC_SENERGIA_ACIDENTAL + linha.QT_UC_SENERGIA_POSSIVEL || 0),
        0
    );

    return ucSemEnergia / AMOSTRAS_POR_HORA;
}


/*========================================================
Total de UCs sem energia
========================================================*/
function calcularTotalSemEnergia(linhas, ultimoHorario = null){

    if (ultimoHorario == null)
        return linhas.reduce((total, linha) => total + (linha.QT_TOTAL || 0), 0);
    else
        return linhas
            .filter(linha => linha.DT_PROCESSAMENTO === ultimoHorario)
            .reduce((total, linha) => total + (linha.QT_TOTAL || 0), 0);
}


/*========================================================
Quantidade de UCs (Filtro)
========================================================*/
function calcularQtUc(linhas, ultimoHorario = null) {
    if (!linhas || linhas.length === 0) {
        return 0;
    }

    if (ultimoHorario !== null) {
        // Pega apenas as linhas do último horário para não somar agências duplicadas
        return linhas
            .filter(linha => linha.DT_PROCESSAMENTO === ultimoHorario)
            .reduce((total, linha) => total + (linha.QT_UC_REGIONAL || 0), 0);
    } else {
        // Fallback (segurança): Caso venha sem horário, garante que cada agência some apenas uma vez
        const agenciasVistas = new Set();
        return linhas.reduce((total, linha) => {
            if (!agenciasVistas.has(linha.NM_AGENCIA)) {
                agenciasVistas.add(linha.NM_AGENCIA);
                return total + (linha.QT_UC_REGIONAL || 0);
            }
            return total;
        }, 0);
    }
}


/*========================================================
DEC Hoje

Calcula o DEC acumulado desde 00:00 do dia atual.

Fórmula:

    DEC Hoje =
        soma das UCs sem energia
        ------------------------
        30 x Qtde UCs

UCs sem energia =
    QT_UC_SENERGIA_ACIDENTAL
  + QT_UC_SENERGIA_PROGRAMADA
  + QT_UC_SENERGIA_POSSIVEL

Considera todos os registros a partir de 00:00
do dia atual.
========================================================*/
function calcularDecHoje(linhas, dadosCelesc){

    if (!linhas || linhas.length === 0) {
        return 0;
    }

    // ----------------------------------------------------
    // Início do dia atual: 00:00:00
    // ----------------------------------------------------
    const inicioHoje = new Date();
    inicioHoje.setHours(0, 0, 0, 0);

    // ----------------------------------------------------
    // Soma todas as UCs sem energia desde 00:00
    // ----------------------------------------------------
    const total = linhas
        .filter(linha => {

            const data = new Date(
                linha.DT_PROCESSAMENTO.replace(" ", "T")
            );

            return data >= inicioHoje;

        })
        .reduce((soma, linha) => {

            return soma
                + Number(linha.QT_UC_SENERGIA_ACIDENTAL || 0)
                + Number(linha.QT_UC_SENERGIA_PROGRAMADA || 0)
                + Number(linha.QT_UC_SENERGIA_POSSIVEL || 0);

        }, 0);

    // ----------------------------------------------------
    // Qtde UCs vem do JSON
    // ----------------------------------------------------
    const qtUc = Number(
        dadosCelesc?.qtUc ?? 0
    );

    if (qtUc <= 0) {
        return 0;
    }

    // ----------------------------------------------------
    // DEC Hoje
    // ----------------------------------------------------
    return total / (30 * qtUc);
}


/*========================================================
Atualiza os cartões da página
========================================================*/
function renderizarKPIs(kpi){

    document.getElementById("kpiChiEmerg").textContent =
        formatarDecimal(kpi.chiEmerg, 0);

    document.getElementById("kpiChiTotal").textContent =
        formatarDecimal(kpi.chiTotal, 0);

    document.getElementById("kpiTotalSemEnergia").textContent =
        formatarNumero(kpi.totalSemEnergia);

    document.getElementById("kpiQtUc").textContent =
        formatarNumero(kpi.qtUc);

    document.getElementById("kpiQtUcCelesc").textContent =
        formatarNumero(kpi.qtUcCelesc);

    document.getElementById("kpiGaugeDecHoje").textContent =
        formatarDecimal(kpi.decHoje, 4);

}