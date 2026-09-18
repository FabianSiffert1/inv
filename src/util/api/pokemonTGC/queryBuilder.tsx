import axios from 'axios'
import qs from 'qs'

import configuration from './configuration'

const getOptions = () => {
  const options = {
    headers: {}
  }
  if (configuration.apiKey) options.headers['X-Api-Key'] = configuration.apiKey

  return options
}

const get = async (type, args) => {
  const response = await axios.get(`${configuration.host}/${type}${args && '?' + qs.stringify(args)}`, getOptions())
  return response.data
}

export default (type: string) => ({
  find: (id: string) => {
    return axios(`${configuration.host}/${type}/${id}`, getOptions()).then((response) => response.data.data)
  },
  where: (args) => get(type, args),
  all: (args = {}) => {
    const data: unknown[] = []
    const getAll = (type, args) => {
      const page = args.page ? args.page + 1 : 1

      return get(type, { ...args, page })
        .then((response) => {
          data.push(...response.data)

          if (!response.totalCount || response.pageSize * response.page >= response.totalCount) {
            return data
          }

          return getAll(type, { ...args, page })
        })
    }
    return getAll(type, args)
  }
})
