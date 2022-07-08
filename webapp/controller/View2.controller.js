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
        return Controller.extend("zz1editcartoes.controller.View2", {
            onInit: function () {
                var oView = this.getView();
                var vm = this;
                var oModel = new sap.ui.model.odata.ODataModel(serviceUrl);
                var oView = this.getView();
                oView.setModel(oModel);
                oView.addEventDelegate({
                    onBeforeShow: function () {
                        if (vm.getOwnerComponent().getModel("detailData") == undefined) {
                            vm.getRouter().navTo("View1");
                        } else {
                            var oContainer = vm.getOwnerComponent().getModel("detailData").getProperty("/");

                            //var Orderid = oContainer.Orderid;

                            //vm.getView().byId("page2").setTitle("Ordem: " + Orderid);

                            vm.byId("tProduto").setText(oContainer.Matnr + "-" + oContainer.Maktx);
                            vm.byId("tWERKS").setText(oContainer.Werks);
                            vm.byId("tAUFNR").setText(oContainer.Aufnr);
                            vm.byId("tReserva").setText(oContainer.Rsnum);

                            vm.byId("tQtd").setText(oContainer.Menge + " " + oContainer.Meins);
                            vm.byId("tRspos").setText(oContainer.Rspos);
                            vm.byId("tMblnr").setText(oContainer.Mblnr + "-" + oContainer.Mjahr);
                            vm.getView().byId("qtdPara").setValue("");
                            vm.getView().byId("tMotivo").setValue("");

                            if(oContainer.Status == "01" || oContainer.Status == "10" || oContainer.Status == "20"){
                                vm.getView().byId("Save").setVisible(true);
                            }else{
                                vm.getView().byId("Save").setVisible(false);
                            }

                        }
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
            _onPageNavButtonPress: function () {
                this.getRouter().navTo("View1");
            },
            getRouter: function () {
                return sap.ui.core.UIComponent.getRouterFor(this);
            },
            _onTablePress: function (oEvent) {
                var oObject = oEvent.getParameter("listItem").getBindingContext().getObject();
                var oComponent = this.getOwnerComponent();
                oComponent.setModel(new JSONModel(oObject), "detailDataView2");
                this.getRouter().navTo("View3");
            },
            getResourceBundle: function () {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle();
            },
            onUpdate: function () { //METODO O UPDATE 
                var oModel = this.getView().getModel()
                var that = this;
                MessageBox.confirm(
                    "Deseja salvar?", {
                    onClose: function (sButton) {
                        if (sButton === MessageBox.Action.OK) {
                            var campos = that.getView().getController().onValidaCampos();
                            if (campos === 0) {
                                var oEntry = {};
                                var url = window.location.href.split("sap/");
                                var oContainer = that.getOwnerComponent().getModel("detailData").getProperty("/");
    
                                oEntry.Kanban = oContainer.Kanban.padStart(12, "0");
                                oEntry.Menge = that.getView().byId("qtdPara").getValue();
                                oEntry.Motivo = that.getView().byId("tMotivo").getValue();

                                var oGlobalBusyDialog = new sap.m.BusyDialog(); //PREPARA UM LOAD NA TELA
                                oGlobalBusyDialog.open();
                                oModel.update("/Zpp_xxxSet(Kanban='" + oEntry.Kanban + "')", oEntry, null,
                                    function (oData) {
                                        oGlobalBusyDialog.close(); //FECHA O LOAD
                                        var pdfUrl = url[0] + serviceUrl + "KanbanCardSet(Aufnr='" + oContainer.Aufnr.padStart(12, "0") + "',Werks='" + oContainer.Werks + "',Rsnum='" +
                                        oContainer.Rsnum.padStart(10, "0") + "',Rspos='" + oContainer.Rspos + "',Item='" + oEntry.Kanban + "')/$value";
                                        window.open(pdfUrl);
                                        MessageBox.success(
                                            "Cartão alterado e reimpresso com sucesso!", {
                                            onClose: function (sButton2) {
                                                that.getRouter().navTo("View1");
                                            }
                                        }
                                        );
                                    },
                                    function (err) { //DA UM GET NO ERRO
                                        oGlobalBusyDialog.close(); //FECHA O LOAD
                                        var errorObj1 = jQuery.parseXML(err.response.body).querySelector("message");
                                        sap.m.MessageBox.show(
                                            errorObj1.textContent,
                                            sap.m.MessageBox.Icon.ERROR,
                                            "Erro ao atualizar o registro"
                                        );
                                    });
                            } else if(campos == 1) {
                                sap.m.MessageBox.show(
                                    "Por favor preencha todos os campos obrigatórios",
                                    sap.m.MessageBox.Icon.ERROR,
                                    "Erro ao atualizar o registro"
                                );
                            }else if(campos == 2){
                                sap.m.MessageBox.show(
                                    "O valor digitado deve ser maior do que zero",
                                    sap.m.MessageBox.Icon.ERROR,
                                    "Erro ao atualizar o registro"
                                );

                            }
                        }
                    }
                }
                );
            },
            onValidaCampos: function(oEvent){
                this.getView().byId("qtdPara").setValueStateText("");
                this.getView().byId("qtdPara").setValueState("None");
                var retorno = 0;
                if (this.getView().byId("qtdPara").getValue() === "") {
                    this.getView().byId("qtdPara").setValueStateText("Campo obrigatório");
                    this.getView().byId("qtdPara").setValueState("Error");
                    retorno = 1;
                }
                if (this.getView().byId("qtdPara").getValue() == "0") {
                    this.getView().byId("qtdPara").setValueStateText("O valor deve ser superior a 0");
                    this.getView().byId("qtdPara").setValueState("Error");
                    retorno = 2;
                }
                return retorno;                
            }
        });
    });
