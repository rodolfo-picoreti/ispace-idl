
const uint8 = 'uint8_t'
const uint16 = 'uint16_t'
const uint32 = 'uint32_t'
const string = 'std::string'
const byte = uint8
const sequence = (type) => `std::vector<${type}>`
const required = (type) => `${type}`
const optional = (type) => `${type}`

const Var = '[a-zA-Z_][a-zA-Z0-9_]*'
const Type = '[a-zA-Z_][a-zA-Z0-9_()]*'
const TypeBlock = `type\\s+(${Var})\\s*\\{([a-zA-Z0-9_"():\\s^}]+)\\}`
const TypeInner = `((${Var})\\s*:\\s*(${Type})((.+)\\"(.+)\\")\\s*)`
const TypeProperties = `((${Var})\\s*\\(\\s*(\\w+)\\s*\\))`

const text = `
type frame {
  rows: uint16 "number of rows in the image"
  cols: uint16 "number of cols in the image"
  type: uint16 "opencv image type definition"
  data: sequence(bytes) "frame data"
}

type fps {
  fps: uint8 min(1) max(30) "desired camera fps" 
}
`

const eachMatch = (expression, text, lambda) => {
  var pattern = new RegExp(expression, 'g')
  var matches
  while ((matches = pattern.exec(text)) !== null) {
    lambda(matches)
  }
}

const types = { }

eachMatch(TypeBlock, text, (matches) => {
  const typeName = matches[1]
  const definition = matches[2]
  types[typeName] = { }

  eachMatch(TypeInner, definition, (matches) => {
    const key = matches[2]
    const type = matches[3]
    const properties = matches[5]
    const description = matches[6]

    types[typeName][key] = {
      type: type,
      description: description,
      properties: { }
    }

    eachMatch(TypeProperties, properties, (matches) => {
      const prop = matches[2]
      const value = matches[3]
      types[typeName][key]['properties'][prop] = value 
    })
  })
})

console.log(JSON.stringify(types, null, 2))