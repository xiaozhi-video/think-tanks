const codeList = new Map<string, {
  code: string,
  key: string,
  destroy: NodeJS.Timeout
}>()
const authCode = {
  add(key: string) {
    authCode.destroy(key)
    const code = this.get()
    codeList.set(key, {
      code,
      key,
      destroy: setTimeout(() => {
        codeList.delete(key)
      }, authCode.validTime),
    })
    return code
  },
  has(key: string, code: string) {
    const acode = codeList.get(key)
    if(acode) {
      return acode.code === code
    }
    return false
  },
  get() {
    let code = ''
    for(let i = 0; i < authCode.length; i++) {
      code += Math.floor(Math.random() * 10).toString()
    }
    return code
  },
  list() {
    return codeList
  },
  destroy(key: string) {
    codeList.delete(key)
  },
  length: 6,
  validTime: 6000000,
}
export default authCode
