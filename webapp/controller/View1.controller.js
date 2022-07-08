sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/Token',
    "sap/ui/model/json/JSONModel",
    "jquery.sap.global",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, Token, JSONModel, jQuery, MessageBox, Filter, FilterOperator, ValueHelpDialog, Export, ExportTypeCSV) {
        "use strict";
        var serviceUrl = "/sap/opu/odata/sap/ZPP_KANBAN_CARD_SRV/",
            vm = null;

        return Controller.extend("zz1editcartoes.controller.View1", {
            onInit: function () {
                var oMultiInputsMaterial = this.getView().byId("sMATNR");
                var oMultiInputsAufnr = this.getView().byId("sAUFNR");
                var oMultiInputsTpKan = this.getView().byId("sTPKANBAN");

                // add validator
                var fnValidatorMat = function (args) {
                    var text = args.text;
                    return new Token({ key: text, text: text });
                };
                var fnValidatorAufnr = function (args) {
                    var text = args.text;
                    return new Token({ key: text, text: text });
                };

                var fnValidator = function (args) {
                    var text = args.text;
                    return new Token({ key: text, text: text });
                };

                oMultiInputsMaterial.addValidator(fnValidatorMat);
                oMultiInputsAufnr.addValidator(fnValidatorAufnr);
                oMultiInputsTpKan.addValidator(fnValidator);
                let defToken = new sap.m.Token({
                    key: 'OP',
                    text: 'OP'
                });
                oMultiInputsTpKan.addToken(defToken);
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                var oView = this.getView();
                oView.setModel(oModel);
                var oData = {
                    "KanbanCollection": [
                        {
                            "Id": "OP",
                            "Name": "Atendimento de reserva"
                        },
                        {
                            "Id": "CP",
                            "Name": "Envio complementar"
                        },
                        {
                            "Id": "RT",
                            "Name": "Retorno para DEMAT"
                        },
                        {
                            "Id": "EF",
                            "Name": "Disponibilizar para estoque fabrica"
                        }
                    ]
                };

                // set explored app's demo model on this sample
                var oModelMock = new JSONModel(oData);
                this.getView().setModel(oModelMock, "mock");
                this._oTable = this.byId("idTable");
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        oView.getModel().refresh();
                        this._oTable.removeSelections();
                    }.bind(this)
                });
                this._oTPC = null;
                /* var oPersonalizationService = sap.ushell.Container.getService("Personalization");
                 var oPersonalizer = oPersonalizationService.getPersonalizer({
                     container: "zz1cartoes", // This key must be globally unique (use a key to
                     // identify the app) Note that only 40 characters are allowed
                     item: "itemidTable" // Maximum of 40 characters applies to this key as well
                 });
                 this._oTPC = new TablePersoController({
                     table: this.byId("idTable"),
                     //specify the first part of persistence ids e.g. 'demoApp-productsTable-dimensionsCol'
                     componentName: "table",
                     persoService: oPersonalizer
                 }).activate();*/
            },
            onPersoButtonPressed: function (oEvent) {
                this._oTPC.openDialog();
                this._oTPC.attachPersonalizationsDone(this, this.onPerscoDonePressed.bind(this));
            },
            onPerscoDonePressed: function (oEvent) {
                this._oTPC.savePersonalizations();
            },
            onSearch: function () {
                vm = this;
                var oView = vm.getView();

                //  var campos = this.getView().getController().onValidaCampos();
                //  if (campos === 0) {
                this._oTable.removeSelections();
                var oAufnr = oView.byId("sAUFNR");
                var _Aufnr = [];
                vm._TokenData(_Aufnr, oAufnr, "sAUFNR");

                var oMatnr = oView.byId("sMATNR");
                var _Matnr = [];
                vm._TokenData(_Matnr, oMatnr, "sMATNR");

                var oTpKanban = oView.byId("sTPKANBAN");
                var _TpKanban = [];
                vm._TokenData(_TpKanban, oTpKanban, "sTPKANBAN");

                //Process Data
                // var oModel = new sap.ui.model.odata.ODataModel(serviceUrl, false);
                //sap.ui.getCore().setModel(oModel);

                var filters = [];
                for (var i = 0; i < _Aufnr.length; i++) {
                    filters.push(new sap.ui.model.Filter("Aufnr", sap.ui.model.FilterOperator.EQ, _Aufnr[i].padStart(12, "0")));
                }

                for (var i = 0; i < _Matnr.length; i++) {
                    filters.push(new sap.ui.model.Filter("Matnr", sap.ui.model.FilterOperator.EQ, _Matnr[i].padStart(18, "0")));
                }
                if (this.getView().byId("sWERKS").getValue() != "") {
                    filters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.getView().byId("sWERKS").getValue()));
                }
                for (var i = 0; i < _TpKanban.length; i++) {
                    filters.push(new sap.ui.model.Filter("Tpkanban", sap.ui.model.FilterOperator.EQ, _TpKanban[i]));
                }
                if (this.getView().byId("sStatus").getSelectedKey() != "") {
                    filters.push(new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, this.getView().byId("sStatus").getSelectedKey()));
                }
                if (this.getView().byId("sKanban").getValue() != "") {
                    filters.push(new sap.ui.model.Filter("Kanban", sap.ui.model.FilterOperator.EQ, this.getView().byId("sKanban").getValue().padStart(12, "0")));
                }

                this._oTable.getBinding("items").filter(filters);
                /* } else {
                     sap.m.MessageBox.show(
                         "Por favor preencha todos os campos obrigatórios.",
                         sap.m.MessageBox.Icon.ERROR,
                         "Ocorreu um erro ao buscar dados"
                     );
                 }*/
            },
            _TokenData: function (oArray, oField, oName) {
                vm = this;
                var oView = vm.getView();
                for (var i = 0, len = oField.getTokens().length; i < len; i++) {
                    oArray[i] = oField.getTokens()[i].getKey();
                }
                if (oArray === null || oArray === undefined || oArray.length < 1) {
                    if (oView.byId(oName)._lastValue !== "") {
                        oArray[0] = oView.byId(oName)._lastValue.toUpperCase();
                    }
                }
            },
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },
            _valueHelpRequest: function (oEvent, oOptions) {
                var oSettings = {
                    title: "",
                    key: "",
                    descriptionKey: "",
                    multiselect: true,
                    path: "",
                    cols: [],
                    filters: [],
                    ok: null
                };
                jQuery.extend(oSettings, oOptions);

                var oInput = oEvent.getSource(),
                    aTokens;

                if (oInput.getTokens) {
                    aTokens = oInput.getTokens();
                }
                var that = this;
                var oValueHelpDialog = new ValueHelpDialog({
                    basicSearchText: oInput.getValue(),
                    title: oSettings.title,
                    supportMultiselect: oSettings.multiselect,
                    supportRanges: oSettings.multiselect,
                    supportRangesOnly: oSettings.multiselect && !oSettings.path,
                    key: oSettings.key,
                    descriptionKey: oSettings.descriptionKey,
                    stretch: sap.ui.Device.system.phone,

                    ok: function (oControlEvent) {
                        aTokens = oControlEvent.getParameter("tokens");

                        if (oInput.setTokens) {
                            oInput.setValue(aTokens[0].getKey());
                        } else {
                            oInput.setValue(aTokens[0].getKey());
                        }

                        if (oSettings.ok) {
                            oSettings.ok(oControlEvent);
                        }

                        oValueHelpDialog.close();
                    },

                    cancel: function (oControlEvent) {
                        oValueHelpDialog.close();
                    },

                    afterClose: function () {
                        oValueHelpDialog.destroy();
                    }
                });

                oValueHelpDialog.setMaxExcludeRanges(0);
                oValueHelpDialog.setRangeKeyFields([{
                    label: oSettings.title,
                    key: oSettings.key
                }]);
                if (aTokens) {
                    oValueHelpDialog.setTokens(aTokens);
                }

                if (oSettings.path) {
                    var oTable = oValueHelpDialog.getTable(),
                        oColsModel = new sap.ui.model.json.JSONModel(),
                        oRowsModel = "";
                    if (oSettings.key == "Id") {
                        oRowsModel = this.getView().getModel("mock");
                    } else {
                        oRowsModel = this.getView().getModel();
                    }

                    oColsModel.setData({
                        cols: oSettings.cols
                    });
                    oTable.setModel(oColsModel, "columns");

                    oTable.setModel(oRowsModel);
                    if (oTable.bindRows) {
                        oTable.bindRows({
                            path: oSettings.path,
                            filters: oSettings.filters
                        });
                        oTable.setNoData(this.getResourceBundle().getText("noDataText"));
                    } else if (oTable.bindItems) {
                        oTable.bindItems({
                            path: oSettings.path,
                            filters: oSettings.filters,
                            factory: function (sId, oContext) {
                                var aCols = oTable.getModel("columns").getData().cols;

                                return new sap.m.ColumnListItem({
                                    cells: aCols.map(function (column) {
                                        var colname = column.template;
                                        return new sap.m.Label({
                                            text: "{" + colname + "}"
                                        });
                                    })
                                });
                            }
                        });
                        oTable.setNoDataText(this.getResourceBundle().getText("noDataText"));
                    }

                    var aFilterGroupItems = [];
                    for (var i = 0; i < oSettings.cols.length; i++) {
                        aFilterGroupItems.push(new sap.ui.comp.filterbar.FilterGroupItem({
                            groupName: "group",
                            name: oSettings.cols[i].label,
                            label: oSettings.cols[i].label,
                            control: new sap.m.Input()
                        }));
                    }

                    var oFilterBar = new sap.ui.comp.filterbar.FilterBar({
                        advancedMode: true,
                        filterBarExpanded: false,
                        showGoOnFB: !sap.ui.Device.system.phone,
                        filterGroupItems: aFilterGroupItems,
                        search: function (oControlEvent) {
                            var aSelections = oControlEvent.getParameters().selectionSet,
                                aFilters = [];
                            for (i = 0; i < aSelections.length; i++) {
                                var sValue = aSelections[i].getValue();
                                if (sValue) {
                                    aFilters.push(new Filter(oSettings.cols[i].template, FilterOperator.Contains, sValue));
                                }
                            }

                            if (oTable.bindRows) {
                                oTable.getBinding("rows").filter(aFilters);
                            } else {
                                oTable.getBinding("items").filter(aFilters);
                            }
                        }
                    });
                    if (oFilterBar.setBasicSearch) {
                        oFilterBar.setBasicSearch(new sap.m.SearchField({
                            showSearchButton: sap.ui.Device.system.phone,
                            placeholder: "Search",
                            visible: false,
                            search: function (event) {
                                oValueHelpDialog.getFilterBar().search();
                            }
                        }));
                    }
                    oValueHelpDialog.setFilterBar(oFilterBar);
                }

                if (oInput.$().closest(".sapUiSizeCompact").length > 0) {
                    oValueHelpDialog.addStyleClass("sapUiSizeCompact");
                } else {
                    oValueHelpDialog.addStyleClass("sapUiSizeCozy");
                }

                oValueHelpDialog.open();
                oValueHelpDialog.update();
            },
            onAufnrValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblAUFNR"),
                    key: "Aufnr",
                    descriptionKey: "Aufnr",
                    multiselect: true,
                    path: "/OrdemHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblAUFNR"),
                        template: "Aufnr"
                    }]//,
                    //filters: aFilters
                })
            },
            onMatnrValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblMaterial"),
                    key: "Matnr",
                    descriptionKey: "Maktx",
                    multiselect: true,
                    path: "/MaterialHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblMaterial"),
                        template: "Matnr"
                    }, {
                        label: this.getResourceBundle().getText("lblMATNR"),
                        template: "Maktx"
                    }]//,
                    //filters: aFilters
                })
            },
            onMatnrSingleValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblMaterial"),
                    key: "Matnr",
                    descriptionKey: "Maktx",
                    multiselect: false,
                    path: "/MaterialHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblMaterial"),
                        template: "Matnr"
                    }, {
                        label: this.getResourceBundle().getText("lblMATNR"),
                        template: "Maktx"
                    }]//,
                    //filters: aFilters
                })
            },
            onWerksValueHelp: function (oEvent) {
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblWERKS"),
                    key: "Werks",
                    descriptionKey: "Name1",
                    multiselect: false,
                    path: "/CentroHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblWERKS"),
                        template: "Werks"
                    }, {
                        label: this.getResourceBundle().getText("lblWERKSDESC"),
                        template: "Name1"
                    }]
                })
            },
            onSaborValueHelp: function (oEvent) {
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblSABOR"),
                    key: "Atzhl",
                    descriptionKey: "Atwrt",
                    multiselect: false,
                    path: "/SaborHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblSABOR"),
                        template: "Atzhl"
                    }, {
                        label: this.getResourceBundle().getText("lblSABORdesc"),
                        template: "Atwrt"
                    }]
                })
            },
            onKanbanValueHelp: function (oEvent) {
                var aFilters = [],
                    oContext = oEvent.getSource().getBindingContext();
                //sVbeln = oContext.getProperty("Vbeln");
                //aFilters.push(new sap.ui.model.Filter("Vbeln", sap.ui.model.FilterOperator.EQ, sVbeln));

                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblTPKANBAN"),
                    key: "Id",
                    descriptionKey: "Name",
                    multiselect: false,
                    path: "/KanbanCollection",
                    cols: [{
                        label: this.getResourceBundle().getText("lblTPKANBAN"),
                        template: "Id"
                    }, {
                        label: "Descrição",
                        template: "Name"
                    }]//,
                    //filters: aFilters
                })
            },
            onPrvbeValueHelp: function (oEvent) {
                var aFilters = [];
                aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ, this.getView().byId("sWERKS").getValue()));
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblVSPVB"),
                    key: "Prvbe",
                    multiselect: false,
                    path: "/FabricaHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblVSPVB"),
                        template: "Prvbe"
                    }],
                    filters: aFilters
                })
            },
            onLgortDialogValueHelp: function (oEvent) {
                var aFilters = [];
                aFilters.push(new sap.ui.model.Filter("Werks", sap.ui.model.FilterOperator.EQ,
                    sap.ui.core.Fragment.byId("aDialogCComplementar", "iWerks").getValue()));
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblLGORT"),
                    key: "Lgort",
                    descriptionKey: "Lgobe",
                    multiselect: false,
                    path: "/DepositoHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblLGORT"),
                        template: "Lgort"
                    }, {
                        label: this.getResourceBundle().getText("lblLGORTDESC"),
                        template: "Lgobe"
                    }],
                    filters: aFilters
                })
            },
            onLgortValueHelp: function (oEvent) {
                this._valueHelpRequest(oEvent, {
                    title: this.getResourceBundle().getText("lblLGORT"),
                    key: "Lgort",
                    descriptionKey: "Lgobe",
                    multiselect: false,
                    path: "/DepositoHelpSet",
                    cols: [{
                        label: this.getResourceBundle().getText("lblLGORT"),
                        template: "Lgort"
                    }, {
                        label: this.getResourceBundle().getText("lblLGORTDESC"),
                        template: "Lgobe"
                    }]
                })
            },
            onExport: function (oEvent) {
                var table = this.oView.byId("idTable");
                var oBinding = table.getBinding("items");
                var oExport = new Export({

                    // Type that will be used to generate the content. Own ExportType's can be created to support other formats
                    exportType: new ExportTypeCSV({
                        separatorChar: ";"
                    }),

                    // Pass in the model created above
                    models: table.getModel(),

                    // binding information for the rows aggregation
                    rows: {
                        path: "/Zpp_xxxSet",
                        filters: oBinding.aFilters
                    },

                    // column definitions with column name and binding info for the content
                    columns: [{
                        name: this.getResourceBundle().getText("lblKanban"),
                        template: {
                            content: "{Kanban}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblTPKANBAN"),
                        template: {
                            content: "{Tpkanban}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblSTATUS"),
                        template: {
                            content: "{Status}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblStatusDesc"),
                        template: {
                            content: "{DescStatus}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblMATNR"),
                        template: {
                            content: "{Matnr}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblDescMatnr"),
                        template: {
                            content: "{Maktx}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblAUFNR"),
                        template: {
                            content: "{Aufnr}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblQtd"),
                        template: {
                            content: "{Menge}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblUn"),
                        template: {
                            content: "{Meins}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblLGORT"),
                        template: {
                            content: "{Lgort}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblArea"),
                        template: {
                            content: "{Vspvb}"
                        }
                    }, {
                        name: this.getResourceBundle().getText("lblContador"),
                        template: {
                            content: "{Contador}"
                        }
                    }]
                });

                // download exported file
                oExport.saveFile().catch(function (oError) {
                    MessageBox.error("Not supported Browser!\n\n" + oError);
                }).then(function () {
                    oExport.destroy();
                });
            },
            onDelete: function (oEvent) {
                var rowAllItems = this.byId("idTable").getSelectedItems();
                var that = this;
                var batchChanges = [];
                var oModel = this.getView().getModel();
                var aEntry = [];
                var Error = false;

                for (var i = 0; i < rowAllItems.length; i++) {
                    var item = rowAllItems[i].getBindingContext().getObject();
                    if (item.Kanban != "01") {
                        if (item.Kanban == "") {
                            Error = true;
                            break;
                        } else {
                            var oEntry = {
                                Kanban: item.Kanban.padStart(12, "0"),
                            };
                            aEntry.push(oEntry)
                            batchChanges.push(oModel.createBatchOperation("/Zpp_xxxSet", "POST", oEntry));
                        }
                    }
                }
                if (Error != "") {
                    sap.m.MessageBox.show(
                        "Um ou mais itens possui status que não permite a modificação",
                        sap.m.MessageBox.Icon.ERROR,
                        "Erro ao enviar os dados"
                    );
                } else {
                    sap.m.MessageBox.warning("Tem certeza que deseja excluir o cartão KANBAN?", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction == "OK") {
                                if (batchChanges.length !== 0) {
                                    oModel.addBatchChangeOperations(batchChanges);
                                    var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                                    oGlobalBusyDialog.open();
                                    //submit changes and refresh the table and display message
                                    oModel.submitBatch(function (data) {
                                        oModel.refresh();
                                        oGlobalBusyDialog.close();
                                        if (data.__batchResponses[0].__changeResponses) {
                                            //MessageBox.confirm("Lançamento efetuado", {});
                                            MessageBox.success("Dados gravados com sucesso!", {
                                                onClose: function (sAction) {
                                                   // that.getView().getController().onSearch();
                                                }
                                            });
                                            that.getView().getController()._onPageNavButtonPress();
                                        } else {
                                            var errorObj1 = jQuery.parseXML(data.__batchResponses[0].response.body).querySelector("message");
                                            sap.m.MessageBox.show(
                                                errorObj1.textContent,
                                                sap.m.MessageBox.Icon.ERROR,
                                                "Erro ao enviar os dados"
                                            );
                                        }
                                    }, function (err) {
                                        oGlobalBusyDialog.close();
                                        var errorObj1 = jQuery.parseXML(err.response.body).querySelector("message");
                                        sap.m.MessageBox.show(
                                            errorObj1.textContent,
                                            sap.m.MessageBox.Icon.ERROR,
                                            "Erro ao enviar os dados"
                                        );
                                    });
                                } else {
                                    sap.m.MessageBox.show(
                                        "Selecione ao menos um item antes de processeguir",
                                        sap.m.MessageBox.Icon.ERROR,
                                        "Ocorreu um erro"
                                    );
                                }
                            }
                        }
                    });
                }

            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            onEdit: function (oEvent) {
                var rowAllItems = this.byId("idTable").getSelectedItems();
                if(rowAllItems.length > 1){
                    sap.m.MessageBox.show(
                        "Favor selecionar apenas um item",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );

                }else if(rowAllItems.length == 0){
                    sap.m.MessageBox.show(
                        "Selecione ao menos um item antes de processeguir",
                        sap.m.MessageBox.Icon.ERROR,
                        "Ocorreu um erro"
                    );
                }else{
                    // var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
                    var oObject = this.byId("idTable").getSelectedItems()[0].getBindingContext().getObject();
                    // var oObject;
                    var oComponent = this.getOwnerComponent();
                    oComponent.setModel(new JSONModel(oObject), "detailData");
                    this.getRouter().navTo("View2");
                }
            },
        });
    });
