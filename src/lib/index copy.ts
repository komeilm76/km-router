// import kmLineup from 'km-lineup';
// import _, { before } from 'lodash';
// import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';

// export type IRouteEntry<NAME extends string> = {
//   name: NAME;
//   path: string;
//   target: unknown;
//   meta?: {
//     [key: string]: any;
//   };
//   guard?: () => boolean;
//   beforeChange?: () => boolean;
//   afterChange?: () => boolean;
//   onChange?: () => boolean;
// };
// export type IReservedRoute<NAME extends string = string, KEY extends string = string> = {
//   reservedKey: KEY;
// } & IRouteEntry<NAME>;
// export type INormalRoute<NAME extends string> = {} & IRouteEntry<NAME>;
// export type IRoute<NAME extends string> = IReservedRoute<NAME> | INormalRoute<NAME>;
// export type IConfig<ROUTE extends IRoute<NAME>, NAME extends string> = {
//   action: (...args: [ROUTE]) => void;
//   beforeChange?: (...args: [ROUTE, () => void]) => void;
//   onChange?: (...args: [ROUTE, () => void]) => void;
//   afterChange?: (...args: [ROUTE, () => void]) => void;
// };

// export type IRedirectOptions<
//   ROUTES extends ROUTE[],
//   ROUTE extends IRoute<NAME>,
//   NAME extends string
// > = { name: ROUTES[number]['name'] | NAME };
// // const makeRoute = <ROUTE extends IRoute<NAME>, NAME extends string>(route: ROUTE) => {
// //   return route;
// // };

// const makeRoutes = <
//   NAME extends string = string,
//   ROUTE extends IRoute<NAME> = IRoute<NAME>,
//   ROUTES extends ROUTE[] = ROUTE[],
//   ALL_ROUTES extends [...ROUTES] = [...ROUTES]
// >(
//   routes: [...ALL_ROUTES]
// ) => {
//   return routes;
// };

// const setReservedRoute = <
//   NAME extends string,
//   KEY extends string,
//   ROUTE_ENTRY extends IReservedRoute<NAME, KEY>
// >(
//   route: ROUTE_ENTRY
// ) => {
//   return {
//     ...route,
//   };
// };

// const set404Route = <ROUTE_ENTRY extends IRouteEntry<NAME>, NAME extends string>(
//   route: ROUTE_ENTRY
// ) => {
//   return setReservedRoute({
//     ...route,
//     reservedKey: '404',
//   });
// };
// const set403Route = <ROUTE_ENTRY extends IRouteEntry<NAME>, NAME extends string>(
//   route: ROUTE_ENTRY
// ) => {
//   return setReservedRoute({
//     ...route,
//     reservedKey: '403',
//   });
// };
// const setDefaultRoute = <ROUTE_ENTRY extends IRouteEntry<NAME>, NAME extends string>(
//   route: ROUTE_ENTRY
// ) => {
//   return setReservedRoute({
//     ...route,
//     reservedKey: 'default',
//   });
// };
// const get404Route = <ROUTES extends IRoute<NAME>[], NAME extends string>(routes: [...ROUTES]) => {
//   let output = routes.find((item) => {
//     if ((item as IReservedRoute).reservedKey == '404') {
//       return item;
//     } else {
//       return undefined;
//     }
//   }) ?? {
//     name: '404',
//     path: '/404',
//     target: '',
//     reversedKey: '404',
//   };
//   return output;
// };
// const get403Route = <ROUTES extends IRoute<NAME>[], NAME extends string>(routes: [...ROUTES]) => {
//   let output = routes.find((item) => {
//     if ((item as IReservedRoute).reservedKey == '403') {
//       return item;
//     } else {
//       return undefined;
//     }
//   }) ?? {
//     name: '403',
//     path: '/403',
//     target: '',
//     reversedKey: '403',
//   };
//   return output;
// };
// const getDefaultRoute = <ROUTES extends IRoute<NAME>[], NAME extends string>(
//   routes: [...ROUTES]
// ) => {
//   let output = routes.find((item) => {
//     if ((item as IReservedRoute).reservedKey == 'default') {
//       return item;
//     } else {
//       return undefined;
//     }
//   }) ?? {
//     name: 'default',
//     path: '/default',
//     target: '',
//     reversedKey: 'default',
//   };
//   return output;
// };

