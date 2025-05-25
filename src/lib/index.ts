import kmList from 'km-list';
import _ from 'lodash';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';

type IRouteType = 'not_founded' | 'forbiden' | 'default' | 'custom';

export type IRouteEntry<NAME extends string> = {
  name: NAME;
  path: `/${string}`;
  target: (router?: IRouter<NAME>) => unknown;
  type?: IRouteType;
  meta?: {
    [key: string]: any;
  };
  guard?: (v: IRouteOutput, next: () => void, fail: () => void) => void;
  beforeChange?: (v: IRouteOutput, next: () => void) => void;
  afterChange?: (v: IRouteOutput, next: () => void) => void;
  onChange?: (v: IRouteOutput, next: () => void) => void;
};

export type IRouteOutput<NAME extends string = string> = {
  name: NAME;
  path: `/${string}`;
  target: (router?: IRouter<NAME>) => unknown;
  type: IRouteType;
  meta?: {
    [key: string]: any;
  };
  guard?: (v: IRouteOutput, next: () => void, fail: () => void) => void;
  beforeChange?: (v: IRouteOutput, next: () => void) => void;
  afterChange?: (v: IRouteOutput, next: () => void) => void;
  onChange?: (v: IRouteOutput, next: () => void) => void;
  instanceId?: string;
  requestType?: 'redirect' | 'back-history';
};

export type IConfig<ROUTE extends IRouteOutput<NAME>, NAME extends string> = {
  // targetAction: (...args: [ROUTE]) => void;
  beforeChange?: (...args: [ROUTE, () => void]) => void;
  onChange?: (...args: [ROUTE, () => void]) => void;
  afterChange?: (...args: [ROUTE, () => void]) => void;
  defaultRoute?: NAME;
};

type IDefaultRoutes = { [key in Exclude<IRouteType, 'custom'>]: IRouteOutput };
const defaultRoutes: IDefaultRoutes = {
  forbiden: {
    name: 'forbiden',
    path: '/forbiden',
    target: () => 'forbiden route',
    type: 'forbiden',
  },
  not_founded: {
    name: 'not_founded',
    path: '/not_founded',
    target: () => 'not_founded route',
    type: 'not_founded',
  },
  default: {
    name: 'default',
    path: '/default',
    target: () => 'default route',
    type: 'default',
  },
};

const makeRoutes = <
  NAME extends string = string,
  ROUTE_ENTRY extends IRouteEntry<NAME> = IRouteEntry<NAME>,
  ROUTES_ENTRY extends ROUTE_ENTRY[] = ROUTE_ENTRY[],
  ROUTE_OUTPUT extends IRouteOutput<ROUTES_ENTRY[number]['name']> = IRouteOutput<
    ROUTES_ENTRY[number]['name']
  >,
  ROUTES_OUTPUT extends ROUTE_OUTPUT[] = ROUTE_OUTPUT[]
>(
  routes: IRouteEntry<NAME>[]
) => {
  // @ts-ignore
  let modifiedRoutes = routes.map((item) => {
    return {
      name: item.name,
      path: item.path,
      target: item.target,
      meta: item.meta,
      guard: item.guard,
      beforeChange: item.beforeChange,
      afterChange: item.afterChange,
      onChange: item.onChange,
      type: item.type ?? 'custom',
    };
  });
  let output: [...ROUTES_OUTPUT] = [...modifiedRoutes, ...Object.values(defaultRoutes)] as [
    ...ROUTES_OUTPUT
  ];

  return output;
};

