export function diff(n1, n2) {
  // 1.tag变了
  if (n1.tag !== n2.tag) {
    n1.el.replaceWith(document.createElement(n2.tag))
  }
  // 2.props变了
  // 3、children变了   
}