// const makeRouter = <ROUTES extends ROUTE[], ROUTE extends IRoute<NAME>, NAME extends string>(
//   routes: [...ROUTES],
//   config: IConfig<ROUTE, NAME>
// ) => {
//   const routerHistory: ROUTE[] = [];
//   const currentRoute = new BehaviorSubject<ROUTES[number] | undefined>(undefined);
//   // listener
//   const requestListener = new ReplaySubject<ROUTES[number]>();
//   const existListener = new ReplaySubject<ROUTES[number]>();
//   const guardListener = new ReplaySubject<ROUTES[number]>();
//   // const beforeChange = new ReplaySubject<ROUTES[number]>(1);
//   // const onChange = new ReplaySubject<ROUTES[number]>(1);
//   // const afterChange = new ReplaySubject<ROUTES[number]>(1);

//   const _404RouteController = () => {
//     let currentRoute = requestListener.getValue();
//     currentRoute && routerHistory.push(currentRoute as ROUTE);
//     let _404 = get404Route(routes);
//     requestListener.next(_404 as ROUTES[number]);
//   };

//   const getRedirectRoute = <
//     NAME extends string,
//     OPTIONS extends { name: ROUTES[number]['name'] | NAME }
//   >(
//     options: OPTIONS
//   ) => {
//     let findedRoute = routes.find((item) => {
//       return item.name == options.name;
//     });
//     return findedRoute;
//   };

//   const forward = (
//     key: 'default' | '404' | '403',
//     subscriber: ReplaySubject<ROUTES[number]> | BehaviorSubject<ROUTES[number]>
//   ) => {
//     if (key == '404') {
//       const route = get404Route(routes);
//       subscriber.next(route as ROUTES[number]);
//     }
//     if (key == '403') {
//       const route = get403Route(routes);
//       subscriber.next(route as ROUTES[number]);
//     }
//     if (key == 'default') {
//       const route = getDefaultRoute(routes);
//       subscriber.next(route as ROUTES[number]);
//     }
//   };

//   const _404Controller = (
//     route: ROUTE | undefined,
//     subscriber: ReplaySubject<ROUTES[number]> | BehaviorSubject<ROUTES[number]>
//   ) => {
//     if (route) {
//     } else {
//       forward('404', subscriber);
//     }
//   };
//   const _403Controller = (
//     route: ROUTE | undefined,
//     subscriber: ReplaySubject<ROUTES[number]> | BehaviorSubject<ROUTES[number]>
//   ) => {
//     if (route) {
//     } else {
//       forward('403', subscriber);
//     }
//   };
//   const _defaultController = (
//     route: ROUTE | undefined,
//     subscriber: ReplaySubject<ROUTES[number]>
//   ) => {
//     if (route) {
//     } else {
//       forward('default', subscriber);
//     }
//   };

//   const routeRedirectController = (
//     route: ROUTE | undefined,
//     subscriber: ReplaySubject<ROUTES[number]>
//   ) => {};

//   return {
//     hooks: {
//       beforeChange,
//       onChange,
//       afterChange,
//     },
//     history: routerHistory,
//     redirect: <NAME extends string, OPTIONS extends { name: ROUTES[number]['name'] | NAME }>(
//       options: OPTIONS
//     ) => {
//       let findedRoute = getRedirectRoute(options);
//       _404Controller(findedRoute, beforeChange);

//       if (findedRoute) {
//         if (findedRoute.guard) {
//           if (findedRoute.guard() == true) {
//             let currentRoute = requestListener.getValue();
//             currentRoute && routerHistory.push(currentRoute as ROUTE);
//             requestListener.next(findedRoute);
//           } else {
//             let currentRoute = requestListener.getValue();
//             currentRoute && routerHistory.push(currentRoute as ROUTE);
//             let _403 = get403Route(routes);
//             requestListener.next(_403 as ROUTES[number]);
//           }
//         } else {
//           let currentRoute = requestListener.getValue();
//           currentRoute && routerHistory.push(currentRoute as ROUTE);
//           requestListener.next(findedRoute);
//         }
//       } else {
//         let currentRoute = requestListener.getValue();
//         currentRoute && routerHistory.push(currentRoute as ROUTE);
//         let _404 = get404Route(routes);
//         requestListener.next(_404 as ROUTES[number]);
//       }
//     },
//     back: () => {
//       let route = _.last(routerHistory);
//       route && requestListener.next(route);
//     },
//   };
// };

// const staticRoute = {
//   set403Route,
//   set404Route,
//   setDefaultRoute,
//   get403Route,
//   get404Route,
//   getDefaultRoute,
// };

// export const defineRouter = () => {
//   return {
//     makeRouter,
//     makeRoutes,
//     staticRoute,
//   };
// };

// export default {
//   makeRouter,
//   makeRoutes,
//   staticRoute,
// };