const makeRouter = <ROUTES extends ROUTE[], ROUTE extends IRouteOutput<NAME>, NAME extends string>(
  routes: [...ROUTES],
  config: IConfig<[...ROUTES][number], ROUTES[number]['name']>
) => {
  let routerHistory = new BehaviorSubject<ROUTE[]>([]);
  const currentRoute = new BehaviorSubject<ROUTES[number] | undefined>(undefined);
  const currentTarget = new BehaviorSubject<ROUTES[number]['target'] | undefined>(undefined);
  // listener
  const requestListener = new ReplaySubject<ROUTES[number] | undefined>();
  const existListener = new ReplaySubject<ROUTES[number]>();
  const guardListener = new ReplaySubject<ROUTES[number]>();
  const beforeListener = new ReplaySubject<ROUTES[number]>();
  const onChangeListener = new ReplaySubject<ROUTES[number]>();
  const afterListener = new ReplaySubject<ROUTES[number]>();

  // const getDefaultRouteInInitialize = () => {
  //   const findedRoute = routes.find((item) => {
  //     return item.name == config.defaultRoute;
  //   });

  //   requestListener.next(findedRoute);
  // };

  const getRouteByType = (entryType: keyof IDefaultRoutes) => {
    const findedRoute =
      routes.find((item) => {
        return item.type == entryType;
      }) ?? defaultRoutes[entryType];
    return findedRoute;
  };
  const existController = (route: ROUTE | undefined, subscriber: ReplaySubject<ROUTES[number]>) => {
    if (route) {
      subscriber.next(route);
    } else {
      requestListener.next(getRouteByType('not_founded') as ROUTES[number]);
    }
  };
  const guardController = (route: ROUTE, subscriber: ReplaySubject<ROUTES[number]>) => {
    if (route.guard) {
      route.guard(
        route,
        () => {
          subscriber.next(route);
        },
        () => {
          requestListener.next(getRouteByType('forbiden') as ROUTES[number]);
        }
      );
    } else {
      subscriber.next(route);
    }
  };
  const beforeController = (route: ROUTE, subscriber: ReplaySubject<ROUTES[number]>) => {
    const routeController = () => {
      if (route.beforeChange) {
        route.beforeChange(route, () => {
          subscriber.next(route);
        });
      } else {
        subscriber.next(route);
      }
    };
    if (config.beforeChange) {
      config.beforeChange(route, () => {
        routeController();
      });
    } else {
      routeController();
    }
  };
  const onChangeController = (route: ROUTE, subscriber: ReplaySubject<ROUTES[number]>) => {
    const routeController = () => {
      if (route.onChange) {
        route.onChange(route, () => {
          currentRoute.next(route);
          subscriber.next(route);
        });
      } else {
        currentRoute.next(route);
        subscriber.next(route);
      }

      if (route.requestType == 'back-history') {
        let findedIndex = routerHistory
          .getValue()
          .findIndex((item) => item.instanceId == route.instanceId);
        routerHistory.next(kmList.removeElementAtIndexes(routerHistory.getValue(), [findedIndex]));
      } else {
        const lastRouteInHistory = _.last(routerHistory.getValue());
        if (lastRouteInHistory) {
          if (lastRouteInHistory.name !== route.name) {
            routerHistory.next(kmList.addElementAtLastIndex(routerHistory.getValue(), route));
          }
        } else {
          routerHistory.next(kmList.addElementAtLastIndex(routerHistory.getValue(), route));
        }
      }
    };
    if (config.onChange) {
      config.onChange(route, () => {
        routeController();
      });
    } else {
      routeController();
    }
  };
  const afterController = (route: ROUTE, subscriber: ReplaySubject<ROUTES[number]>) => {
    const routeController = () => {
      if (route.afterChange) {
        route.afterChange(route, () => {
          subscriber.next(route);
        });
      } else {
        subscriber.next(route);
      }
    };
    if (config.afterChange) {
      config.afterChange(route, () => {
        routeController();
      });
    } else {
      routeController();
    }
  };
  requestListener.subscribe((route) => {
    existController(route, existListener);
  });
  existListener.subscribe((route) => {
    guardController(route, guardListener);
  });
  guardListener.subscribe((route) => {
    beforeController(route, beforeListener);
  });
  beforeListener.subscribe((route) => {
    onChangeController(route, onChangeListener);
  });
  onChangeListener.subscribe((route) => {
    afterController(route, afterListener);
  });
  // afterListener.subscribe((route) => {
  //   console.log(':))', route);
  // });
  const redirect = <
    NAME extends string,
    OPTIONS extends { name: ROUTES[number]['name'] } | { name: NAME }
  >(
    options: OPTIONS
  ) => {
    let findedRoute = routes.find((item) => {
      return item.name == options.name;
    });
    const route: ROUTES[number] | undefined = findedRoute
      ? { ...findedRoute, instanceId: findedRoute.instanceId ?? uuidV4(), requestType: 'redirect' }
      : undefined;

    requestListener.next(route);
  };

  const getRouteInfo = <
    NAME extends string,
    OPTIONS extends { name: ROUTES[number]['name'] } | { name: NAME }
  >(
    options: OPTIONS
  ) => {
    let findedRoute = routes.find((item) => {
      return item.name == options.name;
    });
    const route: ROUTES[number] | undefined = findedRoute;

    return route;
  };

  const back = () => {
    let route = _.last(routerHistory.getValue());
    route && requestListener.next({ ...route, requestType: 'back-history' });
  };
  currentRoute.subscribe((route) => {
    if (route) {
      currentTarget.next(route.target);
    }
  });

  if (config.defaultRoute) {
    redirect({ name: config.defaultRoute });
  }
  // getDefaultRouteInInitialize();
  return {
    getRouteInfo,
    redirect,
    back,
    beforeChange: beforeListener,
    onChange: onChangeListener,
    afterChange: afterListener,
    currentRoute,
    currentTarget,
    history: routerHistory,
  };
};

export type IRouter<NAMES> = {
  getRouteInfo: (config: { name: NAMES }) => IRouteOutput;
  redirect: (config: { name: NAMES }) => void;
  back: () => void;
};

export const defineRouter = () => {
  return {
    makeRouter,
    makeRoutes,
    // staticRoute,
  };
};

export default {
  makeRouter,
  makeRoutes,
  // staticRoute,
};
