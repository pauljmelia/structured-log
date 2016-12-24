import './polyfill/objectAssign';

import { Pipeline } from './pipeline';
import { FilterStage } from './filterStage';
import { EnrichStage } from './enrichStage';
import { Logger } from './logger';
import { Sink } from './sink';
import { SinkStage } from './sinkStage';
import { ILogEvent, LogEventLevel } from './logEvent';
import { ILogEventLevelSwitch, LogEventLevelSwitch } from './logEventLevelSwitch';

type Predicate<T> = (T) => boolean;
type ObjectFactory = () => Object;

export interface IMinLevel<T> extends ILogEventLevelSwitch<T> {
  (level: LogEventLevel): T;
}

export class LoggerConfiguration {
  private pipeline: Pipeline;

  constructor(pipeline?: Pipeline) {
    this.pipeline = pipeline || new Pipeline();
  }

  public writeTo(sink: Sink): LoggerConfiguration {
    this.pipeline.addStage(new SinkStage(sink));
    return this;
  }

  public minLevel: IMinLevel<LoggerConfiguration> = Object.assign((levelOrLevelSwitch: LogEventLevel | LogEventLevelSwitch): LoggerConfiguration => {
    return levelOrLevelSwitch instanceof LogEventLevelSwitch
      ? this.filter(levelOrLevelSwitch.filter.bind(levelOrLevelSwitch))
      : this.filter(e => e.level <= levelOrLevelSwitch);
  }, {
    fatal: () => this.minLevel(LogEventLevel.fatal),
    error: () => this.minLevel(LogEventLevel.error),
    warning: () => this.minLevel(LogEventLevel.warning),
    information: () => this.minLevel(LogEventLevel.information),
    debug: () => this.minLevel(LogEventLevel.debug),
    verbose: () => this.minLevel(LogEventLevel.verbose)
  });

  public enrich(enricher: Object | ObjectFactory): LoggerConfiguration {
    if (enricher instanceof Function) {
      this.pipeline.addStage(new EnrichStage(enricher));
    } else if (enricher instanceof Object) {
      this.pipeline.addStage(new EnrichStage(() => enricher));
    } else {
      throw new Error('Argument "enricher" must be either a function or an object.');
    }

    return this;
  }

  public filter(predicate: Predicate<ILogEvent>): LoggerConfiguration {
    if (predicate instanceof Function) {
      this.pipeline.addStage(new FilterStage(predicate));
    } else {
      throw new Error('Argument "predicate" must be a function.');
    }

    return this;
  }

  public create(yieldErrors: boolean = false): Logger {
    if (!this.pipeline) {
      throw new Error('The logger for this configuration has already been created.');
    }

    this.pipeline.yieldErrors = yieldErrors;

    const pipeline = this.pipeline;
    this.pipeline = null;
    return new Logger(pipeline);
  }
}
