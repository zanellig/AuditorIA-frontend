// "use client"

// import useSWR from "swr"

// const _fetcher = (...args: Parameters<typeof fetch>) => {
//   fetch(...args).then(res => {
//     res.json()
//   })
// }

// const _config = {
//   refreshInterval: 10000,
//   shouldRetryOnError: true,
//   errorRetryCount: 3,
//   errorRetryInterval: 1000,
//   loadingTimeout: 3000,
// }

// const _FETCH_OPTIONS = {
//   method: "GET",
//   headers: {
//     "Content-Type": "application/json",
//     "Access-Control-Allow-Origin": "*",
//   },
//   mode: "no-cors",
// }

// // export const response = _fetcher(`http://10.20.30.30:8000/task/all`, {
// //   headers: {
// //     "Content-Type": "application/json",
// //     "Access-Control-Allow-Origin": "*",
// //   },
// //   method: "GET",
// // })
// export function fetchData(url: string, paths: string) {
//   const { data, error, isLoading } = useSWR(`${url}${paths}`, _fetcher, _config)

//   return {
//     data,
//     error,
//     isLoading,
//   }
// }
