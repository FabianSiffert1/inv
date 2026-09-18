import axios from 'axios'
import qs from 'qs'

import configuration from './configuration'

const pageSize = 250
const maximumPages = 40

export interface QueryArgs {
  q?: string
  orderBy?: string
  page?: number
  pageSize?: number
}

interface PaginatedResponse<TResource> {
  data: TResource[]
  page?: number
  pageSize?: number
  count?: number
  totalCount?: number
}

interface SingleResponse<TResource> {
  data: TResource
}

const requestConfiguration = (signal?: AbortSignal) => ({
  headers: configuration.apiKey ? { 'X-Api-Key': configuration.apiKey } : {},
  signal
})

const get = async <TResponse,>(type: string, args: QueryArgs, signal?: AbortSignal): Promise<TResponse> => {
  const query = qs.stringify(args)
  const url = query.length > 0 ? `${configuration.host}/${type}?${query}` : `${configuration.host}/${type}`
  const response = await axios.get<TResponse>(url, requestConfiguration(signal))
  return response.data
}

export default <TResource,>(type: string) => ({
  find: async (id: string, signal?: AbortSignal): Promise<TResource> => {
    const response = await axios.get<SingleResponse<TResource>>(`${configuration.host}/${type}/${id}`, requestConfiguration(signal))
    return response.data.data
  },

  where: (args: QueryArgs, signal?: AbortSignal): Promise<PaginatedResponse<TResource>> =>
    get<PaginatedResponse<TResource>>(type, args, signal),

  all: async (args: QueryArgs = {}, signal?: AbortSignal): Promise<TResource[]> => {
    const collected: TResource[] = []

    for (let page = 1; page <= maximumPages; page++) {
      const response = await get<PaginatedResponse<TResource>>(type, { ...args, page, pageSize }, signal)
      collected.push(...response.data)

      const totalCount = response.totalCount
      const receivedPageSize = response.pageSize ?? pageSize
      if (totalCount == undefined || totalCount == 0 || receivedPageSize * page >= totalCount) {
        break
      }
    }

    return collected
  }
})
