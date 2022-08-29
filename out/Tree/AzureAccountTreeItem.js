"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureAccountTreeItem = void 0;
const vscode_azext_azureutils_1 = require("@microsoft/vscode-azext-azureutils");
const SubscriptionTreeItem_1 = require("./SubscriptionTreeItem");
class AzureAccountTreeItem extends vscode_azext_azureutils_1.AzureAccountTreeItemBase {
    constructor() {
        super();
        this.subscriptions = [];
    }
    createSubscriptionTreeItem(root) {
        this.subscriptions.push(root);
        return new SubscriptionTreeItem_1.SubscriptionTreeItem(this, root);
    }
    getSubscriptions() {
        return this.subscriptions;
    }
}
exports.AzureAccountTreeItem = AzureAccountTreeItem;
//# sourceMappingURL=AzureAccountTreeItem.js.map