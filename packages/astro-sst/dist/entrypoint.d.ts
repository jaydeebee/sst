import type { SSRManifest } from "astro";
import type { APIGatewayProxyEventV2, CloudFrontRequestEvent } from "aws-lambda";
import type { ResponseMode, ResponseStream } from "./lib/types";
export declare function createExports(manifest: SSRManifest, { responseMode }: {
    responseMode: ResponseMode;
}): {
    handler: import("./lib/types").RequestHandler | ((event: APIGatewayProxyEventV2 | CloudFrontRequestEvent) => Promise<string | void | import("aws-lambda").CloudFrontRequest | import("aws-lambda").APIGatewayProxyStructuredResultV2 | import("aws-lambda").APIGatewayProxyResult | import("aws-lambda").CloudFrontResultResponse | null>);
};
export declare function streamError(statusCode: number, error: string | Error, responseStream: ResponseStream): void;
