"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubConnectorTreeItem = void 0;
const ConnecorOfferingTreeItem_1 = require("./ConnecorOfferingTreeItem");
const ConnectorTreeItem_1 = require("./ConnectorTreeItem");
class GithubConnectorTreeItem extends ConnectorTreeItem_1.ConnectorTreeItem {
    constructor(label, plans, parent) {
        super(label, plans, parent);
        this.offeringsOptions = [];
        this.offeringsOptions = [
        //TODO:github types of offering
        //       KnownOfferingType.CspmMonitorAws, KnownOfferingType.DefenderForContainersAws, KnownOfferingType.DefenderForServersAws, KnownOfferingType.InformationProtectionAws
        ];
    }
    async loadMoreChildrenImpl() {
        this.children = this.offeringsOptions.map((offering) => {
            const enable = this.concreteOfferings.findIndex(o => o.description === offering) !== -1;
            return new ConnecorOfferingTreeItem_1.ConnectorOffering(offering.toString(), this, enable);
        });
        return this.children;
    }
    hasMoreChildrenImpl() {
        throw new Error("Method not implemented.");
    }
}
exports.GithubConnectorTreeItem = GithubConnectorTreeItem;
//# sourceMappingURL=GithubConnectorTreeItem.js.map