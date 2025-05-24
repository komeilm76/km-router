import lib from './lib';

const kmRouter = lib;
export default kmRouter;

const routes = kmRouter.makeRoutes([
  {
    name: 'home',
    path: '/home',
    target: () => {},
  },
  {
    name: 'login',
    path: '/login',
    target: () => {},
  },
  {
    name: 'dashboard',
    path: '/dashboard',
    target: () => {},
  },
]);
const router = kmRouter.makeRouter(routes, { defaultRoute: 'home' });

router.history.subscribe((history) => {
  console.log('history:', history);
});
