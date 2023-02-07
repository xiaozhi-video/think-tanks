declare module "koa-body" {
  export  default any
}

declare module "@types/koa" {
  interface DefaultContextExtends {
    body: any
  }
}