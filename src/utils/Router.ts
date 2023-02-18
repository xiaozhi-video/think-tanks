import KoaRouter from 'koa-router'
import Koa from 'koa'

export default class Router extends KoaRouter {
  // @ts-ignore
  post<T1 = Koa.DefaultContext>(
    name: string,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1>,
  ): KoaRouter<Koa.DefaultState, T1>
  // @ts-ignore
  post<T1>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1>,
  ): KoaRouter<Koa.DefaultState, T1>
  // @ts-ignore
  post<T1,T2>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    middleware2: Koa.Middleware<Koa.DefaultState, T2>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1 & T2>,
  ): KoaRouter<Koa.DefaultState, & T1 & T2>
  // @ts-ignore
  get<T1 = Koa.DefaultContext>(
    name: string,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1>,
  ): KoaRouter<Koa.DefaultState, T1>
  // @ts-ignore
  get<T1>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1>,
  ): KoaRouter<Koa.DefaultState, T1>
  // @ts-ignore
  get<T1,T2>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    middleware2: Koa.Middleware<Koa.DefaultState, T2>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1 & T2>,
  ): KoaRouter<Koa.DefaultState, & T1 & T2>
  // @ts-ignore
  put<T1>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1>,
  ): KoaRouter<Koa.DefaultState, T1>
  // @ts-ignore
  put<T1,T2>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    middleware2: Koa.Middleware<Koa.DefaultState, T2>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1 & T2>,
  ): KoaRouter<Koa.DefaultState, & T1 & T2>
  // @ts-ignore
  del<T1>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1>,
  ): KoaRouter<Koa.DefaultState, T1>
  // @ts-ignore
  del<T1,T2>(
    name: string,
    middleware1: Koa.Middleware<Koa.DefaultState, T1>,
    middleware2: Koa.Middleware<Koa.DefaultState, T2>,
    routeHandler: KoaRouter.IMiddleware<Koa.DefaultState, T1 & T2>,
  ): KoaRouter<Koa.DefaultState, & T1 & T2>
}