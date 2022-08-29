import { Alert, SecurityCenter } from "@azure/arm-security";
import { AzExtParentTreeItem, AzExtTreeItem, IActionContext } from "@microsoft/vscode-azext-utils";
import { AlertTreeItem } from "./AlertTreeItem";
import { AffectedResourceTreeItem } from "./AffectedResourceTreeItem";
import { Constants } from "../../Constants";
import { alertsFiltering } from "../../Commands/FilterVulnerabilities";
import { getConfigurationSettings } from "../../Utility/ConfigUtils";
import { TreeUtils } from "../../Utility/TreeUtils";
import { Alerts } from "./AlertModel";

export class AlertsTreeDataProvider extends AzExtParentTreeItem {
	private _children: AffectedResourceTreeItem[] = [];
	private _client!: SecurityCenter;
	private _title:string;
	private _nextLink: string | undefined;
	public label: string;
	public readonly contextValue: string = 'securityCenter.securityAlerts';
	private _apiUrl: string[]=[];
	public model:any[]=[new Alerts()];
	constructor(label: string, parent: AzExtParentTreeItem, client:SecurityCenter) {
		super(parent);
		this.label = label;
		this._title=label;
		this._client = client;
		this.iconPath = TreeUtils.getIconPath(Constants.alertIcon);
		this._apiUrl.push(Constants.getAlertListPath(this.subscription.subscriptionId));		this._apiUrl.push(Constants.getAlertListPath(this.subscription.subscriptionId));

	}
	public get apiUrl(): string[] {
		return this._apiUrl;
	}
	public set apiUrl(apiUrl: string[]) {
		this._apiUrl = apiUrl;
	}
	public async loadMoreChildrenImpl(): Promise<AzExtTreeItem[]> {

		if(this._children.length === 0) {
			let alertByResource: Map<string, AffectedResourceTreeItem> | undefined = new Map<string, AffectedResourceTreeItem>();
			const alerts = await (await this._client.alerts.list().byPage().next()).value;
			let resource: AffectedResourceTreeItem | undefined;
 			alerts.map((alert: Alert) => {
				const parameters = new URLParameters(alert.alertUri!);
				resource = alertByResource!.get(alert.compromisedEntity!);
				if (resource === undefined) {
					resource = new AffectedResourceTreeItem(alert.compromisedEntity!, this);
				}
				const alertItem = new AlertTreeItem(alert.alertDisplayName!, alert.severity!, alert.status!, resource, JSON.stringify(alert), alert.name!, parameters.getResourceGroupName(), parameters.getLocation(), alert.entities!, alert.alertUri!, alert.id!, this._client);
				resource.appendChildren(alertItem);
				alertByResource!.set(alert.compromisedEntity!, resource!);
			});

			this._children = Array.from(alertByResource.values());
			const alert=await this._client.alerts.getSubscriptionLevel('centralus','2517427022085381501_c5b3855b-b05c-4877-bf30-ff1c52e11ff7');
			resource = new AffectedResourceTreeItem(alert.compromisedEntity!, this);
			const alertItem = new AlertTreeItem(alert.alertDisplayName!, alert.severity!, alert.status!, resource, JSON.stringify(alert), alert.name!, 'tivan-onboard','centralus', alert.entities!, alert.alertUri!, alert.id!, this._client);
			resource.appendChildren(alertItem);
			this._children.unshift(resource);
		}
        
		const filteredAlerts = alertsFiltering(await getConfigurationSettings(Constants.extensionPrefix,Constants.filtering, this.subscription.subscriptionId), this._children);
		//this.label = `${this._title} (${filteredAlerts.length})`;
		return filteredAlerts;
	}

	public hasMoreChildrenImpl(): boolean {
		return this._nextLink !== undefined;
	}

}

export class URLParameters {

	private url: string;
	private location: string = "location/";
	private startResourceGroup: string = "resourceGroup/";
	private endResourceGroup: string = "/referencedFrom";
	constructor(url: string) {
		this.url = url;
 	}

	public getLocation(): string {
		const index = this.url.indexOf(this.location);
		return this.url.slice(index + this.location.length);
	}

	public getResourceGroupName(): string {
		const start = this.url.indexOf(this.startResourceGroup);
		const end = this.url.indexOf(this.endResourceGroup);
		return this.url.slice(start + this.startResourceGroup.length, end);
	}

}