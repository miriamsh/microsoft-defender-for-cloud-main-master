import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from "path";
import { AzureAccountTreeItem } from './VulnerabilitiesTree/AzureAccountTreeItem';
import { createAzExtOutputChannel, AzExtTreeDataProvider, registerCommand } from '@microsoft/vscode-azext-utils';
import { registerAzureUtilsExtensionVariables } from '@microsoft/vscode-azext-azureutils';
import { selectFiltersCommand } from './Commands/FilterVulnerabilities';
import { Constants } from './Constants';
import { setEmailNotificationSettings } from './Commands/SetEmailSettings';
import { callWithTelemetryAndErrorHandling, IActionContext } from 'vscode-azureextensionui';
import { sendSmsWithAzureMonitor } from './Commands/SendSmsAM';
import { setSmsNotification } from './Commands/SetSmsSettingsAM';
import { AlertTreeItem } from './VulnerabilitiesTree/Security Alerts/AlertTreeItem';
import { setSmsNotificationSettings } from './Commands/SetSmsSettings';
import { sendSmsNotification } from './Commands/SendSms';
import { createGraph } from './Commands/CreateGraphCommand';
import { createHierarchy } from './Commands/CreateHierarchyCommand';
import { AlertEntity } from '@azure/arm-security';
import axios from 'axios';
import { PDF } from './Document/PDF';
import { create } from 'domain';
import { createReport } from './Commands/createReport';


export async function activate(context: vscode.ExtensionContext) {

    Constants.initialize(context);

    const uiExtensionVariables = {
        context,
        ignoreBundle: false,
        outputChannel: createAzExtOutputChannel('Azure Identity', ''),
        prefix: '',
    };

    registerAzureUtilsExtensionVariables(uiExtensionVariables);

    await callWithTelemetryAndErrorHandling('mdc.Activate', async (activateContext: IActionContext) => {
        activateContext.telemetry.properties.isActivationEvent = 'true';

        const azureAccountTreeItem = new AzureAccountTreeItem();
        context.subscriptions.push(azureAccountTreeItem);
        const treeDataProvider = new AzExtTreeDataProvider(azureAccountTreeItem, "subscription.getSubscription");
        vscode.window.registerTreeDataProvider('package-resources', treeDataProvider);

        await registerCommands(context);
    });
}

async function registerCommands(context: vscode.ExtensionContext) {

    registerCommand('subscription.email.notification.settings', async (_context: IActionContext, node) => {
        await setEmailNotificationSettings(context, node.client, node.root);
    });

    registerCommand('subscription.sms.notification.settings', async (_context: IActionContext, node) => {
        //await setSmsNotificationSettings(node.getCommunicationServices());
        await setSmsNotification(node.subscription.subscriptionId, await node.getMonitor(_context));
    });

    registerCommand('recommendation.filter.status', async (_context: IActionContext, node) => {
        await selectFiltersCommand(node, "recommendations", "status");
    });

    registerCommand('recommendation.filter.environment', async (_context: IActionContext, node) => {
        await selectFiltersCommand(node, "recommendations", "environment");
    });

    registerCommand('alerts.filter.severity', async (_context: IActionContext, node) => {
        await selectFiltersCommand(node, "alerts", "severity");
    });

    registerCommand('alerts.filter.status', async (_context: IActionContext, node) => {
        await selectFiltersCommand(node, "alerts", "status");
    });

    registerCommand('connectors.filter.cloudProvider', async (_context: IActionContext, node) => {
        await selectFiltersCommand(node, "connectors", "cloudProvider");
    });

    registerCommand("recommendation.menu.showInBrowser", (_context: IActionContext, node) => {
        vscode.env.openExternal(vscode.Uri.parse(Constants.recommendationOnPortal(node.assessmentName)));
    });

    //TODO:Get the root file, of the project
    registerCommand("recommendations.menu.showDetailed", (_context: IActionContext, node) => {
         fs.writeFile(path.join(Constants.resourcesFolderPath, 'details.json'), node.jsonItem, (err) => { });
        vscode.window.showTextDocument(vscode.Uri.file(path.join(Constants.resourcesFolderPath, 'details.json')));
    });

    registerCommand("alerts.menu.showInBrowser", (_context: IActionContext, node: AlertTreeItem) => {
        vscode.env.openExternal(vscode.Uri.parse(node.alertUri));
    });

    registerCommand("alerts.menu.showDetailed", (_context: IActionContext, node: AlertTreeItem) => {
        fs.writeFile(path.join(Constants.resourcesFolderPath, 'details.json'), node.jsonItem, (err) => { });
        vscode.window.showTextDocument(vscode.Uri.file(path.join(Constants.resourcesFolderPath, 'details.json')));
    });

    registerCommand("alerts.menu.actionMenu.sendNotifications", async (_context: IActionContext, node) => {
        await sendSmsWithAzureMonitor(_context, node.subscription.subscriptionId, await node.parent.parent.parent.getMonitor(_context));
    });

    registerCommand("alerts.menu.actionMenu.dismiss", (_context: IActionContext, node: AlertTreeItem) => {
        node.dismiss();
    });

    registerCommand("alerts.menu.actionMenu.activate", (_context: IActionContext, node: AlertTreeItem) => {
        node.activate();
    });


    registerCommand('alerts.menu.showAs.graph', async (_context: IActionContext, node) => {
            createGraph(node.entities, context);
    });

    registerCommand('alerts.menu.showAs.hierarchy', async (event, node) => {
        createHierarchy(node.entities, context);
    });

    registerCommand('createReport', async (event, node) => {
        createReport(context,node);
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
export function deactivate() {
    fs.rm(path.join(Constants.resourcesFolderPath, 'details.json'), (err) => { });
}
