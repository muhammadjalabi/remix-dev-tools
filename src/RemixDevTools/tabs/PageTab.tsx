import { useMatches, useRevalidator } from "@remix-run/react";
import { CornerDownRight } from "lucide-react";
import clsx from "clsx";
import { JsonRenderer } from "../components/jsonRenderer";
import { useGetSocket } from "../hooks/useGetSocket";
import { Tag } from "../components/Tag";
import { VsCodeButton } from "../components/VScodeButton";

interface PageTabProps {}
export const ROUTE_COLORS: Record<string, string> = {
  ROUTE: "rdt-bg-green-500 rdt-text-white",
  LAYOUT: "rdt-bg-blue-500 rdt-text-white",
  ROOT: "rdt-bg-purple-500 rdt-text-white",
};

const getLoaderData = (data: string | Record<string, any>) => {
  if (typeof data === "string") {
    try {
      const temp = JSON.parse(data);
      delete temp.remixDevTools;
      return JSON.stringify(temp, null, 2);
    } catch (e) {
      return data;
    }
  }
  if (data?.remixDevTools) delete data.remixDevTools;
  return data;
};
const getOriginalData = (data: string | Record<string, any>) => {
  if (typeof data === "string") {
    try {
      const val = JSON.parse(data);
      return val;
    } catch (e) {
      return data;
    }
  }
  return data;
};
const PageTab = ({}: PageTabProps) => {
  const routes = useMatches();
  const reversed = routes.reverse();
  const { revalidate, state } = useRevalidator();
  const { isConnected, sendJsonMessage } = useGetSocket();
  return (
    <div className="rdt-flex rdt-h-[40vh] rdt-overflow-y-auto rdt-flex-col rdt-relative rdt-p-6 rdt-px-6">
      <button
        onClick={() => revalidate()}
        className={clsx(
          "rdt-absolute rdt-z-20 rdt-right-4 rdt-top-0 rdt-cursor-pointer rdt-rounded-lg rdt-bg-green-500 rdt-text-white rdt-px-3 rdt-py-1 rdt-font-semibold rdt-text-sm",
          state !== "idle" && "rdt-opacity-50 rdt-pointer-events-none"
        )}
      >
        {state !== "idle" ? "Revalidating..." : "Revalidate"}
      </button>
      <ol
        className={clsx(
          "rdt-relative rdt-border-l rdt-border-gray-700",
          state === "loading" && "rdt-opacity-50 rdt-pointer-events-none"
        )}
      >
        {reversed.map((route) => {
          const loaderData = getLoaderData(route.data);
          const originalData = getOriginalData(route.data);

          const isRoot = route.id === "root";
          const lastPart = route.id.split("/").pop();
          const isLayout =
            lastPart?.split(".")?.length === 1 &&
            (lastPart?.startsWith("_") || lastPart?.startsWith("__")) &&
            lastPart !== "_index" &&
            "index";

          return (
            <li key={route.id} className="rdt-mb-8 rdt-ml-8">
              <span className="rdt-absolute rdt-flex rdt-items-center rdt-justify-center rdt-w-6 rdt-h-6 rdt-bg-blue-900 rdt-rounded-full -rdt-left-3 rdt-ring-4 rdt-mt-2 rdt-ring-blue-900  ">
                <CornerDownRight />
              </span>
              <h3 className="rdt-flex rdt-items-center -rdt-mt-3 rdt-mb-1 rdt-text-lg rdt-font-semibold rdt-text-white rdt-gap-2">
                {route.pathname}
                <Tag color={isRoot ? "PURPLE" : isLayout ? "BLUE" : "GREEN"}>
                  {isRoot ? "ROOT" : isLayout ? "LAYOUT" : "ROUTE"}
                </Tag>

                {isConnected && (
                  <VsCodeButton
                    onClick={() =>
                      sendJsonMessage({
                        type: "open-vscode",
                        data: { route: route.id },
                      })
                    }
                  />
                )}
              </h3>
              <div className="rdt-mb-4">
                <time className="rdt-block rdt-mb-2 rdt-text-sm rdt-font-normal rdt-leading-none rdt-text-gray-500  ">
                  Route location: {route.id}
                </time>
                <div className="rdt-flex rdt-gap-16">
                  {loaderData && (
                    <div className="rdt-mb-4 rdt-text-base rdt-max-w-md rdt-overflow-x-hidden rdt-font-normal rdt-text-gray-400">
                      Route loader data:
                      {<JsonRenderer data={loaderData} />}
                    </div>
                  )}
                  {route.params && Object.keys(route.params).length > 0 && (
                    <div className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
                      Route params:
                      <JsonRenderer data={route.params} />
                    </div>
                  )}
                  {route.handle && Object.keys(route.handle).length > 0 && (
                    <div className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
                      Route handle:
                      <JsonRenderer data={route.handle} />
                    </div>
                  )}
                  {originalData?.remixDevTools?.timers?.length && (
                    <div className="rdt-mb-4 rdt-text-base rdt-font-normal  rdt-text-gray-400">
                      <div className="rdt-mb-1">
                        Registered timers for route:
                      </div>
                      {originalData?.remixDevTools?.timers.map(
                        (timer: { name: string; duration: number }) => {
                          return (
                            <div
                              key={timer.name}
                              className="rdt-text-sm rdt-flex rdt-gap-4 rdt-justify-between rdt-font-normal rdt-text-white"
                            >
                              <div>{timer.name} </div>
                              <div>
                                {(timer.duration / 1000).toPrecision(2)}s (
                                {timer.duration}ms)
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

export { PageTab };
