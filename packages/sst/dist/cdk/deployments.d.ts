import * as cxapi from "@aws-cdk/cx-api";
import { AssetManifest, IManifestEntry } from "cdk-assets";
import { Tag } from "sst-aws-cdk/lib/cdk-toolkit.js";
import { BuildAssetsOptions, PublishAssetsOptions } from "sst-aws-cdk/lib/util/asset-publishing.js";
import { Mode } from "sst-aws-cdk/lib/api/aws-auth/credentials.js";
import { ISDK } from "sst-aws-cdk/lib/api/aws-auth/sdk.js";
import { SdkProvider } from "sst-aws-cdk/lib/api/aws-auth/sdk-provider.js";
import { DeployStackResult, DeploymentMethod } from "./deploy-stack.js";
import { EnvironmentResources } from "sst-aws-cdk/lib/api/environment-resources.js";
import { Template, ResourcesToImport, ResourceIdentifierSummaries } from "sst-aws-cdk/lib/api/util/cloudformation.js";
import { StackActivityProgress } from "sst-aws-cdk/lib/api/util/cloudformation/stack-activity-monitor.js";
import { HotswapMode } from "sst-aws-cdk/lib/api/hotswap/common.js";
/**
 * SDK obtained by assuming the lookup role
 * for a given environment
 */
