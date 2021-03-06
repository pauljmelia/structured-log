import "./polyfills/objectAssign";
export { LogEventLevel } from "./logEvent";
export { Logger } from "./logger";
export { ConsoleSink } from "./consoleSink";
export { BatchedSink } from "./batchedSink";
export { DynamicLevelSwitch } from "./dynamicLevelSwitch";
export { MessageTemplate } from "./messageTemplate";
import { LoggerConfiguration } from "./loggerConfiguration";
export declare function configure(): LoggerConfiguration;
export { LoggerConfiguration };
