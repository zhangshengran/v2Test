import { reactive } from "../reactive"
export function ref(value) {
  let wrapper = {
    value: value
  }
  let react = reactive(wrapper)
  return react
}