/*========================================================
filtros.js

Responsável por:
- Construir os filtros de Agências
- Controlar os checkboxes
- Informar quais agências estão selecionadas

Não atualiza gráfico nem tabela.
========================================================*/

/*========================================================
Renderiza os filtros
========================================================*/
function atualizarFiltros(agencias){

    if(!agencias)
        return;

    const container = document.getElementById("filtroAgencias");
    container.innerHTML = "";

    // Ordena alfabeticamente
    agencias.sort();

    //--------------------------------------------------
    // Checkbox "Todas"
    //--------------------------------------------------
    const divTodas = document.createElement("div");
    divTodas.className = "item-filtro-todas";
    divTodas.innerHTML =
        `
        <label>
            <input
                type="checkbox"
                id="checkTodas"
            >
            <b>Todas as Agências</b>
        </label>
        `;
    container.appendChild(divTodas);

    //--------------------------------------------------
    // Lista de agências
    //--------------------------------------------------
    agencias.forEach(agencia => {
        const div = document.createElement("div");
        div.className = "item-filtro";
        div.innerHTML =
            `
            <label>
                <input
                    type="checkbox"
                    class="check-agencia"
                    value="${agencia}"
                    checked
                >
                ${agencia}
            </label>
            `;

        container.appendChild(div);
    });

    // Estado inicial
    document.getElementById("checkTodas").checked = true;
    document
        .querySelectorAll(".check-agencia")
        .forEach(cb => cb.checked = false);

    configurarEventosFiltro();
}

/*========================================================
Configura eventos dos checkboxes
========================================================*/
function configurarEventosFiltro(){

    const checkTodas =
        document.getElementById("checkTodas");

    const checksAgencias =
        document.querySelectorAll(".check-agencia");

    //--------------------------------------------------
    // Clicou em "Todas as Agências"
    //--------------------------------------------------
    checkTodas.addEventListener("change", () => {

        if(checkTodas.checked){
            // Desmarca todas as agências individuais
            checksAgencias.forEach(cb => {
                cb.checked = false;
            });

        }else{

            // Não permite ficar sem nenhuma opção
            checkTodas.checked = true;
        }

        dispararAtualizacaoDashboard();
    });

    //--------------------------------------------------
    // Clicou em uma agência
    //--------------------------------------------------
    checksAgencias.forEach(cb => {

        cb.addEventListener("change", () => {

            const algumaMarcada =
                Array.from(checksAgencias)
                    .some(c => c.checked);

            if(algumaMarcada){
                // Sai do modo "Todas"
                checkTodas.checked = false;

            }else{
                // Voltou para "Todas"
                checkTodas.checked = true;
            }
            dispararAtualizacaoDashboard();
        });
    });
}

/*========================================================
Retorna um array contendo apenas as agências marcadas
========================================================*/
function obterAgenciasSelecionadas(){

    const checkTodas =
        document.getElementById("checkTodas");

    // "Todas" selecionada
    if(checkTodas.checked){

        return Array
            .from(document.querySelectorAll(".check-agencia"))
            .map(cb => cb.value);

    }

    // Apenas as marcadas
    return Array
        .from(document.querySelectorAll(".check-agencia:checked"))
        .map(cb => cb.value);
}

/*========================================================
Solicita atualização do Dashboard
========================================================*/
function dispararAtualizacaoDashboard(){
    /*console.log(obterAgenciasSelecionadas());*/
    atualizarDashboard();
}


/*========================================================

========================================================*/
function restaurarFiltros(agencias){

    const checkTodas =
        document.getElementById("checkTodas");

    const checks =
        document.querySelectorAll(".check-agencia");

    let algumaMarcada = false;

    checks.forEach(cb=>{
        if(agencias.includes(cb.value)){
            cb.checked = true;
            algumaMarcada = true;
        }
    });
    checkTodas.checked = !algumaMarcada;
}