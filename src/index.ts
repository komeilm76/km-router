import lib from './lib';

const kmRouter = lib;
export default kmRouter;

const routes = kmRouter.makeRoutes([
  {
    name: 'generator',
    path: '/generator',
    target: () => '',
  },
  {
    name: 'vpn',
    path: '/vpn',
    target: () => 2,
  },
]);

let x = kmRouter.makeRouter(routes, {});
