import { Container, ContainerProps } from './container';
// import { log } from './logger'

export interface Injector {
  <T = {}>(name: any): T;
}

/**
 * Create root IOC container
 * @param {RootContainerProps} props
 */
export function createPool(
  props: ContainerProps
): {
  container: Container;
  inject: Injector;
  Inject: (name: string) => (target: any, propName: any) => any;
} {
  const container = new Container({ ...props });
  function Inject(name) {
    return function (target, propName) {
      Reflect.defineProperty(target, propName, {
        get() {
          if (!this.value) {
            this.value = inject(name);
          }
          return this.value;
        },
      });
    };
  }
  function inject<T = {}>(name: any): T {
    if (!container) {
      throw new Error('root IOC container does not exists. ');
    }
    const instance = container?.getInstance(name);
    return instance;
  }
  return { container, inject, Inject };
}
