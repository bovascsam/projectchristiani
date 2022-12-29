export const listCategoryType = `query ListCategoryType($enum: String!) {
    enum: __type(name: $enum) {
      enumValues {
        name
      }
    }
  }`;