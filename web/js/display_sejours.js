// Récupération des variables définies dans le js_vars inclu dans le DOM dans layout.html.twig
var JsVars = jQuery('#js-vars').data('vars');

if( JsVars.fhir !== undefined ) {
    var fhir = JSON.parse(JsVars.fhir);

    var data = [];

    fhir.entry.forEach(function(el) {
        data.push({
            entree: el.resource.period.start,
            sortie: el.resource.period.end,
            id: el.resource.id,
            status: el.resource.status,
            ref_patient: el.resource.subject.reference,
            name: el.resource.subject.display
        });
    });

    $("#grid-sejours").dxDataGrid({
        dataSource: data,
        allowColumnResizing: true,
        allowColumnReordering: true,
        hoverStateEnabled: true,
        showRowLines: true,
        showBorders: true,
        headerFilter: { visible: true },
        loadPanel: { enabled: true },
        paging: { pageSize: 25 },
        pager: { showInfo: true	},
        selection: {
            mode: "multiple",
            showCheckBoxesMode: "always"
        },
        columns: [
            {
                dataField: "entree",
                caption: "Entrée",
                width: 150,
                dataType: "date"
            },
            {
                dataField: "sortie",
                caption: "Sortie",
                width: 150,
                dataType: "date"
            },
            {
                dataField: "status",
                caption: "Status",
                width: 150,
                dataType: "string"
            },
            {
                dataField: "ref_patient",
                caption: "Reference Patient",
                width: 150,
                dataType: "string"
            },
            {
                dataField: "name",
                caption: "nom du patient",
                width: 150,
                dataType: "string"
            }
        ]
    });

    var loadpanel = $("#loadpanel").dxLoadPanel({
        width: 300,
        message: "Recherche des séjours...",
        visible: false,
        shading: true,
        shadingColor: "rgba(0,0,0,0.4)",
        position: { of: "#container-sejours" }
    }).dxLoadPanel("instance");

    $("#button-archivage").dxButton({
        text: "Archiver",
        type: "success",
        onClick: function (e) {

            loadpanel.option("message", "Récupération des documents...");
            var grid         = $("#grid-sejours").dxDataGrid("instance"),
                selectedRows = grid.getSelectedRowsData();

            if(selectedRows.length > 0) {
                loadpanel.show();
            }

            selectedRows.forEach(function(el) {
                var url = "/archive";
                $.ajax({
                    type: "POST",
                    url: url,
                    data: {
                        sejour_id: el.id,
                        patient_name: el.name
                    }
                })
                .done(function(res) {
                    //var fhir = JSON.parse(res);                    
                    loadpanel.option("indicatorSrc", "../images/check.png");
                    loadpanel.option("message", "Création de l'archive "+ res);
                    setTimeout(function() { loadpanel.hide(); }, 5000);
                })
                .fail(function(res) {                    
                    loadpanel.option("indicatorSrc", "../images/banned.png");
                    loadpanel.option("message", "Le fichier "+res.responseJSON+" est déjà archivé");
                    setTimeout(function() { loadpanel.hide(); }, 5000);
                });
            });
        }
    });
}
