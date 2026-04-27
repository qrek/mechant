export const formatData = (raw) => {
  const res = {}

  Object.keys(raw).forEach((v) => {
    const project = raw[v]

    const formattedData = getFormattedData(project.data)

    res[project.id] = {
      ...formattedData
    }
  })

  return res
}

export const getFormattedData = (data) => {
  let formattedData = {}

  Object.keys(data).forEach((value, key) => {
    const field = data[value]

    formatField(field, value, formattedData)
  })

  return formattedData
}

export const formatField = (field, value, formattedData) => {
  switch (typeof field) {
    case 'string':
      formattedData[value] = field
      break
    case 'object':
      if (Array.isArray(field)) {
        if (field.length) {
          formattedData[value] = []
          field.forEach((o, i) => {
            formatField(o, i,formattedData[value])
          })
        } else
          formattedData[value] = null
      } else {
        if (field.link_type && field.link_type === 'Media' && field.url)
          formattedData[value] = field.url
        else if (value === 'poster')
          formattedData[value] = field.url
        else if (field.type && (field.type === 'heading1' || field.type === 'heading2' || field.type === 'paragraph') && field.text)
          formattedData[value] = field.text
        else if (Object.keys(field).length === 1)
          if (typeof field[Object.keys(field)[0]] === 'string')
            formattedData[value] = field[Object.keys(field)[0]]
          else if (field[Object.keys(field)[0]].id)
            formattedData[value] = field[Object.keys(field)[0]].id
        else
          formattedData[value] = field
      }
      break
    default:
      formattedData[value] = field
      break
  }
}
