declare module "@types/koa" {
  interface DefaultContextExtends {
    parameterError: (data: any) => Promise<void>
  }
}