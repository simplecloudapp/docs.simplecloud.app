import { isbot } from "isbot";
import { Duplex } from "node:stream";
import * as ReactDOMServer from "react-dom/server";
import type { AppLoadContext, EntryContext } from "react-router";
import { ServerRouter, type HandleErrorFunction } from "react-router";

// Handle both ESM and CommonJS versions of react-dom/server
const getRenderer = () => {
  // Try ESM first
  if (typeof ReactDOMServer.renderToReadableStream === "function") {
    return {
      type: "readable" as const,
      renderer: ReactDOMServer.renderToReadableStream,
    };
  }
  if (typeof ReactDOMServer.renderToPipeableStream === "function") {
    return {
      type: "pipeable" as const,
      renderer: ReactDOMServer.renderToPipeableStream,
    };
  }

  // Handle CommonJS case
  const commonJSModule = ReactDOMServer as unknown as {
    default: typeof ReactDOMServer;
  };
  if (typeof commonJSModule.default?.renderToReadableStream === "function") {
    return {
      type: "readable" as const,
      renderer: commonJSModule.default.renderToReadableStream,
    };
  }
  if (typeof commonJSModule.default?.renderToPipeableStream === "function") {
    return {
      type: "pipeable" as const,
      renderer: commonJSModule.default.renderToPipeableStream,
    };
  }

  throw new Error(
    "Could not find renderToReadableStream or renderToPipeableStream in react-dom/server"
  );
};

const { type, renderer } = getRenderer();

const ABORT_DELAY = 5_000;

export const handleError: HandleErrorFunction = (error, { request }) => {
  if (!request.signal.aborted) {
    console.error(error);
  }
};

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext: AppLoadContext
) {
  const userAgent = request.headers.get("user-agent");
  const isBotOrSpa = (userAgent && isbot(userAgent)) || routerContext.isSpaMode;

  try {
    if (type === "readable") {
      const stream = await renderer(
        <ServerRouter context={routerContext} url={request.url} />,
        {
          signal: AbortSignal.timeout(ABORT_DELAY),
          onError(error: unknown) {
            console.error(error);
            responseStatusCode = 500;
          },
        }
      );

      if (isBotOrSpa) {
        await stream.allReady;
      }

      responseHeaders.set("Content-Type", "text/html");
      return new Response(stream, {
        headers: responseHeaders,
        status: responseStatusCode,
      });
    } else {
      // Handle pipeable stream
      let didError = false;
      const chunks: Buffer[] = [];

      await new Promise<void>((resolve, reject) => {
        const stream = renderer(
          <ServerRouter context={routerContext} url={request.url} />,
          {
            onShellError(error: unknown) {
              didError = true;
              console.error(error);
              responseStatusCode = 500;
              reject(error);
            },
            onAllReady() {
              const duplex = new Duplex({
                write(chunk, _encoding, callback) {
                  chunks.push(Buffer.from(chunk));
                  callback();
                },
                read() {},
              });

              stream.pipe(duplex);
              resolve();
            },
            onError(error: unknown) {
              didError = true;
              console.error(error);
              responseStatusCode = 500;
              reject(error);
            },
          }
        );
      });

      responseHeaders.set("Content-Type", "text/html");

      if (didError) {
        throw new Error("An error occurred while rendering");
      }

      return new Response(Buffer.concat(chunks), {
        headers: responseHeaders,
        status: responseStatusCode,
      });
    }
  } catch (error) {
    responseStatusCode = 500;
    throw error;
  }
}