export interface PreparedSdkWithLookupRoleForEnvironment {
    /**
     * The SDK for the given environment
     */
    readonly sdk: ISDK;
    /**
     * The resolved environment for the stack
     * (no more 'unknown-account/unknown-region')
     */
    readonly resolvedEnvironment: cxapi.Environment;
    /**
     * Whether or not the assume role was successful.
     * If the assume role was not successful (false)
     * then that means that the 'sdk' returned contains
     * the default credentials (not the assume role credentials)
     */
    readonly didAssumeRole: boolean;
    /**
     * An object for accessing the bootstrap resources in this environment
     */
    readonly envResources: EnvironmentResources;
}
export interface DeployStackOptions {
    /**
     * Stack to deploy
     */
    readonly stack: cxapi.CloudFormationStackArtifact;
    /**
     * Execution role for the deployment (pass through to CloudFormation)
     *
     * @default - Current role
     */
    readonly roleArn?: string;
    /**
     * Topic ARNs to send a message when deployment finishes (pass through to CloudFormation)
     *
     * @default - No notifications
     */
    readonly notificationArns?: string[];
    /**
     * Override name under which stack will be deployed
     *
     * @default - Use artifact default
     */
    readonly deployName?: string;
    /**
     * Don't show stack deployment events, just wait
     *
     * @default false
     */
    readonly quiet?: boolean;
    /**
     * Name of the toolkit stack, if not the default name
     *
     * @default 'CDKToolkit'
     */
    readonly toolkitStackName?: string;
    /**
     * List of asset IDs which should NOT be built or uploaded
     *
     * @default - Build all assets
     */
    readonly reuseAssets?: string[];
    /**
     * Stack tags (pass through to CloudFormation)
     */
    readonly tags?: Tag[];
    /**
     * Stage the change set but don't execute it
     *
     * @default - true
     * @deprecated Use 'deploymentMethod' instead
     */
    readonly execute?: boolean;
    /**
     * Optional name to use for the CloudFormation change set.
     * If not provided, a name will be generated automatically.
     *
     * @deprecated Use 'deploymentMethod' instead
     */
    readonly changeSetName?: string;
    /**
     * Select the deployment method (direct or using a change set)
     *
     * @default - Change set with default options
     */
    readonly deploymentMethod?: DeploymentMethod;
    /**
     * Force deployment, even if the deployed template is identical to the one we are about to deploy.
     * @default false deployment will be skipped if the template is identical
     */
    readonly force?: boolean;
    /**
     * Extra parameters for CloudFormation
     * @default - no additional parameters will be passed to the template
     */
    readonly parameters?: {
        [name: string]: string | undefined;
    };
    /**
     * Use previous values for unspecified parameters
     *
     * If not set, all parameters must be specified for every deployment.
     *
     * @default true
     */
    readonly usePreviousParameters?: boolean;
    /**
     * Display mode for stack deployment progress.
     *
     * @default - StackActivityProgress.Bar - stack events will be displayed for
     *   the resource currently being deployed.
     */
    readonly progress?: StackActivityProgress;
    /**
     * Whether we are on a CI system
     *
     * @default false
     */
    readonly ci?: boolean;
    /**
     * Rollback failed deployments
     *
     * @default true
     */
    readonly rollback?: boolean;
    readonly hotswap?: HotswapMode;
    /**
     * The extra string to append to the User-Agent header when performing AWS SDK calls.
     *
     * @default - nothing extra is appended to the User-Agent header
     */
    readonly extraUserAgent?: string;
    /**
     * List of existing resources to be IMPORTED into the stack, instead of being CREATED
     */
    readonly resourcesToImport?: ResourcesToImport;
    /**
     * If present, use this given template instead of the stored one
     *
     * @default - Use the stored template
     */
    readonly overrideTemplate?: any;
    /**
     * Whether to build/publish assets in parallel
     *
     * @default true To remain backward compatible.
     */
    readonly assetParallelism?: boolean;
}
interface AssetOptions {
    /**
     * Stack with assets to build.
     */
    readonly stack: cxapi.CloudFormationStackArtifact;
    /**
     * Name of the toolkit stack, if not the default name.
     *
     * @default 'CDKToolkit'
     */
    readonly toolkitStackName?: string;
    /**
     * Execution role for the building.
     *
     * @default - Current role
     */
    readonly roleArn?: string;
}
export interface BuildStackAssetsOptions extends AssetOptions {
    /**
     * Options to pass on to `buildAsests()` function
     */
    readonly buildOptions?: BuildAssetsOptions;
    /**
     * Stack name this asset is for
     */
    readonly stackName?: string;
}
interface PublishStackAssetsOptions extends AssetOptions {
    /**
     * Options to pass on to `publishAsests()` function
     */
    readonly publishOptions?: Omit<PublishAssetsOptions, "buildAssets">;
    /**
     * Stack name this asset is for
     */
    readonly stackName?: string;
}
export interface DestroyStackOptions {
    stack: cxapi.CloudFormationStackArtifact;
    deployName?: string;
    roleArn?: string;
    quiet?: boolean;
    force?: boolean;
    ci?: boolean;
}
export interface StackExistsOptions {
    stack: cxapi.CloudFormationStackArtifact;
    deployName?: string;
}
export interface DeploymentsProps {
    sdkProvider: SdkProvider;
    readonly toolkitStackName?: string;
    readonly quiet?: boolean;
}
/**
 * SDK obtained by assuming the deploy role
 * for a given environment
 */
export interface PreparedSdkForEnvironment {
    /**
     * The SDK for the given environment
     */
    readonly stackSdk: ISDK;
    /**
     * The resolved environment for the stack
     * (no more 'unknown-account/unknown-region')
     */
    readonly resolvedEnvironment: cxapi.Environment;
    /**
     * The Execution Role that should be passed to CloudFormation.
     *
     * @default - no execution role is used
     */
    readonly cloudFormationRoleArn?: string;
    /**
     * Access class for environmental resources to help the deployment
     */
    readonly envResources: EnvironmentResources;
}
/**
 * Scope for a single set of deployments from a set of Cloud Assembly Artifacts
 *
 * Manages lookup of SDKs, Bootstrap stacks, etc.
 */
