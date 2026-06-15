export const toBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext("2d").drawImage(img, 0, 0)
      resolve(canvas.toDataURL("image/jpeg"))
    }
    img.src = url
  })
}