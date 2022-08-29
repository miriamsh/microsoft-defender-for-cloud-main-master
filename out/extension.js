"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const AzureAccountTreeItem_1 = require("./VulnerabilitiesTree/AzureAccountTreeItem");
const vscode_azext_utils_1 = require("@microsoft/vscode-azext-utils");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const FilterVulnerabilities_1 = require("./Commands/FilterVulnerabilities");
const Constants_1 = require("./Constants");
const SetEmailSettings_1 = require("./Commands/SetEmailSettings");
const vscode_azureextensionui_1 = require("vscode-azureextensionui");
const SendSmsAM_1 = require("./Commands/SendSmsAM");
const SetSmsSettingsAM_1 = require("./Commands/SetSmsSettingsAM");
const CreateGraphCommand_1 = require("./Commands/CreateGraphCommand");
const CreateHierarchyCommand_1 = require("./Commands/CreateHierarchyCommand");
const createReport_1 = require("./Commands/createReport");
async function activate(context) {
    Constants_1.Constants.initialize(context);
    const uiExtensionVariables = {
        context,
        ignoreBundle: false,
        outputChannel: (0, vscode_azext_utils_1.createAzExtOutputChannel)('Azure Identity', ''),
        prefix: '',
    };
    (0, vscode_azext_azureutils_1.registerAzureUtilsExtensionVariables)(uiExtensionVariables);
    await (0, vscode_azureextensionui_1.callWithTelemetryAndErrorHandling)('mdc.Activate', async (activateContext) => {
        activateContext.telemetry.properties.isActivationEvent = 'true';
        const azureAccountTreeItem = new AzureAccountTreeItem_1.AzureAccountTreeItem();
        context.subscriptions.push(azureAccountTreeItem);
        const treeDataProvider = new vscode_azext_utils_1.AzExtTreeDataProvider(azureAccountTreeItem, "subscription.getSubscription");
        vscode.window.registerTreeDataProvider('package-resources', treeDataProvider);
        await registerCommands(context);
    });
}
exports.activate = activate;
async function registerCommands(context) {
    (0, vscode_azext_utils_1.registerCommand)('subscription.email.notification.settings', async (_context, node) => {
        await (0, SetEmailSettings_1.setEmailNotificationSettings)(context, node.client, node.root);
    });
    (0, vscode_azext_utils_1.registerCommand)('subscription.sms.notification.settings', async (_context, node) => {
        //await setSmsNotificationSettings(node.getCommunicationServices());
        await (0, SetSmsSettingsAM_1.setSmsNotification)(node.subscription.subscriptionId, await node.getMonitor(_context));
    });
    (0, vscode_azext_utils_1.registerCommand)('recommendation.filter.status', async (_context, node) => {
        await (0, FilterVulnerabilities_1.selectFiltersCommand)(node, "recommendations", "status");
    });
    (0, vscode_azext_utils_1.registerCommand)('recommendation.filter.environment', async (_context, node) => {
        await (0, FilterVulnerabilities_1.selectFiltersCommand)(node, "recommendations", "environment");
    });
    (0, vscode_azext_utils_1.registerCommand)('alerts.filter.severity', async (_context, node) => {
        await (0, FilterVulnerabilities_1.selectFiltersCommand)(node, "alerts", "severity");
    });
    (0, vscode_azext_utils_1.registerCommand)('alerts.filter.status', async (_context, node) => {
        await (0, FilterVulnerabilities_1.selectFiltersCommand)(node, "alerts", "status");
    });
    (0, vscode_azext_utils_1.registerCommand)('connectors.filter.cloudProvider', async (_context, node) => {
        await (0, FilterVulnerabilities_1.selectFiltersCommand)(node, "connectors", "cloudProvider");
    });
    (0, vscode_azext_utils_1.registerCommand)("recommendation.menu.showInBrowser", (_context, node) => {
        vscode.env.openExternal(vscode.Uri.parse(Constants_1.Constants.recommendationOnPortal(node.assessmentName)));
    });
    //TODO:Get the root file, of the project
    (0, vscode_azext_utils_1.registerCommand)("recommendations.menu.showDetailed", (_context, node) => {
        fs.writeFile(path.join(Constants_1.Constants.resourcesFolderPath, 'details.json'), node.jsonItem, (err) => { });
        vscode.window.showTextDocument(vscode.Uri.file(path.join(Constants_1.Constants.resourcesFolderPath, 'details.json')));
    });
    (0, vscode_azext_utils_1.registerCommand)("alerts.menu.showInBrowser", (_context, node) => {
        vscode.env.openExternal(vscode.Uri.parse(node.alertUri));
    });
    (0, vscode_azext_utils_1.registerCommand)("alerts.menu.showDetailed", (_context, node) => {
        fs.writeFile(path.join(Constants_1.Constants.resourcesFolderPath, 'details.json'), node.jsonItem, (err) => { });
        vscode.window.showTextDocument(vscode.Uri.file(path.join(Constants_1.Constants.resourcesFolderPath, 'details.json')));
    });
    (0, vscode_azext_utils_1.registerCommand)("alerts.menu.actionMenu.sendNotifications", async (_context, node) => {
        await (0, SendSmsAM_1.sendSmsWithAzureMonitor)(_context, node.subscription.subscriptionId, await node.parent.parent.parent.getMonitor(_context));
    });
    (0, vscode_azext_utils_1.registerCommand)("alerts.menu.actionMenu.dismiss", (_context, node) => {
        node.dismiss();
    });
    (0, vscode_azext_utils_1.registerCommand)("alerts.menu.actionMenu.activate", (_context, node) => {
        node.activate();
    });
    (0, vscode_azext_utils_1.registerCommand)('alerts.menu.showAs.graph', async (_context, node) => {
        (0, CreateGraphCommand_1.createGraph)(node.entities, context);
    });
    (0, vscode_azext_utils_1.registerCommand)('alerts.menu.showAs.hierarchy', async (event, node) => {
        (0, CreateHierarchyCommand_1.createHierarchy)(node.entities, context);
    });
    (0, vscode_azext_utils_1.registerCommand)('createReport', async (event, node) => {
        (0, createReport_1.createReport)(context, node);
        //change
        // const path = context.extensionPath + '\\mdc_report.pdf';
        // try {
        //     const res = await axios.post('https://mdc-report-function.azurewebsites.net/api/report-function?',
        //     {
        //         token: await node.subscription.credentials.getToken(),
        //         url: node.apiUrl,
        //         filterSettings: node.filter
        //     }
        //     );
        // if (res.data.length>0) {
        //     const document = new PDF(path, node.model);
        //     document.addData(res.data);
        //     const pick = await vscode.window.showInformationMessage("The report have been created successfully", "open",);
        //     if (pick === "open") {
        //         vscode.env.openExternal(vscode.Uri.file(path));
        //     }
        // }
        // else {
        //     vscode.window.showInformationMessage("There are no data to display.");
        // }
        // } catch (error:any) {
        //     vscode.window.showInformationMessage(error.message);
        // }
    });
}
// this method is called when your extension is deactivated
function deactivate() {
    fs.rm(path.join(Constants_1.Constants.resourcesFolderPath, 'details.json'), (err) => { });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map