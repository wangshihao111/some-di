# SOME-DI

依赖注入工具。

# USAGE

example:

```ts
import { createPool, BaseProvider } from '../index';

class ProOne extends BaseProvider<any> {
  constructor() {
    super();
    this.setState({ a: 1 });
  }
}

const { inject } = createPool({
  providers: [ProOne],
});

const pro1 = inject<ProOne>(ProOne);
console.log(pro1, pro1.state);
```

## 供应者类型

```ts
import { BaseProvider } from 'some-di';

export type ValueProvider = {
  provide: string;
  useValue: any;
};

export type FactoryProvider = {
  provide: string;
  useFactory: any;
};

export interface ClassProvider {
  provide: string;
  useClass: typeof BaeProvider;
}

// 也可以直接传递一个类到provider数组，但该类需要继承BaseProvider，例如

// import { BaseProvider, createRootContainer } from 'what-di';
class UserService extends BaseProvider {
  // ...
}

createRootContainer({
  providers: [
    UserService, // 直接使用类，注入时可以 inject('UserService') 或 inject(UserService)
  ],
  modules: [],
});
```

## 如何订阅状态 provider 实例状态？

如果使用 ClassProvider，需要继承 BaseProvider,BaseProvider 内置 subscribe 方法提供订阅；setState 方法用于设置状态。

如果是 ValueProvider 或 FactoryProvider，则需要自行实现订阅发布规则。

```ts
import { BaseProvider } from 'some-di';
type StateType = {
  name: string;
};

class Subscribable extends BaseProvider<StateType> {
  // ...
  fetch() {
    // ...
    this.setState(userData);
  }
}

// 订阅状态

const Subscribable = inject<Subscribable>(Subscribable);

const unsubscribe = Subscribable.subscribe((state: StateType) => {
  console.log(state);
});

// 在需要时取消订阅
unsubscribe();
```
