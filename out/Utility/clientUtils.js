"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const arm_security_1 = require("@azure/arm-security");
const Constants_1 = require("../Constants");
const arm_resources_1 = require("@azure/arm-resources");
const arm_communication_1 = require("@azure/arm-communication");
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const arm_monitor_1 = require("@azure/arm-monitor");
const identity_1 = require("@azure/identity");
class Client {
    constructor(subscription) {
        this.subscription = subscription;
        this.resourceManagementClient = new arm_resources_1.ResourceManagementClient(subscription.credentials, Constants_1.Constants.subscriptionId);
        this.communicationManagementClient = new arm_communication_1.CommunicationServiceManagementClient(subscription.credentials, subscription.subscriptionId);
        this.securityCenterClient = new arm_security_1.SecurityCenter(subscription.credentials, subscription.subscriptionId);
        this.monitorClient = new arm_monitor_1.MonitorClient(subscription.credentials, Constants_1.Constants.subscriptionId);
    }
    getResourceManagementClient() {
        return this.resourceManagementClient;
    }
    getCommunicationManagementClient() {
        return this.communicationManagementClient;
    }
    getSecurityCenterClient() {
        return this.securityCenterClient;
    }
    getMonitorClient() {
        return this.monitorClient;
    }
    async getGenericClient(context) {
        if (this.genericClient === undefined) {
            this.genericClient = await (0, vscode_azext_azureutils_1.createGenericClient)(context, this.getClientInfo());
        }
        return this.genericClient;
    }
    getClientInfo() {
        return {
            credentials: new identity_1.DefaultAzureCredential(),
            environment: this.subscription.environment
        };
    }
}
exports.Client = Client;
//# sourceMappingURL=ClientUtils.js.map