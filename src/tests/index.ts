import { createPool, BaseProvider } from '../index';

class ProOne extends BaseProvider<{}> {
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
