import { log } from './logger';
import { BaseProvider } from './base-provider';

export interface ClassProvider {
  provide: string;
  useClass: typeof BaseProvider;
}

export type ValueProvider = {
  provide: string;
  useValue: any;
};

export type FactoryProvider = {
  provide: string;
  useFactory: any;
};

export type NormalProvider = ValueProvider | FactoryProvider | ClassProvider;

export type Provider = ValueProvider | FactoryProvider | ClassProvider | (new (...args) => any);

export interface ContainerProps {
  providers: Provider[];
}

export class Container {
  private providers: Map<string, NormalProvider>;
  private instanceMap: Map<string, any>;
  public depsMap: Map<string, any>;

  constructor({ providers = [] }: ContainerProps) {
    this.instanceMap = new Map();
    // this._namespace = namespace;
    this.depsMap = new Map();
    this.providers = new Map();
    this.registerProviders(providers);
  }

  public getInstance(name: any) {
    let _name = typeof name === 'string' ? name : name.name;
    let instance = this.instanceMap.get(_name);
    if (!instance) {
      const def = this.providers.get(_name);
      if (!def) {
        throw new Error(`can not find any provider of ${_name}`);
      } else {
        if ((<ClassProvider>def).useClass) {
          const Construct = (<ClassProvider>def).useClass;
          instance = new Construct();
          this.instanceMap.set(_name, instance);
        } else if ((<ValueProvider>def).useValue) {
          instance = (<ValueProvider>def).useValue;
          this.instanceMap.set(_name, instance);
        } else if ((<FactoryProvider>def).useFactory) {
          instance = (<FactoryProvider>def).useFactory();
        } else {
          return;
        }
      }
    }
    return instance;
  }

  public registerProviders(providers: Provider[]) {
    providers.forEach((provider: Provider) => {
      let _provider: NormalProvider = provider as NormalProvider;
      if (
        !(
          (<ValueProvider>provider).useValue ||
          (<FactoryProvider>provider).useFactory ||
          (<ClassProvider>provider).useClass
        )
      ) {
        if (typeof (<any>provider) !== 'function') {
          throw new Error('提供的provider不是一个合法的Provider。');
        }
        _provider = {
          provide: (provider as any).name,
          useClass: provider as typeof BaseProvider,
        };
      }
      const exist = this.providers.get(_provider.provide);
      if (exist) {
        log('注册Provider失败，因为该令牌的Provider已经存在。');
      } else {
        this.providers.set(_provider.provide, _provider);
      }
    });
  }

  public getProviders(): Map<string, NormalProvider> {
    return this.providers;
  }

  public getInstanceMap(): Map<string, any> {
    return this.instanceMap;
  }
}