export declare class Deployments {
    private readonly props;
    private readonly sdkProvider;
    private readonly sdkCache;
    private readonly publisherCache;
    private readonly environmentResources;
    constructor(props: DeploymentsProps);
    readCurrentTemplateWithNestedStacks(rootStackArtifact: cxapi.CloudFormationStackArtifact, retrieveProcessedTemplate?: boolean): Promise<Template>;
    readCurrentTemplate(stackArtifact: cxapi.CloudFormationStackArtifact): Promise<Template>;
    resourceIdentifierSummaries(stackArtifact: cxapi.CloudFormationStackArtifact): Promise<ResourceIdentifierSummaries>;
    deployStack(options: DeployStackOptions): Promise<DeployStackResult | undefined>;
    destroyStack(options: DestroyStackOptions): Promise<void>;
    stackExists(options: StackExistsOptions): Promise<boolean>;
    private prepareSdkWithLookupOrDeployRole;
    /**
     * Get the environment necessary for touching the given stack
     *
     * Returns the following:
     *
     * - The resolved environment for the stack (no more 'unknown-account/unknown-region')
     * - SDK loaded with the right credentials for calling `CreateChangeSet`.
     * - The Execution Role that should be passed to CloudFormation.
     */
    prepareSdkFor(stack: cxapi.CloudFormationStackArtifact, roleArn: string | undefined, mode: Mode): Promise<PreparedSdkForEnvironment>;
    /**
     * Try to use the bootstrap lookupRole. There are two scenarios that are handled here
     *  1. The lookup role may not exist (it was added in bootstrap stack version 7)
     *  2. The lookup role may not have the correct permissions (ReadOnlyAccess was added in
     *      bootstrap stack version 8)
     *
     * In the case of 1 (lookup role doesn't exist) `forEnvironment` will either:
     *   1. Return the default credentials if the default credentials are for the stack account
     *   2. Throw an error if the default credentials are not for the stack account.
     *
     * If we successfully assume the lookup role we then proceed to 2 and check whether the bootstrap
     * stack version is valid. If it is not we throw an error which should be handled in the calling
     * function (and fallback to use a different role, etc)
     *
     * If we do not successfully assume the lookup role, but do get back the default credentials
     * then return those and note that we are returning the default credentials. The calling
     * function can then decide to use them or fallback to another role.
     */
    prepareSdkWithLookupRoleFor(stack: cxapi.CloudFormationStackArtifact): Promise<PreparedSdkWithLookupRoleForEnvironment>;
    private prepareAndValidateAssets;
    /**
     * Build all assets in a manifest
     *
     * @deprecated Use `buildSingleAsset` instead
     */
    buildAssets(asset: cxapi.AssetManifestArtifact, options: BuildStackAssetsOptions): Promise<void>;
    /**
     * Publish all assets in a manifest
     *
     * @deprecated Use `publishSingleAsset` instead
     */
    publishAssets(asset: cxapi.AssetManifestArtifact, options: PublishStackAssetsOptions): Promise<void>;
    /**
     * Build a single asset from an asset manifest
     */
    buildSingleAsset(assetArtifact: cxapi.AssetManifestArtifact, assetManifest: AssetManifest, asset: IManifestEntry, options: BuildStackAssetsOptions): Promise<void>;
    /**
     * Publish a single asset from an asset manifest
     */
    publishSingleAsset(assetManifest: AssetManifest, asset: IManifestEntry, options: PublishStackAssetsOptions): Promise<void>;
    /**
     * Return whether a single asset has been published already
     */
    isSingleAssetPublished(assetManifest: AssetManifest, asset: IManifestEntry, options: PublishStackAssetsOptions): Promise<boolean>;
    /**
     * Validate that the bootstrap stack has the right version for this stack
     *
     * Call into envResources.validateVersion, but prepend the stack name in case of failure.
     */
    validateBootstrapStackVersion(stackName: string, requiresBootstrapStackVersion: number | undefined, bootstrapStackVersionSsmParameter: string | undefined, envResources: EnvironmentResources): Promise<void>;
    private cachedSdkForEnvironment;
    private cachedPublisher;
}
/**
 * @deprecated Use 'Deployments' instead
 */
export declare class CloudFormationDeployments extends Deployments {
}
export {};
